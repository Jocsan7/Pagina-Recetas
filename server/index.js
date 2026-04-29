import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import { adminOnly, authRequired } from "./middleware/auth.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

async function getOrCreateCart(userId) {
  const [existing] = await pool.query("SELECT id FROM carts WHERE user_id = ?", [userId]);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await pool.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  return result.insertId;
}

app.get("/api/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ message: "API y base de datos conectadas." });
  } catch (error) {
    res.status(500).json({ message: "No fue posible conectar con MySQL.", detail: error.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    password,
    telefono,
    direccion
  } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ message: "Nombre, apellido, correo y contrasena son obligatorios." });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(409).json({ message: "Ese correo ya esta registrado." });
    }

    const passwordHash = hashPassword(password);
    const [result] = await pool.query(
      `INSERT INTO users (nombre, apellido, email, password_hash, telefono, direccion, rol)
       VALUES (?, ?, ?, ?, ?, ?, 'cliente')`,
      [nombre, apellido, email, passwordHash, telefono || null, direccion || null]
    );

    await getOrCreateCart(result.insertId);

    const user = {
      id: result.insertId,
      nombre,
      email,
      rol: "cliente"
    };

    res.status(201).json({
      message: "Cuenta creada correctamente.",
      token: signToken(user),
      user
    });
  } catch (error) {
    res.status(500).json({ message: "No se pudo registrar el usuario.", detail: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contrasena son obligatorios." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, email, password_hash, rol FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    const userRow = rows[0];
    const isValid = hashPassword(password) === userRow.password_hash;

    if (!isValid) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    await getOrCreateCart(userRow.id);

    const user = {
      id: userRow.id,
      nombre: `${userRow.nombre} ${userRow.apellido}`.trim(),
      email: userRow.email,
      rol: userRow.rol
    };

    res.json({
      message: "Inicio de sesion correcto.",
      token: signToken(user),
      user
    });
  } catch (error) {
    res.status(500).json({ message: "No se pudo iniciar sesion.", detail: error.message });
  }
});

app.get("/api/categories", async (_, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, descripcion FROM categories ORDER BY nombre");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "No se pudieron obtener las categorias.", detail: error.message });
  }
});

app.get("/api/recipes", async (req, res) => {
  const { categoryId } = req.query;
  const params = [];
  let query = `
    SELECT r.id, r.nombre, r.descripcion, r.precio, r.imagen_url, r.destacada, r.stock,
           c.id AS categoria_id, c.nombre AS categoria
    FROM recipes r
    INNER JOIN categories c ON c.id = r.category_id
  `;

  if (categoryId && categoryId !== "all") {
    query += " WHERE r.category_id = ?";
    params.push(categoryId);
  }

  query += " ORDER BY r.destacada DESC, r.nombre ASC";

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "No se pudieron obtener las recetas.", detail: error.message });
  }
});

app.get("/api/cart", authRequired, async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);
    const [items] = await pool.query(
      `SELECT ci.id, ci.quantity, r.id AS recipe_id, r.nombre, r.precio, r.imagen_url
       FROM cart_items ci
       INNER JOIN recipes r ON r.id = ci.recipe_id
       WHERE ci.cart_id = ?
       ORDER BY ci.id DESC`,
      [cartId]
    );

    const total = items.reduce((sum, item) => sum + Number(item.precio) * item.quantity, 0);
    res.json({ id: cartId, items, total });
  } catch (error) {
    res.status(500).json({ message: "No se pudo cargar el carrito.", detail: error.message });
  }
});

app.post("/api/cart/items", authRequired, async (req, res) => {
  const { recipeId, quantity = 1 } = req.body;

  if (!recipeId) {
    return res.status(400).json({ message: "La receta es obligatoria." });
  }

  try {
    const cartId = await getOrCreateCart(req.user.id);
    const [existing] = await pool.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND recipe_id = ?",
      [cartId, recipeId]
    );

    if (existing.length > 0) {
      await pool.query("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [quantity, existing[0].id]);
    } else {
      await pool.query("INSERT INTO cart_items (cart_id, recipe_id, quantity) VALUES (?, ?, ?)", [cartId, recipeId, quantity]);
    }

    res.status(201).json({ message: "Producto agregado al carrito." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo agregar al carrito.", detail: error.message });
  }
});

app.put("/api/cart/items/:id", authRequired, async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "La cantidad debe ser mayor a cero." });
  }

  try {
    const cartId = await getOrCreateCart(req.user.id);
    const [result] = await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?", [
      quantity,
      req.params.id,
      cartId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item no encontrado en el carrito." });
    }

    res.json({ message: "Cantidad actualizada." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo actualizar el carrito.", detail: error.message });
  }
});

app.delete("/api/cart/items/:id", authRequired, async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);
    const [result] = await pool.query("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", [req.params.id, cartId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item no encontrado en el carrito." });
    }

    res.json({ message: "Producto eliminado del carrito." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo eliminar el item.", detail: error.message });
  }
});

app.post("/api/orders/checkout", authRequired, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [cartRows] = await connection.query("SELECT id FROM carts WHERE user_id = ?", [req.user.id]);

    if (cartRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "No existe un carrito activo para este usuario." });
    }

    const cartId = cartRows[0].id;
    const [items] = await connection.query(
      `SELECT ci.recipe_id, ci.quantity, r.precio, r.nombre
       FROM cart_items ci
       INNER JOIN recipes r ON r.id = ci.recipe_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "El carrito esta vacio." });
    }

    const total = items.reduce((sum, item) => sum + Number(item.precio) * item.quantity, 0);
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total, estado) VALUES (?, ?, 'pagado')",
      [req.user.id, total]
    );

    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, recipe_id, quantity, precio_unitario) VALUES (?, ?, ?, ?)",
        [orderResult.insertId, item.recipe_id, item.quantity, item.precio]
      );
    }

    await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    await connection.commit();

    res.status(201).json({ message: "Compra realizada correctamente.", orderId: orderResult.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "No se pudo completar la compra.", detail: error.message });
  } finally {
    connection.release();
  }
});

app.get("/api/admin/users", authRequired, adminOnly, async (_, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, email, telefono, direccion, rol, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "No se pudo obtener la lista de usuarios.", detail: error.message });
  }
});

app.post("/api/admin/users", authRequired, adminOnly, async (req, res) => {
  const { nombre, apellido, email, password, telefono, direccion, rol } = req.body;

  if (!nombre || !apellido || !email || !password || !rol) {
    return res.status(400).json({ message: "Completa todos los campos obligatorios del usuario." });
  }

  try {
    const passwordHash = hashPassword(password);
    const [result] = await pool.query(
      `INSERT INTO users (nombre, apellido, email, password_hash, telefono, direccion, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, email, passwordHash, telefono || null, direccion || null, rol]
    );

    await getOrCreateCart(result.insertId);

    res.status(201).json({ message: "Usuario creado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo crear el usuario.", detail: error.message });
  }
});

app.put("/api/admin/users/:id", authRequired, adminOnly, async (req, res) => {
  const { nombre, apellido, email, telefono, direccion, rol, password } = req.body;

  try {
    if (password) {
      const passwordHash = hashPassword(password);
      await pool.query(
        `UPDATE users
         SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?, rol = ?, password_hash = ?
         WHERE id = ?`,
        [nombre, apellido, email, telefono || null, direccion || null, rol, passwordHash, req.params.id]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?, rol = ?
         WHERE id = ?`,
        [nombre, apellido, email, telefono || null, direccion || null, rol, req.params.id]
      );
    }

    res.json({ message: "Usuario actualizado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo actualizar el usuario.", detail: error.message });
  }
});

app.delete("/api/admin/users/:id", authRequired, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo eliminar el usuario.", detail: error.message });
  }
});

app.post("/api/admin/categories", authRequired, adminOnly, async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "El nombre de la categoria es obligatorio." });
  }

  try {
    await pool.query("INSERT INTO categories (nombre, descripcion) VALUES (?, ?)", [nombre, descripcion || null]);
    res.status(201).json({ message: "Categoria creada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo crear la categoria.", detail: error.message });
  }
});

app.put("/api/admin/categories/:id", authRequired, adminOnly, async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    await pool.query("UPDATE categories SET nombre = ?, descripcion = ? WHERE id = ?", [
      nombre,
      descripcion || null,
      req.params.id
    ]);
    res.json({ message: "Categoria actualizada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo actualizar la categoria.", detail: error.message });
  }
});

app.delete("/api/admin/categories/:id", authRequired, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Categoria eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo eliminar la categoria.", detail: error.message });
  }
});

app.post("/api/admin/recipes", authRequired, adminOnly, async (req, res) => {
  const { nombre, descripcion, precio, imagen_url, category_id, destacada, stock } = req.body;

  if (!nombre || !descripcion || !precio || !imagen_url || !category_id) {
    return res.status(400).json({ message: "Completa los campos obligatorios de la receta." });
  }

  try {
    await pool.query(
      `INSERT INTO recipes (nombre, descripcion, precio, imagen_url, category_id, destacada, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, precio, imagen_url, category_id, destacada ? 1 : 0, stock || 0]
    );
    res.status(201).json({ message: "Receta creada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo crear la receta.", detail: error.message });
  }
});

app.put("/api/admin/recipes/:id", authRequired, adminOnly, async (req, res) => {
  const { nombre, descripcion, precio, imagen_url, category_id, destacada, stock } = req.body;

  try {
    await pool.query(
      `UPDATE recipes
       SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, category_id = ?, destacada = ?, stock = ?
       WHERE id = ?`,
      [nombre, descripcion, precio, imagen_url, category_id, destacada ? 1 : 0, stock || 0, req.params.id]
    );
    res.json({ message: "Receta actualizada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo actualizar la receta.", detail: error.message });
  }
});

app.delete("/api/admin/recipes/:id", authRequired, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM recipes WHERE id = ?", [req.params.id]);
    res.json({ message: "Receta eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo eliminar la receta.", detail: error.message });
  }
});

async function startServer() {
  try {
    await pool.query("SELECT 1");
    app.listen(port, () => {
      console.log(`Servidor API corriendo en http://localhost:${port}`);
      console.log("Conexion MySQL verificada correctamente.");
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor porque MySQL no acepto la conexion.");
    console.error("Revisa el archivo .env y confirma tu usuario, contrasena y base de datos.");
    console.error(`Detalle: ${error.message}`);
    process.exit(1);
  }
}

startServer();

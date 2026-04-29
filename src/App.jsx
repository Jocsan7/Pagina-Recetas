import { useEffect, useState } from "react";
import { api } from "./services/api";
import "./App.css";
import "./estilos/global.css";

const initialRegister = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  telefono: "",
  direccion: ""
};

const initialUserForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  telefono: "",
  direccion: "",
  rol: "cliente"
};

const initialCategoryForm = {
  nombre: "",
  descripcion: ""
};

const initialRecipeForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  imagen_url: "",
  category_id: "",
  destacada: true,
  stock: 10
};

function App() {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [users, setUsers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [authMode, setAuthMode] = useState("login");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegister);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [recipeForm, setRecipeForm] = useState(initialRecipeForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [activePanel, setActivePanel] = useState("catalogo");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    return token && savedUser ? { token, user: JSON.parse(savedUser) } : null;
  });

  useEffect(() => {
    async function syncPublicData() {
      try {
        const [fetchedCategories, fetchedRecipes] = await Promise.all([
          api.getCategories(),
          api.getRecipes(selectedCategory)
        ]);

        setCategories(fetchedCategories);
        setRecipes(fetchedRecipes);
        setRecipeForm((prev) =>
          prev.category_id ? prev : { ...prev, category_id: fetchedCategories[0]?.id || "" }
        );
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    syncPublicData();
  }, [selectedCategory]);

  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    if (session?.token) {
      loadCart(session.token);

      if (session.user.rol === "admin") {
        loadUsers(session.token);
      }
    }
  }, [session]);

  async function checkBackend() {
    try {
      await api.health();
      setIsBackendReady(true);
    } catch {
      setIsBackendReady(false);
    }
  }

  async function loadPublicData() {
    const [fetchedCategories, fetchedRecipes] = await Promise.all([
      api.getCategories(),
      api.getRecipes(selectedCategory)
    ]);

    setCategories(fetchedCategories);
    setRecipes(fetchedRecipes);
    setRecipeForm((prev) =>
      prev.category_id ? prev : { ...prev, category_id: fetchedCategories[0]?.id || "" }
    );
  }

  async function loadCart(token) {
    try {
      const data = await api.getCart(token);
      setCart(data);
    } catch (cartError) {
      setError(cartError.message);
    }
  }

  async function loadUsers(token) {
    try {
      const data = await api.admin.getUsers(token);
      setUsers(data);
    } catch (usersError) {
      setError(usersError.message);
    }
  }

  function persistSession(authData) {
    setSession(authData);
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
    setMessage(`Bienvenido, ${authData.user.nombre}.`);
    setError("");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSession(null);
    setCart({ items: [], total: 0 });
    setUsers([]);
    setActivePanel("catalogo");
    setMessage("Sesion cerrada correctamente.");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.login(credentials);
      persistSession(data);
    } catch (loginError) {
      setError(loginError.message);
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.register(registerData);
      persistSession(data);
      setRegisterData(initialRegister);
    } catch (registerError) {
      setError(registerError.message);
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddToCart(recipeId) {
    if (!session?.token) {
      setError("Primero inicia sesion para agregar productos al carrito.");
      return;
    }

    try {
      await api.addToCart({ recipeId, quantity: 1 }, session.token);
      await loadCart(session.token);
      setMessage("Producto agregado al carrito.");
      setError("");
    } catch (cartError) {
      setError(cartError.message);
    }
  }

  async function handleCartQuantity(itemId, quantity) {
    try {
      await api.updateCartItem(itemId, { quantity }, session.token);
      await loadCart(session.token);
    } catch (cartError) {
      setError(cartError.message);
    }
  }

  async function handleRemoveCartItem(itemId) {
    try {
      await api.removeCartItem(itemId, session.token);
      await loadCart(session.token);
      setMessage("Producto eliminado del carrito.");
    } catch (cartError) {
      setError(cartError.message);
    }
  }

  async function handleCheckout() {
    try {
      const data = await api.checkout(session.token);
      await loadCart(session.token);
      setMessage(`Compra realizada. Orden #${data.orderId}.`);
      setActivePanel("catalogo");
    } catch (checkoutError) {
      setError(checkoutError.message);
    }
  }

  async function handleUserSubmit(event) {
    event.preventDefault();

    try {
      if (editingUserId) {
        await api.admin.updateUser(editingUserId, userForm, session.token);
        setMessage("Usuario actualizado.");
      } else {
        await api.admin.createUser(userForm, session.token);
        setMessage("Usuario creado.");
      }

      setUserForm(initialUserForm);
      setEditingUserId(null);
      await loadUsers(session.token);
    } catch (userError) {
      setError(userError.message);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();

    try {
      if (editingCategoryId) {
        await api.admin.updateCategory(editingCategoryId, categoryForm, session.token);
        setMessage("Categoria actualizada.");
      } else {
        await api.admin.createCategory(categoryForm, session.token);
        setMessage("Categoria creada.");
      }

      setCategoryForm(initialCategoryForm);
      setEditingCategoryId(null);
      await loadPublicData();
    } catch (categoryError) {
      setError(categoryError.message);
    }
  }

  async function handleRecipeSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        ...recipeForm,
        precio: Number(recipeForm.precio),
        stock: Number(recipeForm.stock),
        category_id: Number(recipeForm.category_id)
      };

      if (editingRecipeId) {
        await api.admin.updateRecipe(editingRecipeId, payload, session.token);
        setMessage("Receta actualizada.");
      } else {
        await api.admin.createRecipe(payload, session.token);
        setMessage("Receta creada.");
      }

      setRecipeForm((prev) => ({
        ...initialRecipeForm,
        category_id: categories[0]?.id || "",
        destacada: prev.destacada
      }));
      setEditingRecipeId(null);
      await loadPublicData();
    } catch (recipeError) {
      setError(recipeError.message);
    }
  }

  async function deleteUser(id) {
    try {
      await api.admin.deleteUser(id, session.token);
      await loadUsers(session.token);
      setMessage("Usuario eliminado.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function deleteCategory(id) {
    try {
      await api.admin.deleteCategory(id, session.token);
      await loadPublicData();
      setMessage("Categoria eliminada.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function deleteRecipe(id) {
    try {
      await api.admin.deleteRecipe(id, session.token);
      await loadPublicData();
      setMessage("Receta eliminada.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  const featured = recipes.find((recipe) => recipe.destacada) || recipes[0];
  const isAdmin = session?.user?.rol === "admin";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Recetario Commerce</p>
          <h1>Pagina de recetas con compra, roles y gestion completa</h1>
        </div>

        <div className="topbar-actions">
          <button className={`ghost-btn ${activePanel === "catalogo" ? "is-active" : ""}`} onClick={() => setActivePanel("catalogo")}>
            Catalogo
          </button>
          {session && (
            <button className={`ghost-btn ${activePanel === "carrito" ? "is-active" : ""}`} onClick={() => setActivePanel("carrito")}>
              Carrito ({cart.items.length})
            </button>
          )}
          {isAdmin && (
            <button className={`ghost-btn ${activePanel === "admin" ? "is-active" : ""}`} onClick={() => setActivePanel("admin")}>
              Panel admin
            </button>
          )}
          {session ? (
            <button className="primary-btn" onClick={logout}>
              Cerrar sesion
            </button>
          ) : null}
        </div>
      </header>

      {!isBackendReady && (
        <section className="status-banner warning">
          La API aun no responde. Importa `database/schema.sql` en MySQL Workbench, revisa `.env` y ejecuta `npm run server`.
        </section>
      )}

      {message && <section className="status-banner success">{message}</section>}
      {error && <section className="status-banner error">{error}</section>}

      <main className="main-grid">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Experiencia de tienda</p>
            <h2>{featured?.nombre || "Recetas listas para tu tienda"}</h2>
            <p>
              {featured?.descripcion ||
                "Autenticacion con clientes y administrador, carrito funcional y panel CRUD para categorias, recetas y usuarios."}
            </p>
            <div className="hero-badges">
              <span>Login y registro</span>
              <span>Roles por usuario</span>
              <span>Carrito y compra</span>
              <span>MySQL listo</span>
            </div>
          </div>

          {featured?.imagen_url ? <img src={featured.imagen_url} alt={featured.nombre} className="hero-image" /> : null}
        </section>

        {!session ? (
          <section className="auth-panel">
            <div className="auth-toggle">
              <button className={authMode === "login" ? "is-active" : ""} onClick={() => setAuthMode("login")}>
                Iniciar sesion
              </button>
              <button className={authMode === "register" ? "is-active" : ""} onClick={() => setAuthMode("register")}>
                Crear cuenta
              </button>
            </div>

            {authMode === "login" ? (
              <form className="form-card" onSubmit={handleLogin}>
                <h3>Acceso para clientes y admin</h3>
                <input
                  type="email"
                  placeholder="Correo electronico"
                  value={credentials.email}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Contrasena"
                  value={credentials.password}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                />
                <button className="primary-btn" type="submit" disabled={isLoading}>
                  {isLoading ? "Ingresando..." : "Entrar"}
                </button>
                <p className="helper-text">Clientes semilla: contrasena 1234. Admin: admin@recetas.com / 4321.</p>
              </form>
            ) : (
              <form className="form-card" onSubmit={handleRegister}>
                <h3>Crear cuenta nueva</h3>
                <div className="form-grid">
                  <input
                    placeholder="Nombre"
                    value={registerData.nombre}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, nombre: event.target.value }))}
                  />
                  <input
                    placeholder="Apellido"
                    value={registerData.apellido}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, apellido: event.target.value }))}
                  />
                  <input
                    type="email"
                    placeholder="Correo"
                    value={registerData.email}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  <input
                    type="password"
                    placeholder="Contrasena"
                    value={registerData.password}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, password: event.target.value }))}
                  />
                  <input
                    placeholder="Telefono"
                    value={registerData.telefono}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, telefono: event.target.value }))}
                  />
                  <input
                    placeholder="Direccion"
                    value={registerData.direccion}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, direccion: event.target.value }))}
                  />
                </div>
                <button className="primary-btn" type="submit" disabled={isLoading}>
                  {isLoading ? "Creando..." : "Registrar cuenta"}
                </button>
              </form>
            )}
          </section>
        ) : (
          <section className="welcome-panel">
            <div className="welcome-card">
              <p className="eyebrow">Sesion activa</p>
              <h3>{session.user.nombre}</h3>
              <p>{session.user.email}</p>
              <span className={`role-pill ${session.user.rol}`}>{session.user.rol}</span>
            </div>
            <div className="metrics-grid">
              <article>
                <strong>{recipes.length}</strong>
                <span>recetas disponibles</span>
              </article>
              <article>
                <strong>{categories.length}</strong>
                <span>categorias activas</span>
              </article>
              <article>
                <strong>${Number(cart.total || 0).toFixed(2)}</strong>
                <span>total en carrito</span>
              </article>
            </div>
          </section>
        )}

        <section className="catalog-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Catalogo principal</p>
              <h3>Recetas disponibles</h3>
            </div>
            <div className="category-strip">
              <button className={selectedCategory === "all" ? "is-active" : ""} onClick={() => setSelectedCategory("all")}>
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={String(selectedCategory) === String(category.id) ? "is-active" : ""}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.nombre}
                </button>
              ))}
            </div>
          </div>

          {activePanel === "catalogo" && (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <article className="recipe-card" key={recipe.id}>
                  <img src={recipe.imagen_url} alt={recipe.nombre} />
                  <div className="recipe-body">
                    <div className="recipe-topline">
                      <span>{recipe.categoria}</span>
                      {recipe.destacada ? <strong>Destacada</strong> : null}
                    </div>
                    <h4>{recipe.nombre}</h4>
                    <p>{recipe.descripcion}</p>
                    <div className="recipe-footer">
                      <div>
                        <strong>${Number(recipe.precio).toFixed(2)}</strong>
                        <span>Stock: {recipe.stock}</span>
                      </div>
                      <button className="primary-btn" onClick={() => handleAddToCart(recipe.id)}>
                        Agregar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activePanel === "carrito" && session && (
            <div className="cart-panel">
              <div className="cart-list">
                {cart.items.length === 0 ? (
                  <p className="empty-state">Tu carrito esta vacio.</p>
                ) : (
                  cart.items.map((item) => (
                    <article className="cart-item" key={item.id}>
                      <img src={item.imagen_url} alt={item.nombre} />
                      <div>
                        <h4>{item.nombre}</h4>
                        <p>${Number(item.precio).toFixed(2)} por unidad</p>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => handleCartQuantity(item.id, Number(event.target.value))}
                      />
                      <button className="ghost-btn" onClick={() => handleRemoveCartItem(item.id)}>
                        Quitar
                      </button>
                    </article>
                  ))
                )}
              </div>
              <aside className="cart-summary">
                <p className="eyebrow">Resumen</p>
                <h3>${Number(cart.total || 0).toFixed(2)}</h3>
                <p>{cart.items.length} productos seleccionados</p>
                <button className="primary-btn" onClick={handleCheckout} disabled={!cart.items.length}>
                  Comprar ahora
                </button>
              </aside>
            </div>
          )}

          {activePanel === "admin" && isAdmin && (
            <div className="admin-grid">
              <section className="form-card">
                <h3>{editingUserId ? "Editar usuario" : "Crear usuario"}</h3>
                <form onSubmit={handleUserSubmit}>
                  <div className="form-grid">
                    <input placeholder="Nombre" value={userForm.nombre} onChange={(e) => setUserForm((p) => ({ ...p, nombre: e.target.value }))} />
                    <input placeholder="Apellido" value={userForm.apellido} onChange={(e) => setUserForm((p) => ({ ...p, apellido: e.target.value }))} />
                    <input type="email" placeholder="Correo" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} />
                    <input type="password" placeholder="Contrasena" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} />
                    <input placeholder="Telefono" value={userForm.telefono} onChange={(e) => setUserForm((p) => ({ ...p, telefono: e.target.value }))} />
                    <input placeholder="Direccion" value={userForm.direccion} onChange={(e) => setUserForm((p) => ({ ...p, direccion: e.target.value }))} />
                    <select value={userForm.rol} onChange={(e) => setUserForm((p) => ({ ...p, rol: e.target.value }))}>
                      <option value="cliente">cliente</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button className="primary-btn" type="submit">{editingUserId ? "Guardar usuario" : "Crear usuario"}</button>
                    {editingUserId ? (
                      <button className="ghost-btn" type="button" onClick={() => { setEditingUserId(null); setUserForm(initialUserForm); }}>
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="form-card">
                <h3>{editingCategoryId ? "Editar categoria" : "Crear categoria"}</h3>
                <form onSubmit={handleCategorySubmit}>
                  <input placeholder="Nombre" value={categoryForm.nombre} onChange={(e) => setCategoryForm((p) => ({ ...p, nombre: e.target.value }))} />
                  <textarea placeholder="Descripcion" value={categoryForm.descripcion} onChange={(e) => setCategoryForm((p) => ({ ...p, descripcion: e.target.value }))} />
                  <div className="form-actions">
                    <button className="primary-btn" type="submit">{editingCategoryId ? "Guardar categoria" : "Crear categoria"}</button>
                    {editingCategoryId ? (
                      <button className="ghost-btn" type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm(initialCategoryForm); }}>
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="form-card full-span">
                <h3>{editingRecipeId ? "Editar receta" : "Crear receta"}</h3>
                <form onSubmit={handleRecipeSubmit}>
                  <div className="form-grid">
                    <input placeholder="Nombre de receta" value={recipeForm.nombre} onChange={(e) => setRecipeForm((p) => ({ ...p, nombre: e.target.value }))} />
                    <input type="number" min="0" step="0.01" placeholder="Precio" value={recipeForm.precio} onChange={(e) => setRecipeForm((p) => ({ ...p, precio: e.target.value }))} />
                    <input placeholder="Imagen URL" value={recipeForm.imagen_url} onChange={(e) => setRecipeForm((p) => ({ ...p, imagen_url: e.target.value }))} />
                    <select value={recipeForm.category_id} onChange={(e) => setRecipeForm((p) => ({ ...p, category_id: e.target.value }))}>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                    <input type="number" min="0" placeholder="Stock" value={recipeForm.stock} onChange={(e) => setRecipeForm((p) => ({ ...p, stock: e.target.value }))} />
                    <label className="checkbox-row">
                      <input type="checkbox" checked={recipeForm.destacada} onChange={(e) => setRecipeForm((p) => ({ ...p, destacada: e.target.checked }))} />
                      Receta destacada
                    </label>
                  </div>
                  <textarea placeholder="Descripcion" value={recipeForm.descripcion} onChange={(e) => setRecipeForm((p) => ({ ...p, descripcion: e.target.value }))} />
                  <div className="form-actions">
                    <button className="primary-btn" type="submit">{editingRecipeId ? "Guardar receta" : "Crear receta"}</button>
                    {editingRecipeId ? (
                      <button className="ghost-btn" type="button" onClick={() => { setEditingRecipeId(null); setRecipeForm(initialRecipeForm); }}>
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="table-card full-span">
                <h3>Usuarios registrados</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Telefono</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.nombre} {user.apellido}</td>
                          <td>{user.email}</td>
                          <td>{user.rol}</td>
                          <td>{user.telefono || "-"}</td>
                          <td className="action-row">
                            <button
                              className="ghost-btn"
                              onClick={() => {
                                setEditingUserId(user.id);
                                setUserForm({
                                  nombre: user.nombre,
                                  apellido: user.apellido,
                                  email: user.email,
                                  password: "",
                                  telefono: user.telefono || "",
                                  direccion: user.direccion || "",
                                  rol: user.rol
                                });
                              }}
                            >
                              Editar
                            </button>
                            <button className="ghost-btn danger" onClick={() => deleteUser(user.id)}>Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="table-card">
                <h3>Categorias</h3>
                {categories.map((category) => (
                  <div className="mini-row" key={category.id}>
                    <div>
                      <strong>{category.nombre}</strong>
                      <p>{category.descripcion}</p>
                    </div>
                    <div className="action-row">
                      <button className="ghost-btn" onClick={() => { setEditingCategoryId(category.id); setCategoryForm({ nombre: category.nombre, descripcion: category.descripcion || "" }); }}>
                        Editar
                      </button>
                      <button className="ghost-btn danger" onClick={() => deleteCategory(category.id)}>Borrar</button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="table-card">
                <h3>Recetas</h3>
                {recipes.map((recipe) => (
                  <div className="mini-row" key={recipe.id}>
                    <div>
                      <strong>{recipe.nombre}</strong>
                      <p>{recipe.categoria} - ${Number(recipe.precio).toFixed(2)}</p>
                    </div>
                    <div className="action-row">
                      <button
                        className="ghost-btn"
                        onClick={() => {
                          setEditingRecipeId(recipe.id);
                          setRecipeForm({
                            nombre: recipe.nombre,
                            descripcion: recipe.descripcion,
                            precio: recipe.precio,
                            imagen_url: recipe.imagen_url,
                            category_id: recipe.categoria_id,
                            destacada: Boolean(recipe.destacada),
                            stock: recipe.stock
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button className="ghost-btn danger" onClick={() => deleteRecipe(recipe.id)}>Borrar</button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

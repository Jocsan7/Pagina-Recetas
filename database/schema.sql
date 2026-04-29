CREATE DATABASE IF NOT EXISTS pagina_recetas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pagina_recetas;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30),
  direccion VARCHAR(180),
  rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(180)
);

CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(255) NOT NULL,
  destacada TINYINT(1) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipes_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  recipe_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT uq_cart_recipe UNIQUE (cart_id, recipe_id)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('pagado', 'pendiente', 'cancelado') NOT NULL DEFAULT 'pagado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  recipe_id INT NOT NULL,
  quantity INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

INSERT INTO categories (nombre, descripcion) VALUES
('Comida', 'Platos fuertes y recetas saladas.'),
('Bebida', 'Opciones frias y refrescantes.'),
('Postres', 'Dulces caseros y reposteria.'),
('Desayunos', 'Ideas energicas para empezar el dia.');

INSERT INTO recipes (nombre, descripcion, precio, imagen_url, destacada, stock, category_id) VALUES
('Hamburguesa Gourmet', 'Pan artesanal, carne jugosa y cebolla caramelizada.', 145.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80', 1, 20, 1),
('Limonada Natural', 'Bebida fresca con limon recien exprimido y hojas de menta.', 55.00, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80', 1, 40, 2),
('Pastel de Chocolate', 'Bizcocho humedo con ganache intensa de cacao.', 95.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80', 1, 18, 3),
('Waffles de Frutos Rojos', 'Crujientes por fuera, suaves por dentro y con topping de frutos rojos.', 110.00, 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=900&q=80', 0, 16, 4),
('Tacos de Birria', 'Tortillas doradas con queso fundido y consome.', 135.00, 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=900&q=80', 0, 25, 1),
('Cheesecake de Fresa', 'Postre cremoso con base crujiente y salsa de fresa.', 98.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80', 0, 14, 3);

INSERT INTO users (nombre, apellido, email, password_hash, telefono, direccion, rol) VALUES
('Ana', 'Lopez', 'ana.lopez@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000001', 'CDMX, Mexico', 'cliente'),
('Carlos', 'Ramirez', 'carlos.ramirez@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000002', 'Guadalajara, Mexico', 'cliente'),
('Daniela', 'Morales', 'daniela.morales@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000003', 'Monterrey, Mexico', 'cliente'),
('Eduardo', 'Sanchez', 'eduardo.sanchez@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000004', 'Puebla, Mexico', 'cliente'),
('Fernanda', 'Torres', 'fernanda.torres@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000005', 'Merida, Mexico', 'cliente'),
('Gabriel', 'Cruz', 'gabriel.cruz@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000006', 'Queretaro, Mexico', 'cliente'),
('Helena', 'Navarro', 'helena.navarro@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000007', 'Toluca, Mexico', 'cliente'),
('Ivan', 'Herrera', 'ivan.herrera@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000008', 'Cancun, Mexico', 'cliente'),
('Julia', 'Mendoza', 'julia.mendoza@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000009', 'Leon, Mexico', 'cliente'),
('Kevin', 'Ortega', 'kevin.ortega@clientes.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '5510000010', 'Aguascalientes, Mexico', 'cliente'),
('Administrador', 'Principal', 'admin@recetas.com', 'fe2592b42a727e977f055947385b709cc82b16b9a87f88c6abf3900d65d0cdc3', '5519999999', 'Oficina Central', 'admin');

INSERT INTO carts (user_id)
SELECT id FROM users;

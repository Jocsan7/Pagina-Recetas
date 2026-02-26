import PropTypes from "prop-types";
import "./Productos.css";

const CATEGORIAS = ["Todas", "Comida", "Bebidas", "Postres"];

const PRODUCTOS = [
  {
    nombre: "Tacos de Pollo Asado",
    precio: "$120 MXN",
    desc: "Tortilla suave, pollo jugoso y salsa de la casa.",
    categoria: "Comida",
    img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Pasta Alfredo",
    precio: "$145 MXN",
    desc: "Salsa cremosa con toque de queso parmesano.",
    categoria: "Comida",
    img: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Ensalada Mediterranea",
    precio: "$110 MXN",
    desc: "Fresca, ligera y perfecta para cualquier hora.",
    categoria: "Comida",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Hamburguesa Casera",
    precio: "$139 MXN",
    desc: "Carne al punto con pan artesanal y vegetales.",
    categoria: "Comida",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Limonada Natural",
    precio: "$55 MXN",
    desc: "Refrescante y preparada al momento.",
    categoria: "Bebidas",
    img: "https://images.pexels.com/photos/616836/pexels-photo-616836.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    nombre: "Smoothie de Frutos Rojos",
    precio: "$68 MXN",
    desc: "Textura cremosa con fruta natural.",
    categoria: "Bebidas",
    img: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Cafe Frio",
    precio: "$60 MXN",
    desc: "Intenso, suave y con hielo.",
    categoria: "Bebidas",
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Chocolate Caliente",
    precio: "$58 MXN",
    desc: "Cremoso y reconfortante para dias frescos.",
    categoria: "Bebidas",
    img: "https://images.pexels.com/photos/239584/pexels-photo-239584.jpeg",
  },
  {
    nombre: "Brownie de Chocolate",
    precio: "$75 MXN",
    desc: "Humedo por dentro y con capa crujiente arriba.",
    categoria: "Postres",
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Cheesecake de Fresa",
    precio: "$82 MXN",
    desc: "Base crocante y relleno suave de queso.",
    categoria: "Postres",
    img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Flan de Vainilla",
    precio: "$65 MXN",
    desc: "Clasico casero con caramelo dorado.",
    categoria: "Postres",
    img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    nombre: "Pay de Limon",
    precio: "$72 MXN",
    desc: "Acido dulce balanceado y textura ligera.",
    categoria: "Postres",
    img: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=1200&q=80",
  },
];

function Productos({ categoria, cambiarCategoria }) {
  const productosFiltrados =
    categoria === "Todas"
      ? PRODUCTOS
      : PRODUCTOS.filter((producto) => producto.categoria === categoria);

  return (
    <section className="productos">
      <h2>Nuestras Recetas</h2>
      <p className="filtroTexto">Categoria: {categoria}</p>
      <div className="filtrosCategorias" aria-label="Categorias de recetas">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            type="button"
            className={categoria === cat ? "activo" : ""}
            onClick={() => cambiarCategoria(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid-productos">
        {productosFiltrados.map((producto) => (
          <article className="card-producto" key={producto.nombre}>
            <img src={producto.img} alt={producto.nombre} loading="lazy" />
            <span className="categoriaProducto">{producto.categoria}</span>
            <h3>{producto.nombre}</h3>
            <p>{producto.desc}</p>
            <span className="precioProducto">{producto.precio}</span>
            <button type="button">Ver receta</button>
          </article>
        ))}
      </div>
    </section>
  );
}

Productos.propTypes = {
  categoria: PropTypes.string,
  cambiarCategoria: PropTypes.func,
};

Productos.defaultProps = {
  categoria: "Todas",
  cambiarCategoria: () => {},
};

export default Productos;

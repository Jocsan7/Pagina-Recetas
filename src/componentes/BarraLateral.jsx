import "./BarraLateral.css";

function BarraLateral({ categoriaActiva, cambiarCategoria }) {
  const categorias = ["Comida", "Bebida", "Postres"];

  return (
    <div className="barra-lateral">
      <h2>Categorías</h2>
      <ul>
        {categorias.map((cat) => (
          <li
            key={cat}
            className={categoriaActiva === cat ? "activo" : ""}
            onClick={() => cambiarCategoria(cat)}
          >
            {cat}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BarraLateral;
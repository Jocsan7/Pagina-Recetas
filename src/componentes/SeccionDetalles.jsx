import "./SeccionDetalles.css";

function SeccionDetalles() {
  return (
    <section className="seccion-detalles">
      <div className="detalle">
        <h3>📝 Ingredientes</h3>
        <ul>
          <li>2 tazas de harina</li>
          <li>1 taza de queso</li>
          <li>Salsa de tomate</li>
          <li>Especias al gusto</li>
        </ul>
      </div>

      <div className="detalle">
        <h3>👨‍🍳 Preparación</h3>
        <p>
          Mezclar los ingredientes, hornear durante 20 minutos y servir caliente.
        </p>
      </div>

      <div className="detalle">
        <h3>⏱ Tiempo</h3>
        <p>30 minutos</p>
      </div>

      <div className="detalle">
        <h3>⭐ Nivel</h3>
        <p>Fácil</p>
      </div>
    </section>
  );
}

export default SeccionDetalles;
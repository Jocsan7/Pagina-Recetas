import "./BarraNavegacion.css";

function BarraNavegacion({ abrirMenu }) {
  return (
    <div className="barra-navegacion">
      
      <button 
        className="menu-btn"
        onClick={abrirMenu}
      >
        ☰
      </button>

      <span className="titulo-navbar">
        🍳 Pagina Recetas
      </span>

    </div>
  );
}

export default BarraNavegacion;
import { useState } from "react";
import BarraNavegacion from "./componentes/BarraNavegacion";
import BarraLateral from "./componentes/BarraLateral";
import Inicio from "./paginas/inicio";
import "./estilos/layout.css";
import "./estilos/global.css";

function App() {
  const [categoria, setCategoria] = useState("Comida");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <div className="layout">
      <BarraNavegacion abrirMenu={toggleMenu} />

      <div className="contenido">
        <main>
          <Inicio categoria={categoria} />
        </main>
      </div>

      {/* Overlay oscuro al abrir menú */}
      {menuAbierto && (
        <>
          <div className="overlay" onClick={cerrarMenu}></div>

          <BarraLateral
            categoriaActiva={categoria}
            cambiarCategoria={(cat) => {
              setCategoria(cat);
              cerrarMenu();
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
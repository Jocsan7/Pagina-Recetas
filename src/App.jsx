import { useState } from "react";
import ContenedorTarjeta from "./ContenedorTarjeta";
import Encabezado from "./Encabezado";
import PieComponente from "./PieComponente";
import "./App.css";

function App() {
  const [vista, setVista] = useState("Inicio");
  const [categoria, setCategoria] = useState("Todas");

  return (
    <div className="appLayout">
      <Encabezado
        cambiarVista={setVista}
        vistaActual={vista}
        cambiarCategoria={setCategoria}
      />
      <div className="contenidoPrincipal">
        <ContenedorTarjeta
          vista={vista}
          categoria={categoria}
          cambiarVista={setVista}
          cambiarCategoria={setCategoria}
        />
      </div>
      <PieComponente />
    </div>
  );
}

export default App;

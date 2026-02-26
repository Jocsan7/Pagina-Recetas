import PropTypes from "prop-types";
import miLogo from "./assets/logo.png";
import facebookImg from "./assets/facebook.png";
import instagramImg from "./assets/logotipo-de-instagram.png";
import tiktokImg from "./assets/tikitoki.png";
import whatsappImg from "./assets/whatsapp.png";
import "./Encabezado.css";

const MENU_ITEMS = ["Inicio", "Categorias", "AcercaDe", "Contacto", "Sucursales"];

function Encabezado({ cambiarVista, vistaActual, cambiarCategoria }) {
  const irACategorias = () => {
    cambiarCategoria("Todas");
    cambiarVista("Productos");
  };

  return (
    <header className="encabezado">
      <div className="logoDiv">
        <img src={miLogo} alt="Logo tienda" />
      </div>

      <nav className="menuDiv" aria-label="Menu principal">
        <ul>
          {MENU_ITEMS.map((item) => (
            <li key={item}>
              <button
                type="button"
                className={
                  (item === "Categorias" && vistaActual === "Productos") ||
                  vistaActual === item
                    ? "activo"
                    : ""
                }
                onClick={() =>
                  item === "Categorias" ? irACategorias() : cambiarVista(item)
                }
              >
                {item === "AcercaDe" ? "Acerca de" : item}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="redesDiv">
        <a href="#" aria-label="WhatsApp">
          <img src={whatsappImg} alt="WhatsApp" />
        </a>
        <a href="#" aria-label="TikTok">
          <img src={tiktokImg} alt="TikTok" />
        </a>
        <a href="#" aria-label="Facebook">
          <img src={facebookImg} alt="Facebook" />
        </a>
        <a href="#" aria-label="Instagram">
          <img src={instagramImg} alt="Instagram" />
        </a>
      </div>
    </header>
  );
}

Encabezado.propTypes = {
  cambiarVista: PropTypes.func.isRequired,
  vistaActual: PropTypes.string.isRequired,
  cambiarCategoria: PropTypes.func.isRequired,
};

export default Encabezado;

import { useEffect, useState } from "react";
import AcercaDe from "./AcercaDe";
import Productos from "./Productos";
import Contacto from "./Contacto";
import Sucursales from "./Sucursales";
import PromosContenido from "./PromosContenido";
import "./ContenedorTarjeta.css";

const TENDENCIAS = [
  {
    titulo: "Recetas nuevas",
    texto: "Platos faciles para esta semana. Cocina rico con ingredientes simples.",
    categoria: "Comida",
    imagen:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80",
  },
  {
    titulo: "Bebidas refrescantes",
    texto: "Opciones frias y rapidas para acompanar cualquier comida.",
    categoria: "Bebidas",
    imagen:
      "https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    titulo: "Postres caseros",
    texto: "Dulces practicos para compartir en familia o con amigos.",
    categoria: "Postres",
    imagen:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=80",
  },
];

function ContenedorTarjeta({ vista, categoria, cambiarVista, cambiarCategoria }) {
  const vistas = {
    Inicio: (
      <Inicio cambiarVista={cambiarVista} cambiarCategoria={cambiarCategoria} />
    ),
    AcercaDe: <AcercaDe />,
    Productos: (
      <Productos categoria={categoria} cambiarCategoria={cambiarCategoria} />
    ),
    Contacto: <Contacto />,
    Sucursales: <Sucursales />,
  };

  const claseContenedor =
    vista === "Inicio" ? "contenedorDiv inicioCompleto" : "contenedorDiv";

  return <main className={claseContenedor}>{vistas[vista] || vistas.Inicio}</main>;
}

function Inicio({ cambiarVista, cambiarCategoria }) {
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActual((anterior) => (anterior + 1) % TENDENCIAS.length);
    }, 4500);

    return () => clearInterval(intervalo);
  }, []);

  const slideActual = TENDENCIAS[indiceActual];

  const abrirCategoria = (categoriaSeleccionada) => {
    cambiarCategoria(categoriaSeleccionada);
    cambiarVista("Productos");
  };

  return (
    <section className="inicioSeccion" aria-label="Inicio recetas">
      <article className="carruselHero">
        {TENDENCIAS.map((slide, indice) => (
          <div
            key={slide.titulo}
            className={`slideFondo ${indice === indiceActual ? "activo" : ""}`}
            style={{ backgroundImage: `url(${slide.imagen})` }}
            aria-hidden={indice !== indiceActual}
          />
        ))}

        <div className="overlayHero" />

        <div className="contenidoHero">
          <p className="subtituloHero">Recetas en tendencia</p>
          <h1>{slideActual.titulo}</h1>
          <p>{slideActual.texto}</p>
          <div className="heroAcciones">
            <button
              type="button"
              onClick={() => abrirCategoria(slideActual.categoria)}
            >
              Ver {slideActual.categoria}
            </button>
            <button type="button" onClick={() => abrirCategoria("Todas")}>
              Ver todo
            </button>
          </div>
        </div>

        <div className="indicadoresHero" aria-label="Cambiar slide">
          {TENDENCIAS.map((slide, indice) => (
            <button
              key={slide.titulo}
              type="button"
              className={indice === indiceActual ? "activo" : ""}
              onClick={() => setIndiceActual(indice)}
              aria-label={`Diapositiva ${indice + 1}`}
            />
          ))}
        </div>
      </article>

      <PromosContenido />
    </section>
  );
}

export default ContenedorTarjeta;

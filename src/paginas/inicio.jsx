import { useState, useEffect } from "react";
import "./inicio.css";

function Inicio() {
  const recetas = [
    {
      titulo: "Hamburguesa Gourmet",
      descripcion: "Jugosa hamburguesa con pan artesanal.",
      imagen: "https://images.unsplash.com/photo-1550547660-d9450f859349"
    },
    {
      titulo: "Limonada Natural",
      descripcion: "Refrescante bebida con limón fresco.",
      imagen: "https://images.unsplash.com/photo-1523362628745-0c100150b504"
    },
    {
      titulo: "Pastel de Chocolate",
      descripcion: "Postre suave y delicioso.",
      imagen: "https://aranzazu.com/wp-content/uploads/2020/04/pastel-chocolate-queso-2-1.webp"
    }
  ];

  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 1) % recetas.length);
    }, 4000);

    return () => clearInterval(intervalo);
  }, []);

  const recetaActual = recetas[indice];

  return (
    <div className="hero">
      <img src={recetaActual.imagen} alt="Receta" />

      <div className="overlay-info">
        <h1>{recetaActual.titulo}</h1>
        <p>{recetaActual.descripcion}</p>
      </div>
    </div>
  );
}

export default Inicio;
import { useState, useEffect } from "react";
import "./SeccionPrincipal.css";

function SeccionPrincipal() {
const recetas = [
  {
    nombre: "Tacos al Pastor",
    descripcion: "Deliciosos tacos tradicionales mexicanos con carne marinada.",
    imagen: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80"
  },
  {
    nombre: "Pizza Italiana",
    descripcion: "Pizza artesanal con ingredientes frescos y queso derretido.",
    imagen: "https://www.unileverfoodsolutions.es/dam/global-ufs/mcos/spain/acm/selling-story-calcmenu/Autentica-pizza-italina-header.jpg"
  },
  {
    nombre: "Hamburguesa Gourmet",
    descripcion: "Jugosa hamburguesa con pan artesanal y papas crujientes.",
    imagen: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80"
  }
];

  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((prevIndice) =>
        prevIndice === recetas.length - 1 ? 0 : prevIndice + 1
      );
    }, 4000);

    return () => clearInterval(intervalo);
  }, [recetas.length]);

  return (
    <section className="seccion-principal">
      <img
        src={recetas[indice].imagen}
        alt={recetas[indice].nombre}
        className="imagen-principal"
      />

      <div className="tarjeta-informacion">
        <h2>{recetas[indice].nombre}</h2>
        <p>{recetas[indice].descripcion}</p>
      </div>
    </section>
  );
}

export default SeccionPrincipal;

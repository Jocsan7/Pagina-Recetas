import "./AcercaDe.css";

function AcercaDe() {
  return (
    <section className="acercaDeDiv">
      <div className="acercaDeHero">
        <span className="acercaDeEtiqueta">Comunidad local</span>
        <h2>Cocina actual con enfoque practico</h2>
        <p className="acercaDeLead">
          Somos una pagina de recetas enfocada en platos versatiles para el dia a
          dia, reuniones familiares y ocasiones especiales. Buscamos equilibrio
          entre sabor, simplicidad y costo justo.
        </p>
      </div>

      <div className="acercaDeGrid">
        <article className="acercaDeCard cardMision">
          <h3>Mision</h3>
          <p>
            Compartir recetas claras y confiables para que cualquier persona
            cocine rico en casa sin complicaciones.
          </p>
        </article>
        <article className="acercaDeCard cardVision">
          <h3>Vision</h3>
          <p>
            Ser una referencia en recetas practicas en espanol, con una experiencia
            rapida de aprendizaje y contenido util para todos.
          </p>
        </article>
        <article className="acercaDeCard cardValores">
          <h3>Valores</h3>
          <ul>
            <li>Instrucciones claras y honestas</li>
            <li>Mejora continua de recetas</li>
            <li>Compromiso con la comunidad</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default AcercaDe;

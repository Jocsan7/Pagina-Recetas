import "./Contacto.css";

function Contacto() {
  return (
    <section className="contacto">
      <h2>Contactanos</h2>
      <p>Respondemos en menos de 24 horas habiles.</p>

      <div className="contactoApartados">
        <article className="apartadoCard cardHorario">
          <h3>Horario de atencion</h3>
          <p>Lunes a viernes: 9:00 a 20:00</p>
          <p>Sabado y domingo: 10:00 a 16:00</p>
        </article>

        <article className="apartadoCard cardAsesoria">
          <h3>Asesoria personalizada</h3>
          <p>
            Te ayudamos a elegir recetas segun tiempo, presupuesto e
            ingredientes.
          </p>
        </article>

        <article className="apartadoCard cardRedes">
          <h3>Canales directos</h3>
          <p>WhatsApp, Instagram y correo para dudas rapidas.</p>
        </article>
      </div>

      <form className="form-contacto">
        <input type="text" placeholder="Nombre" />
        <input type="email" placeholder="Correo electronico" />
        <input type="tel" placeholder="Telefono" />
        <textarea placeholder="Mensaje" rows="5" />
        <button type="button">Enviar mensaje</button>
      </form>
    </section>
  );
}

export default Contacto;

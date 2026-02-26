import "./PieComponente.css";

function PieComponente() {
  return (
    <>
      <footer className="pieDiv">
        <div className="pieBloque">
          <h4>Contacto</h4>
          <p>recetasjk@gmail.com</p>
          <p>+52 776 120 68 84</p>
        </div>
        <div className="pieBloque">
          <h4>Horario</h4>
          <p>Lunes a viernes: 10:00 a 20:00</p>
          <p>Sabado: 10:00 a 18:00</p>
        </div>
        <div className="pieBloque">
          <h4>Equipo</h4>
          <p>Jocsan y Karen</p>
        </div>
      </footer>

      <div className="pieLegal">
        Todos los derechos reservados a quien corresponda 2026
      </div>
    </>
  );
}

export default PieComponente;

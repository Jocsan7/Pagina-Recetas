import "./Sucursales.css";

const SUCURSALES = [
  {
    nombre: "Sucursal Huauchinango",
    direccion: "Centro, Huauchinango, Puebla.",
    telefono: "+52 776 000 0001",
    latitud: 20.180833,
    longitud: -98.049444,
  },
  {
    nombre: "Sucursal Xicotepec",
    direccion: "Centro, Xicotepec de Juarez, Puebla.",
    telefono: "+52 764 000 0002",
    latitud: 20.3,
    longitud: -97.966667,
  },
  {
    nombre: "Sucursal Zacatlan",
    direccion: "Centro, Zacatlan de las Manzanas, Puebla.",
    telefono: "+52 797 000 0003",
    latitud: 19.916667,
    longitud: -97.966667,
  },
];

function Sucursales() {
  return (
    <section className="sucursales">
      <h2>Nuestras sucursales</h2>
      <div className="lista-sucursales">
        {SUCURSALES.map((sucursal) => (
          <article className="sucursal" key={sucursal.nombre}>
            <h3>{sucursal.nombre}</h3>
            <p className="direccion">{sucursal.direccion}</p>
            <iframe
              title={`Mapa ${sucursal.nombre}`}
              src={`https://maps.google.com/maps?q=${sucursal.latitud},${sucursal.longitud}&z=15&output=embed`}
              loading="lazy"
            />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${sucursal.latitud},${sucursal.longitud}`}
              target="_blank"
              rel="noreferrer"
            >
              Como llegar
            </a>
            <p>{sucursal.telefono}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Sucursales;

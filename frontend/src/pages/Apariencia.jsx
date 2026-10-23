import { usePreferencias } from '../context/PreferenciasContext';
import { FONDOS } from '../utils/fondos';
import FondoApp from '../components/FondoApp';
import '../styles/Apariencia.css';

function Apariencia() {
  const { fondo, setFondo } = usePreferencias();

  return (
    <div className="apariencia">
      <h1>Apariencia</h1>
      <p className="apariencia-intro">
        Elegí el fondo de KDesk. Se guarda en este navegador, así que cada persona puede tener el suyo.
      </p>

      <div className="apariencia-fondos" role="radiogroup" aria-label="Fondo">
        {FONDOS.map((opcion) => (
          <button
            key={opcion.clave}
            type="button"
            role="radio"
            aria-checked={fondo === opcion.clave}
            className={`apariencia-fondo ${fondo === opcion.clave ? 'elegido' : ''}`}
            onClick={() => setFondo(opcion.clave)}
          >
            <span className="apariencia-vista">
              <FondoApp tipo={opcion.clave} contenido />
            </span>
            <strong>{opcion.etiqueta}</strong>
            <span className="apariencia-descripcion">{opcion.descripcion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Apariencia;

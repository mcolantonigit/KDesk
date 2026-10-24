import { formatearFechaHora } from '../utils/fechas';
import '../styles/ListaTicketsMovil.css';

// Lista de tickets del celular: una tarjeta por ticket, en lugar de la tabla.
function ListaTicketsMovil({ tickets, ordenPor, ordenAsc, opcionesOrden, onOrdenar, onAbrir }) {
  return (
    <div className="lista-movil">
      <div className="lista-movil-orden">
        <label>
          <span>Ordenar por</span>
          <select value={ordenPor} onChange={(evento) => onOrdenar(evento.target.value)}>
            {opcionesOrden.map((opcion) => (
              <option key={opcion.clave} value={opcion.clave}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => onOrdenar(ordenPor)}
          aria-label={ordenAsc ? 'Orden ascendente: cambiar a descendente' : 'Orden descendente: cambiar a ascendente'}
        >
          {ordenAsc ? '↑' : '↓'}
        </button>
      </div>

      {tickets.length === 0 ? (
        <p className="lista-movil-vacio">No hay tickets para mostrar</p>
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button type="button" className="lista-movil-tarjeta" onClick={() => onAbrir(ticket.id)}>
                <span className="lista-movil-fila">
                  <span className="lista-movil-numero">{ticket.numero}</span>
                  <span className="lista-movil-estado">{ticket.estado}</span>
                </span>
                <span className="lista-movil-titulo">{ticket.titulo}</span>
                <span className="lista-movil-fila">
                  <span className={`lista-movil-chip lista-movil-chip-${String(ticket.prioridad).toLowerCase()}`}>
                    {ticket.prioridad === 'Critica' ? 'Crítica' : ticket.prioridad}
                  </span>
                  <span className="lista-movil-fecha">{formatearFechaHora(ticket.fecha_creacion)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListaTicketsMovil;

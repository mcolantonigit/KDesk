import { useNavigate } from 'react-router-dom';
import Button from './Button';
import '../styles/TarjetasTickets.css';

const ESTADO_CERRADO = 'Cerrado';

function TarjetasTickets({ tickets, onCerrar }) {
  const navigate = useNavigate();

  if (tickets.length === 0) {
    return <p className="tarjetas-tickets-vacio">No hay tickets para mostrar</p>;
  }

  return (
    <div className="tarjetas-tickets">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="tarjeta-ticket" onClick={() => navigate(`/tickets/${ticket.id}`)}>
          <div className="tarjeta-ticket-header">
            <span className="tarjeta-ticket-numero">{ticket.numero}</span>
            <span className="tarjeta-ticket-estado">{ticket.estado}</span>
          </div>

          <h3 className="tarjeta-ticket-titulo">{ticket.titulo}</h3>

          <dl className="tarjeta-ticket-datos">
            <div>
              <dt>Tipo</dt>
              <dd>{ticket.tipo}</dd>
            </div>
            <div>
              <dt>Prioridad</dt>
              <dd>{ticket.prioridad}</dd>
            </div>
            <div>
              <dt>Usuario</dt>
              <dd>{ticket.usuarioCreador}</dd>
            </div>
            <div>
              <dt>Responsable</dt>
              <dd>{ticket.tecnicoResponsable}</dd>
            </div>
            <div>
              <dt>Sucursal</dt>
              <dd>{ticket.sucursal}</dd>
            </div>
            <div>
              <dt>Sector</dt>
              <dd>{ticket.sector}</dd>
            </div>
            <div>
              <dt>Creado</dt>
              <dd>{new Date(ticket.fecha_creacion).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Cierre</dt>
              <dd>{ticket.fecha_cierre ? new Date(ticket.fecha_cierre).toLocaleDateString() : '—'}</dd>
            </div>
          </dl>

          {ticket.estado !== ESTADO_CERRADO && (
            <div className="tarjeta-ticket-acciones" onClick={(event) => event.stopPropagation()}>
              <Button variant="secondary" onClick={() => onCerrar(ticket)}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TarjetasTickets;

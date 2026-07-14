import { useNavigate } from 'react-router-dom';
import Button from './Button';
import '../styles/TarjetasTickets.css';

const ESTADO_CERRADO = 'Cerrado';

function TarjetasTickets({
  tickets,
  catalogos,
  tecnicos,
  onCerrar,
  onCambiarEstado,
  onCambiarPrioridad,
  onAsignarResponsable,
}) {
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
            <select
              value={ticket.id_estado}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onCambiarEstado(ticket, Number(event.target.value))}
            >
              {catalogos.estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          <h3 className="tarjeta-ticket-titulo">{ticket.titulo}</h3>
          <p className="tarjeta-ticket-descripcion">{ticket.descripcion}</p>

          <dl className="tarjeta-ticket-datos">
            <div>
              <dt>Tipo</dt>
              <dd>{ticket.tipo}</dd>
            </div>
            <div onClick={(event) => event.stopPropagation()}>
              <dt>Prioridad</dt>
              <dd>
                <select
                  value={ticket.idPrioridadEfectiva ?? ''}
                  onChange={(event) => onCambiarPrioridad(ticket, Number(event.target.value))}
                >
                  {catalogos.prioridades.map((prioridad) => (
                    <option key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
            <div>
              <dt>Usuario</dt>
              <dd>{ticket.usuarioCreador}</dd>
            </div>
            <div onClick={(event) => event.stopPropagation()}>
              <dt>Responsable</dt>
              <dd>
                <select
                  value={ticket.id_tecnico_responsable ?? ''}
                  onChange={(event) => onAsignarResponsable(ticket, Number(event.target.value))}
                >
                  <option value="" disabled>
                    Sin asignar
                  </option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombre} {tecnico.apellido}
                    </option>
                  ))}
                </select>
              </dd>
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
            <div className="tarjeta-ticket-acciones no-imprimir" onClick={(event) => event.stopPropagation()}>
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

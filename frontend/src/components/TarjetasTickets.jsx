import { useAsideTicket } from '../context/AsideTicketContext';
import Button from './Button';
import Selector from './Selector';
import '../styles/TarjetasTickets.css';
import { formatearFechaHora } from '../utils/fechas';

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
  const { abrirTicket } = useAsideTicket();

  if (tickets.length === 0) {
    return <p className="tarjetas-tickets-vacio">No hay tickets para mostrar</p>;
  }

  return (
    <div className="tarjetas-tickets">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="tarjeta-ticket" onClick={() => abrirTicket(ticket.id)}>
          <div className="tarjeta-ticket-header">
            <span className="tarjeta-ticket-numero">{ticket.numero}</span>
            <Selector
              aria-label="Estado"
              enLinea
              value={ticket.id_estado}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onCambiarEstado(ticket, Number(event.target.value))}
            >
              {catalogos.estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </Selector>
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
                <Selector
                  aria-label="Prioridad"
                  value={ticket.idPrioridadEfectiva ?? ''}
                  onChange={(event) => onCambiarPrioridad(ticket, Number(event.target.value))}
                >
                  {catalogos.prioridades.map((prioridad) => (
                    <option key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre}
                    </option>
                  ))}
                </Selector>
              </dd>
            </div>
            <div>
              <dt>Usuario</dt>
              <dd>{ticket.usuarioCreador}</dd>
            </div>
            <div onClick={(event) => event.stopPropagation()}>
              <dt>Responsable</dt>
              <dd>
                <Selector
                  aria-label="Responsable"
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
                </Selector>
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
              <dd>{formatearFechaHora(ticket.fecha_creacion)}</dd>
            </div>
            <div>
              <dt>Cierre</dt>
              <dd>{formatearFechaHora(ticket.fecha_cierre)}</dd>
            </div>
          </dl>

          {ticket.estado !== ESTADO_CERRADO && (
            <div className="tarjeta-ticket-acciones no-imprimir" onClick={(event) => event.stopPropagation()}>
              <Button variant="secondary" size="sm" onClick={() => onCerrar(ticket)}>
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

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTicketDetalle } from '../hooks/useTicketDetalle';
import ActividadTicket from './ActividadTicket';
import TextoExpandible from './TextoExpandible';
import '../styles/AsideTicket.css';

// Panel lateral con una versión acotada del detalle de un ticket: se abre
// al hacer clic en una fila de las tablas, sin salir de la pantalla.
function AsideTicket({ idTicket, onClose }) {
  const {
    usuario,
    esTecnico,
    cargando,
    error,
    ticket,
    comentarios,
    adjuntosTicket,
    nombres,
    yaCerrado,
    agregarComentario,
    quitarComentario,
  } = useTicketDetalle(idTicket);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const dato = (etiqueta, valor) => (
    <div>
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );

  return (
    <aside className="aside-ticket" aria-label="Detalle del ticket">
      <header className="aside-ticket-cabecera">
        <h2>{ticket ? `${ticket.numero} — ${ticket.titulo}` : 'Ticket'}</h2>
        <button type="button" className="modal-cerrar-x" onClick={onClose} aria-label="Cerrar panel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      {cargando && <p className="aside-ticket-mensaje">Cargando...</p>}
      {error && <p className="ticket-form-error aside-ticket-mensaje">{error}</p>}

      {ticket && !error && (
        <div className="aside-ticket-cuerpo">
          <Link to={`/tickets/${ticket.id}`} className="aside-ticket-completo">
            Ver detalle completo →
          </Link>

          <dl className="aside-ticket-datos">
            {dato('Estado', nombres.estado)}
            {dato('Prioridad', nombres.prioridad)}
            {dato('Tipo', nombres.tipo)}
            {dato('Creado por', nombres.creador)}
            {dato('Sucursal', nombres.sucursal)}
            {dato('Sector', nombres.sector)}
            {dato('Creación', new Date(ticket.fecha_creacion).toLocaleDateString())}
            {dato('Actualización', new Date(ticket.fecha_actualizacion).toLocaleDateString())}
          </dl>

          <section className="aside-ticket-seccion">
            <h3>Descripción</h3>
            <TextoExpandible texto={ticket.descripcion} />
          </section>

          {adjuntosTicket.length > 0 && (
            <section className="aside-ticket-seccion">
              <h3>Adjuntos</h3>
              <ul className="detalle-ticket-adjuntos-lista">
                {adjuntosTicket.map((adjunto) => (
                  <li key={adjunto.id}>
                    <a href={`/api/adjuntos/${adjunto.id}/descargar`}>{adjunto.nombre_archivo}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ActividadTicket
            comentarios={comentarios}
            conHistorial={false}
            usuario={usuario}
            esTecnico={esTecnico}
            yaCerrado={yaCerrado}
            onAgregarComentario={agregarComentario}
            onEliminarComentario={quitarComentario}
          />
        </div>
      )}
    </aside>
  );
}

export default AsideTicket;

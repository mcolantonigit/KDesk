import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTicketDetalle } from '../hooks/useTicketDetalle';
import Button from '../components/Button';
import ModalCerrarTicket from '../components/ModalCerrarTicket';
import BackButton from '../components/BackButton';
import Checklist from '../components/Checklist';
import ActividadTicket from '../components/ActividadTicket';
import '../styles/DetalleTicket.css';
import { formatearFechaHora } from '../utils/fechas';

function DetalleTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    usuario,
    esTecnico,
    cargando,
    error,
    ticket,
    comentarios,
    adjuntosTicket,
    historial,
    nombres,
    yaCerrado,
    puedeCerrar,
    recargar,
    agregarComentario,
    quitarComentario,
  } = useTicketDetalle(id);

  const [mostrarCierre, setMostrarCierre] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      const tag = event.target.tagName;
      const enCampoDeTexto = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable;

      if (event.key === 'Escape') {
        navigate(-1);
      } else if (event.key === 'Backspace' && !enCampoDeTexto) {
        navigate(-1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  async function handleTicketCerrado() {
    setMostrarCierre(false);
    await recargar();
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;
  if (!ticket) return null;

  const dato = (etiqueta, valor) => (
    <div>
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );

  return (
    <div className="detalle-ticket">
      <div className="detalle-ticket-cabecera">
        <BackButton onClick={() => navigate(-1)}>Atrás</BackButton>
        <h1>
          {ticket.numero} — {ticket.titulo}
        </h1>
        {puedeCerrar && !yaCerrado && (
          <Button variant="secondary" size="sm" onClick={() => setMostrarCierre(true)}>
            Cerrar ticket
          </Button>
        )}
      </div>

      <dl className="detalle-ticket-datos">
        {dato('Estado', nombres.estado)}
        {dato('Tipo', nombres.tipo)}
        {dato('Prioridad', nombres.prioridad)}
        {dato('Creado por', nombres.creador)}
        {dato('Sucursal', nombres.sucursal)}
        {dato('Sector', nombres.sector)}
        {dato('Creación', formatearFechaHora(ticket.fecha_creacion))}
        {dato('Última actualización', formatearFechaHora(ticket.fecha_actualizacion))}
        {ticket.fecha_cierre && dato('Cierre', formatearFechaHora(ticket.fecha_cierre))}
      </dl>

      <div className="detalle-ticket-cuerpo">
        <div className="detalle-ticket-principal">
          <section className="detalle-ticket-descripcion">
            <h2>Descripción</h2>
            <p>{ticket.descripcion}</p>
          </section>

          {esTecnico && <Checklist idTicket={id} />}

          <section className="detalle-ticket-adjuntos">
            <h2>Adjuntos</h2>
            {adjuntosTicket.length === 0 ? (
              <p className="detalle-ticket-comentarios-vacio">Sin adjuntos</p>
            ) : (
              <ul className="detalle-ticket-adjuntos-lista">
                {adjuntosTicket.map((adjunto) => (
                  <li key={adjunto.id}>
                    <a href={`/api/adjuntos/${adjunto.id}/descargar`}>{adjunto.nombre_archivo}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <ActividadTicket
          comentarios={comentarios}
          historial={historial}
          usuario={usuario}
          esTecnico={esTecnico}
          yaCerrado={yaCerrado}
          onAgregarComentario={agregarComentario}
          onEliminarComentario={quitarComentario}
        />
      </div>

      {mostrarCierre && (
        <ModalCerrarTicket ticket={ticket} onClose={() => setMostrarCierre(false)} onCerrado={handleTicketCerrado} />
      )}
    </div>
  );
}

export default DetalleTicket;

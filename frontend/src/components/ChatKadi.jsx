import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enviarMensajeAKadi } from '../services/kadi.service';
import { crearTicket } from '../services/tickets.service';
import Button from './Button';
import '../styles/ChatKadi.css';

const MAX_MENSAJES = 10;
const SALUDO = {
  rol: 'kadi',
  texto: 'Hola, soy Kadi. Contame qué te pasa o qué necesitás y armamos el ticket juntos.',
};

// Charla corta con Kadi para armar un ticket. Kadi solo propone los datos: el
// ticket se crea cuando la persona confirma, con el mismo pedido que el formulario.
function ChatKadi({ onClose, onUsarFormulario }) {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([SALUDO]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [propuesta, setPropuesta] = useState(null);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');
  const finRef = useRef(null);

  const mensajesPersona = mensajes.filter((mensaje) => mensaje.rol === 'persona').length;
  const sinMensajes = mensajesPersona >= MAX_MENSAJES && !propuesta;

  useEffect(() => {
    finRef.current?.scrollIntoView?.({ block: 'end' });
  }, [mensajes, propuesta, enviando]);

  async function enviar(event) {
    event.preventDefault();
    const nuevo = texto.trim();
    if (!nuevo || enviando || sinMensajes) return;

    const conversacion = [...mensajes, { rol: 'persona', texto: nuevo }];
    setMensajes(conversacion);
    setTexto('');
    setError('');
    setPropuesta(null);
    setEnviando(true);

    try {
      const respuesta = await enviarMensajeAKadi(conversacion);
      setMensajes([...conversacion, { rol: 'kadi', texto: respuesta.mensaje }]);
      setPropuesta(respuesta.ticket);
    } catch (err) {
      // Se quita el mensaje que no llegó y se devuelve al campo para reintentar.
      setMensajes(mensajes);
      setTexto(nuevo);
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) enviar(event);
  }

  async function confirmar() {
    setCreando(true);
    setError('');
    try {
      const ticket = await crearTicket({
        idTipo: propuesta.idTipo,
        idPrioridadSugerida: propuesta.idPrioridadSugerida,
        titulo: propuesta.titulo,
        descripcion: propuesta.descripcion,
      });
      onClose();
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.message);
      setCreando(false);
    }
  }

  return (
    <div className="kadi">
      <div className="kadi-mensajes" role="log" aria-live="polite" aria-label="Charla con Kadi">
        {mensajes.map((mensaje, indice) => (
          <p key={indice} className={`kadi-burbuja kadi-burbuja-${mensaje.rol}`}>
            {mensaje.texto}
          </p>
        ))}
        {enviando && <p className="kadi-burbuja kadi-burbuja-kadi kadi-escribiendo">Kadi está escribiendo…</p>}

        {propuesta && (
          <div className="kadi-propuesta">
            <h3>{propuesta.titulo}</h3>
            <dl>
              <dt>Tipo</dt>
              <dd>{propuesta.tipo}</dd>
              <dt>Prioridad sugerida</dt>
              <dd>{propuesta.prioridad}</dd>
              <dt>Descripción</dt>
              <dd>{propuesta.descripcion}</dd>
            </dl>
            <div className="kadi-propuesta-acciones">
              <Button type="button" variant="secondary" onClick={() => setPropuesta(null)} disabled={creando}>
                Seguir charlando
              </Button>
              <Button type="button" onClick={confirmar} disabled={creando}>
                {creando ? 'Creando...' : 'Crear ticket'}
              </Button>
            </div>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {error && <p className="ticket-form-error">{error}</p>}

      {sinMensajes ? (
        <p className="kadi-limite">Llegamos al máximo de la charla. Podés terminar de cargarlo en el formulario.</p>
      ) : (
        <form className="kadi-form" onSubmit={enviar}>
          <textarea
            aria-label="Tu mensaje"
            rows={2}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={1000}
            placeholder="Escribí acá…"
            disabled={enviando || creando}
          />
          <Button type="submit" disabled={enviando || creando || !texto.trim()}>
            Enviar
          </Button>
        </form>
      )}

      <div className="kadi-pie">
        <Button type="button" variant="secondary" onClick={onUsarFormulario}>
          Generar manual
        </Button>
      </div>
    </div>
  );
}

export default ChatKadi;

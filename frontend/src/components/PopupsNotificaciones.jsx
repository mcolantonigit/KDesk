import { useEffect, useRef } from 'react';
import '../styles/PopupsNotificaciones.css';

const DURACION_MS = 10000;

function PopupNotificacion({ evento, onCerrar, onAbrir }) {
  const temporizador = useRef(null);

  // Se cierra solo a los 10 segundos; mientras el mouse está encima, el tiempo se frena.
  // Si la pestaña no se ve (otra ventana encima, minimizada) el tiempo no corre: así
  // el popup sigue ahí cuando la persona vuelve a mirar.
  function iniciarTemporizador() {
    clearTimeout(temporizador.current);
    if (document.hidden) return;
    temporizador.current = setTimeout(() => onCerrar(evento.id), DURACION_MS);
  }

  useEffect(() => {
    function alCambiarVisibilidad() {
      if (document.hidden) clearTimeout(temporizador.current);
      else iniciarTemporizador();
    }

    iniciarTemporizador();
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      clearTimeout(temporizador.current);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`popup-notificacion popup-${evento.tipo}`}
      role="status"
      onMouseEnter={() => clearTimeout(temporizador.current)}
      onMouseLeave={iniciarTemporizador}
    >
      <button type="button" className="popup-notificacion-cuerpo" onClick={() => onAbrir(evento)}>
        <strong>{evento.titulo}</strong>
        <span>{evento.mensaje}</span>
      </button>
      <button type="button" className="popup-notificacion-cerrar" onClick={() => onCerrar(evento.id)} aria-label="Cerrar notificación">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Popups tipo notificación de Windows: abajo a la derecha, uno sobre otro.
function PopupsNotificaciones({ popups, onCerrar, onAbrir }) {
  if (popups.length === 0) return null;

  return (
    <div className="popups-notificaciones no-imprimir" aria-live="polite">
      {popups.map((evento) => (
        <PopupNotificacion key={evento.id} evento={evento} onCerrar={onCerrar} onAbrir={onAbrir} />
      ))}
    </div>
  );
}

export default PopupsNotificaciones;

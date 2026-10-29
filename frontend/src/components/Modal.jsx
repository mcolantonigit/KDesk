import { useEffect, useId } from 'react';
import '../styles/Modal.css';

// Ventana modal genérica: se cierra con Escape o haciendo clic en el fondo,
// y bloquea el scroll de la página mientras está abierta.
// `size`: 'md' (formularios chicos), 'chat' (charla con Kadi) o 'lg' (formularios en dos columnas).
function Modal({ titulo, onClose, size = 'md', children }) {
  const idTitulo = useId();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onClose]);

  return (
    <div className="modal-fondo" onMouseDown={onClose}>
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-cabecera">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="modal-cerrar-x" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export default Modal;

import { useState } from 'react';
import { reenviarActivacion } from '../services/usuarios.service';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

function ModalActivacionEnviada({ correo, onClose }) {
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [error, setError] = useState('');

  async function handleReenviar() {
    setReenviando(true);
    setError('');
    try {
      await reenviarActivacion(correo);
      setReenviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <div className="modal-cerrar" onClick={(event) => event.stopPropagation()}>
        <h2>Revisá tu correo</h2>

        <p>
          Te enviamos un correo a <strong>{correo}</strong> con un link para activar tu cuenta.
          El link es válido por 24 horas.
        </p>

        {reenviado && <p>Te reenviamos el correo. Revisá tu bandeja de entrada.</p>}
        {error && <p className="ticket-form-error">{error}</p>}

        <div className="modal-cerrar-acciones">
          {!reenviado && (
            <Button type="button" variant="secondary" onClick={handleReenviar} disabled={reenviando}>
              {reenviando ? 'Reenviando...' : 'Reenviar correo'}
            </Button>
          )}
          <Button type="button" onClick={onClose}>Ir a iniciar sesión</Button>
        </div>
      </div>
    </div>
  );
}

export default ModalActivacionEnviada;

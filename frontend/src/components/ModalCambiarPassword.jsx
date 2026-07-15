import { useState } from 'react';
import { cambiarPassword } from '../services/usuarios.service';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

function ModalCambiarPassword({ onClose }) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await cambiarPassword({ passwordActual, passwordNueva, confirmacion });
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <form className="modal-cerrar" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Cambiar contraseña</h2>

        {exito ? (
          <>
            <p>Contraseña cambiada</p>
            <div className="modal-cerrar-acciones">
              <Button type="button" onClick={onClose}>Cerrar</Button>
            </div>
          </>
        ) : (
          <>
            <div className="form-field">
              <label htmlFor="passwordActual">Contraseña actual</label>
              <input
                id="passwordActual"
                type="password"
                value={passwordActual}
                onChange={(event) => setPasswordActual(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="passwordNueva">Contraseña nueva</label>
              <input
                id="passwordNueva"
                type="password"
                value={passwordNueva}
                onChange={(event) => setPasswordNueva(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmacion">Confirmar contraseña nueva</label>
              <input
                id="confirmacion"
                type="password"
                value={confirmacion}
                onChange={(event) => setConfirmacion(event.target.value)}
                required
              />
            </div>

            <div className="modal-cerrar-acciones">
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Guardando...' : 'Confirmar'}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </div>
            {error && <p className="ticket-form-error">{error}</p>}
          </>
        )}
      </form>
    </div>
  );
}

export default ModalCambiarPassword;

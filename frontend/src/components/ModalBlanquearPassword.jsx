import { useState } from 'react';
import { blanquearPassword } from '../services/usuarios.service';
import FormField from './FormField';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

function ModalBlanquearPassword({ usuario, onClose, onBlanqueado }) {
  const [passwordNueva, setPasswordNueva] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await blanquearPassword(usuario.id, passwordNueva);
      onBlanqueado();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <form className="modal-cerrar" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Blanquear contraseña de {usuario.nombre} {usuario.apellido}</h2>
        <FormField
          id="passwordNueva"
          label="Contraseña nueva"
          type="password"
          value={passwordNueva}
          onChange={(event) => setPasswordNueva(event.target.value)}
          required
        />
        <div className="modal-cerrar-acciones">
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Confirmar'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
        {error && <p className="ticket-form-error">{error}</p>}
      </form>
    </div>
  );
}

export default ModalBlanquearPassword;

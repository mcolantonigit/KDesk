import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { actualizarPerfil } from '../services/usuarios.service';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

// El propio usuario corrige su nombre y apellido (el correo no se toca:
// es con lo que entra al sistema).
function ModalMisDatos({ onClose }) {
  const { usuario, setUsuario } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [apellido, setApellido] = useState(usuario?.apellido ?? '');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const actualizado = await actualizarPerfil({ nombre, apellido });
      setUsuario(actualizado);
      onClose();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <form className="modal-cerrar" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Mis datos</h2>

        <div className="form-field">
          <label htmlFor="misDatosNombre">Nombre</label>
          <input
            id="misDatosNombre"
            type="text"
            value={nombre}
            maxLength={100}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="misDatosApellido">Apellido</label>
          <input
            id="misDatosApellido"
            type="text"
            value={apellido}
            maxLength={100}
            onChange={(event) => setApellido(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="misDatosCorreo">Correo</label>
          <input id="misDatosCorreo" type="email" value={usuario?.correo ?? ''} disabled />
        </div>

        <div className="modal-cerrar-acciones">
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar'}
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

export default ModalMisDatos;

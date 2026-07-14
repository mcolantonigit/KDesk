import { useState } from 'react';
import { blanquearPassword } from '../services/usuarios.service';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

const LONGITUD_PASSWORD = 10;
const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const MINUSCULAS = 'abcdefghijkmnpqrstuvwxyz';
const NUMEROS = '23456789';

function elegirAlAzar(caracteres) {
  return caracteres[Math.floor(Math.random() * caracteres.length)];
}

function generarPasswordAleatoria() {
  const todos = MAYUSCULAS + MINUSCULAS + NUMEROS;
  const caracteres = [elegirAlAzar(MAYUSCULAS), elegirAlAzar(MINUSCULAS), elegirAlAzar(NUMEROS)];

  while (caracteres.length < LONGITUD_PASSWORD) {
    caracteres.push(elegirAlAzar(todos));
  }

  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
  }

  return caracteres.join('');
}

function ModalBlanquearPassword({ usuario, onClose, onBlanqueado }) {
  const [passwordNueva, setPasswordNueva] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
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

  function handleGenerar() {
    setPasswordNueva(generarPasswordAleatoria());
    setMostrarPassword(true);
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <form className="modal-cerrar" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Blanquear contraseña de {usuario.nombre} {usuario.apellido}</h2>

        <div className="form-field">
          <label htmlFor="passwordNueva">Contraseña nueva</label>
          <div className="modal-password-fila">
            <input
              id="passwordNueva"
              type={mostrarPassword ? 'text' : 'password'}
              value={passwordNueva}
              onChange={(event) => setPasswordNueva(event.target.value)}
              required
            />
            <Button type="button" variant="secondary" onClick={() => setMostrarPassword(!mostrarPassword)}>
              {mostrarPassword ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          <button type="button" className="modal-password-generar" onClick={handleGenerar}>
            Generar automáticamente (10 caracteres)
          </button>
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
      </form>
    </div>
  );
}

export default ModalBlanquearPassword;

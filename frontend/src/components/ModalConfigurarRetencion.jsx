import { useState } from 'react';
import { actualizarRetencion } from '../services/auditoria.service';
import FormField from './FormField';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

function ModalConfigurarRetencion({ diasActuales, onClose, onGuardado }) {
  const [dias, setDias] = useState(diasActuales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const diasNumero = Number(dias);
    if (!Number.isInteger(diasNumero) || diasNumero < 1) {
      setError('Los días de retención deben ser un número entero mayor o igual a 1');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      await actualizarRetencion(diasNumero);
      onGuardado(diasNumero);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <form className="modal-cerrar" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Limpieza automática</h2>
        <p className="ticket-form-error" style={{ color: 'var(--text-secondary)' }}>
          Todas las noches a las 00:00hs el sistema borra de Auditoría e Historial de tickets todo lo
          más viejo que este período.
        </p>
        <FormField
          id="diasRetencion"
          label="Preservar auditorías desde actualidad hasta (días)"
          type="number"
          value={dias}
          onChange={(event) => setDias(event.target.value)}
          required
        />
        <div className="modal-cerrar-acciones">
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
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

export default ModalConfigurarRetencion;

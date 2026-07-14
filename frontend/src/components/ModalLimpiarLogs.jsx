import { useState } from 'react';
import { limpiarLogs } from '../services/auditoria.service';
import FormField from './FormField';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

function ModalLimpiarLogs({ diasPorDefecto, onClose, onLimpiado }) {
  const [diasPreservar, setDiasPreservar] = useState(diasPorDefecto);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const dias = Number(diasPreservar);
    const confirmado = window.confirm(
      `¿Confirmás borrar ya mismo todo lo de Auditoría e Historial de tickets con más de ${dias} días? ` +
        'Esta acción no se puede deshacer.'
    );
    if (!confirmado) return;

    setEnviando(true);
    setError('');
    try {
      const resultado = await limpiarLogs(dias);
      onLimpiado(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <form className="modal-cerrar" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Limpiar logs y auditorías</h2>
        <FormField
          id="diasPreservar"
          label="Preservar desde la actualidad hasta (días)"
          type="number"
          value={diasPreservar}
          onChange={(event) => setDiasPreservar(event.target.value)}
          required
        />
        <div className="modal-cerrar-acciones">
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Limpiando...' : 'Limpiar ahora'}
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

export default ModalLimpiarLogs;

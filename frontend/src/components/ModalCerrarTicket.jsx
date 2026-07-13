import { useState } from 'react';
import { cerrarTicket } from '../services/tickets.service';
import FormField from './FormField';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

function ModalCerrarTicket({ ticket, onClose, onCerrado }) {
  const [comentario, setComentario] = useState('');
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setCerrando(true);
    setError('');
    try {
      await cerrarTicket(ticket.id, comentario);
      onCerrado();
    } catch (err) {
      setError(err.message);
    } finally {
      setCerrando(false);
    }
  }

  return (
    <div className="modal-cerrar-overlay" onClick={onClose}>
      <form className="modal-cerrar" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Cerrar {ticket.numero}</h2>
        <FormField
          id="comentarioCierreModal"
          label="Motivo de cierre"
          type="textarea"
          rows={4}
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
          required
        />
        <div className="modal-cerrar-acciones">
          <Button type="submit" disabled={cerrando}>
            {cerrando ? 'Cerrando...' : 'Confirmar cierre'}
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

export default ModalCerrarTicket;

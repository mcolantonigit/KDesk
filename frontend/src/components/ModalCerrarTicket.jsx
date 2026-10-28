import { useState } from 'react';
import { cerrarTicket, getComentarios } from '../services/tickets.service';
import { subirAdjuntoDeComentario } from '../services/adjuntos.service';
import Modal from './Modal';
import FormField from './FormField';
import AdjuntoInput from './AdjuntoInput';
import Button from './Button';
import '../styles/ModalCerrarTicket.css';

// Ventana para cerrar un ticket: pide el motivo (queda como comentario de
// cierre) y, opcionalmente, un adjunto que se sube a ese comentario.
function ModalCerrarTicket({ ticket, onClose, onCerrado }) {
  const [comentario, setComentario] = useState('');
  const [adjunto, setAdjunto] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setCerrando(true);
    setError('');
    try {
      await cerrarTicket(ticket.id, comentario);
      if (adjunto) {
        try {
          const comentarios = await getComentarios(ticket.id);
          const comentarioDeCierre = comentarios[comentarios.length - 1];
          await subirAdjuntoDeComentario(comentarioDeCierre.id, adjunto);
        } catch (err) {
          // El ticket ya quedó cerrado: avisar y seguir.
          window.alert(`El ticket se cerró, pero no se pudo adjuntar "${adjunto.name}": ${err.message}`);
        }
      }
      onCerrado();
    } catch (err) {
      setError(err.message);
    } finally {
      setCerrando(false);
    }
  }

  return (
    <Modal titulo={`Cerrar ${ticket.numero}`} onClose={onClose}>
      <form className="modal-cerrar-form" onSubmit={handleSubmit}>
        <FormField
          id="comentarioCierreModal"
          label="Motivo de cierre"
          type="textarea"
          rows={4}
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
          required
        />
        <AdjuntoInput id="adjuntoCierreModal" label="Adjunto (opcional)" value={adjunto} onChange={setAdjunto} />
        {error && <p className="ticket-form-error">{error}</p>}
        <div className="modal-cerrar-acciones">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={cerrando}>
            {cerrando ? 'Cerrando...' : 'Confirmar cierre'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalCerrarTicket;

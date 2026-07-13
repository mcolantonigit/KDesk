import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearTicket } from '../services/tickets.service';
import { getTiposTicket } from '../services/tiposTicket.service';
import { getPrioridades } from '../services/prioridades.service';
import { subirAdjuntoDeTicket } from '../services/adjuntos.service';
import FormField from '../components/FormField';
import Button from '../components/Button';
import '../styles/TicketForm.css';

const TITULO_LONGITUD_MAXIMA = 35;

function NuevoTicket() {
  const [tipos, setTipos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [idTipo, setIdTipo] = useState('');
  const [idPrioridadSugerida, setIdPrioridadSugerida] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [adjunto, setAdjunto] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getTiposTicket().then((data) => setTipos(data.filter((tipo) => tipo.activo)));
    getPrioridades().then((data) => setPrioridades(data.filter((prioridad) => prioridad.activo)));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const ticket = await crearTicket({ idTipo, idPrioridadSugerida, titulo, descripcion });
      if (adjunto) {
        await subirAdjuntoDeTicket(ticket.id, adjunto);
      }
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="ticket-form-page">
      <h1>Nuevo ticket</h1>

      <form className="ticket-form" onSubmit={handleSubmit}>
        <FormField
          id="idTipo"
          label="Tipo de ticket"
          value={idTipo}
          onChange={(event) => setIdTipo(event.target.value)}
          options={tipos}
          required
        />

        <FormField
          id="idPrioridadSugerida"
          label="Prioridad sugerida"
          value={idPrioridadSugerida}
          onChange={(event) => setIdPrioridadSugerida(event.target.value)}
          options={prioridades}
          required
        />

        <FormField
          id="titulo"
          label="Título"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          maxLength={TITULO_LONGITUD_MAXIMA}
          required
        />

        <FormField
          id="descripcion"
          label="Descripción"
          type="textarea"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          required
        />

        <div className="form-field">
          <label htmlFor="adjunto">Adjunto (opcional)</label>
          <input id="adjunto" type="file" onChange={(event) => setAdjunto(event.target.files[0] ?? null)} />
        </div>

        <Button type="submit" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear ticket'}
        </Button>

        {error && <p className="ticket-form-error">{error}</p>}
      </form>
    </div>
  );
}

export default NuevoTicket;

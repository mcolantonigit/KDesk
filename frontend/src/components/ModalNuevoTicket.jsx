import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { crearTicket } from '../services/tickets.service';
import { getTiposTicket } from '../services/tiposTicket.service';
import { getPrioridades } from '../services/prioridades.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import { getUsuarios } from '../services/usuarios.service';
import { subirAdjuntoDeTicket } from '../services/adjuntos.service';
import { getEstadoKadi } from '../services/kadi.service';
import Modal from './Modal';
import FormField from './FormField';
import Combobox from './Combobox';
import Button from './Button';
import AdjuntoInput from './AdjuntoInput';
import ChatKadi from './ChatKadi';
import '../styles/ModalNuevoTicket.css';

const TITULO_LONGITUD_MAXIMA = 35;
const ROLES_TECNICOS = [2, 3];

function ModalNuevoTicket({ onClose }) {
  const { usuario } = useAuth();
  const esTecnico = ROLES_TECNICOS.includes(usuario?.id_rol);

  const [tipos, setTipos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [idTipo, setIdTipo] = useState('');
  const [idPrioridadSugerida, setIdPrioridadSugerida] = useState('');
  const [idSucursal, setIdSucursal] = useState('');
  const [idSector, setIdSector] = useState('');
  const [idUsuarioCreador, setIdUsuarioCreador] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [adjunto, setAdjunto] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [kadiHabilitada, setKadiHabilitada] = useState(false);
  const [usarFormulario, setUsarFormulario] = useState(false);

  const navigate = useNavigate();

  // Kadi (el asistente que arma el ticket charlando) solo aparece para quien la tiene habilitada.
  useEffect(() => {
    getEstadoKadi()
      .then(setKadiHabilitada)
      .catch(() => setKadiHabilitada(false));
  }, []);

  useEffect(() => {
    getTiposTicket().then((data) => setTipos(data.filter((tipo) => tipo.activo)));
    getPrioridades().then((data) => setPrioridades(data.filter((prioridad) => prioridad.activo)));
    if (esTecnico) {
      getSucursales().then((data) => setSucursales(data.filter((sucursal) => sucursal.activo)));
      getSectores().then((data) => setSectores(data.filter((sector) => sector.activo)));
      getUsuarios().then((data) =>
        setUsuarios(
          data
            .filter((usuarioItem) => usuarioItem.activo)
            .map((usuarioItem) => ({ id: usuarioItem.id, nombre: `${usuarioItem.nombre} ${usuarioItem.apellido}` }))
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const ticket = await crearTicket({
        idTipo,
        idPrioridadSugerida,
        titulo,
        descripcion,
        idSucursal: esTecnico ? idSucursal : undefined,
        idSector: esTecnico ? idSector : undefined,
        idUsuarioCreador: esTecnico ? idUsuarioCreador : undefined,
      });
      if (adjunto) {
        try {
          await subirAdjuntoDeTicket(ticket.id, adjunto);
        } catch (err) {
          // El ticket ya existe: avisar y seguir (reintentar crearía otro igual).
          window.alert(`El ticket se creó, pero no se pudo adjuntar "${adjunto.name}": ${err.message}`);
        }
      }
      onClose();
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  if (kadiHabilitada && !usarFormulario) {
    return (
      <Modal titulo="Nuevo ticket con Kadi" size="chat" onClose={onClose}>
        <ChatKadi onClose={onClose} onUsarFormulario={() => setUsarFormulario(true)} />
      </Modal>
    );
  }

  return (
    <Modal titulo="Nuevo ticket" size="lg" onClose={onClose}>
      <form className="nuevo-ticket-form" onSubmit={handleSubmit}>
        <div className="nuevo-ticket-columnas">
          <div className="nuevo-ticket-columna">
            <Combobox id="idTipo" label="Tipo de ticket" value={idTipo} onChange={setIdTipo} options={tipos} required />
            <Combobox
              id="idPrioridadSugerida"
              label="Prioridad sugerida"
              value={idPrioridadSugerida}
              onChange={setIdPrioridadSugerida}
              options={prioridades}
              required
            />
            {esTecnico && (
              <>
                <Combobox
                  id="idUsuarioCreador"
                  label="Usuario que crea el ticket (opcional)"
                  value={idUsuarioCreador}
                  onChange={setIdUsuarioCreador}
                  options={usuarios}
                />
                <Combobox id="idSucursal" label="Sucursal" value={idSucursal} onChange={setIdSucursal} options={sucursales} required />
                <Combobox id="idSector" label="Sector" value={idSector} onChange={setIdSector} options={sectores} required />
              </>
            )}
          </div>

          <div className="nuevo-ticket-columna">
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
              rows={6}
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              required
            />
            <AdjuntoInput id="adjunto" label="Adjunto (opcional)" value={adjunto} onChange={setAdjunto} />
          </div>
        </div>

        {error && <p className="ticket-form-error">{error}</p>}

        <div className="nuevo-ticket-acciones">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Creando...' : 'Crear ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalNuevoTicket;

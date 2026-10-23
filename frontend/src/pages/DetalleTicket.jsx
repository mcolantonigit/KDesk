import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getTicketById,
  getComentarios,
  crearComentario,
  eliminarComentario,
} from '../services/tickets.service';
import { getEstados } from '../services/estados.service';
import { getPrioridades } from '../services/prioridades.service';
import { getTiposTicket } from '../services/tiposTicket.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import { getUsuarios } from '../services/usuarios.service';
import {
  getAdjuntosDeTicket,
  getAdjuntosDeComentario,
  subirAdjuntoDeComentario,
} from '../services/adjuntos.service';
import { getHistorial } from '../services/historial.service';
import FormField from '../components/FormField';
import Button from '../components/Button';
import FileInput from '../components/FileInput';
import ModalCerrarTicket from '../components/ModalCerrarTicket';
import BackButton from '../components/BackButton';
import Checklist from '../components/Checklist';
import '../styles/DetalleTicket.css';

const ESTADO_CERRADO = 'Cerrado';
const ROLES_TECNICOS = [2, 3];

function DetalleTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esTecnico = ROLES_TECNICOS.includes(usuario?.id_rol);

  const [ticket, setTicket] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [adjuntosTicket, setAdjuntosTicket] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [catalogos, setCatalogos] = useState({
    estados: [],
    prioridades: [],
    tipos: [],
    sucursales: [],
    sectores: [],
    usuarios: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [adjuntoComentario, setAdjuntoComentario] = useState(null);
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  const [historialVisibles, setHistorialVisibles] = useState(10);

  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [pestana, setPestana] = useState('comentarios');

  async function cargarTicket() {
    const [ticketData, comentariosData, adjuntosData, historialData] = await Promise.all([
      getTicketById(id),
      getComentarios(id),
      getAdjuntosDeTicket(id),
      getHistorial(id),
    ]);

    const comentariosConAdjuntos = await Promise.all(
      comentariosData.map(async (comentario) => ({
        ...comentario,
        adjuntos: comentario.eliminado ? [] : await getAdjuntosDeComentario(comentario.id),
      }))
    );

    setTicket(ticketData);
    setComentarios(comentariosConAdjuntos);
    setAdjuntosTicket(adjuntosData);
    setHistorial(historialData);
    setHistorialVisibles(10);
  }

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const [estados, prioridades, tipos, sucursales, sectores, usuarios] = await Promise.all([
          getEstados(),
          getPrioridades(),
          getTiposTicket(),
          getSucursales(),
          getSectores(),
          esTecnico ? getUsuarios() : Promise.resolve([]),
        ]);
        setCatalogos({ estados, prioridades, tipos, sucursales, sectores, usuarios });
        await cargarTicket();
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    function handleKeyDown(event) {
      const tag = event.target.tagName;
      const enCampoDeTexto = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable;

      if (event.key === 'Escape') {
        navigate(-1);
      } else if (event.key === 'Backspace' && !enCampoDeTexto) {
        navigate(-1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  async function handleAgregarComentario(event) {
    event.preventDefault();
    setEnviandoComentario(true);
    try {
      const comentario = await crearComentario(id, nuevoComentario);
      if (adjuntoComentario) {
        await subirAdjuntoDeComentario(comentario.id, adjuntoComentario);
      }
      setNuevoComentario('');
      setAdjuntoComentario(null);
      await cargarTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviandoComentario(false);
    }
  }

  async function handleEliminarComentario(comentario) {
    try {
      await eliminarComentario(comentario.id);
      await cargarTicket();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTicketCerrado() {
    setMostrarCierre(false);
    await cargarTicket();
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;
  if (!ticket) return null;

  const nombreEstado = catalogos.estados.find((estado) => estado.id === ticket.id_estado)?.nombre ?? '—';
  const nombrePrioridad = catalogos.prioridades.find((prioridad) => prioridad.id === ticket.id_prioridad)?.nombre;
  const nombrePrioridadSugerida = catalogos.prioridades.find(
    (prioridad) => prioridad.id === ticket.id_prioridad_sugerida
  )?.nombre;
  const nombreTipo = catalogos.tipos.find((tipo) => tipo.id === ticket.id_tipo)?.nombre ?? '—';
  const nombreSucursal = catalogos.sucursales.find((sucursal) => sucursal.id === ticket.id_sucursal)?.nombre ?? '—';
  const nombreSector = catalogos.sectores.find((sector) => sector.id === ticket.id_sector)?.nombre ?? '—';
  const usuarioCreador = catalogos.usuarios.find((item) => item.id === ticket.id_usuario_creador);
  const nombreCreador = esTecnico
    ? usuarioCreador
      ? `${usuarioCreador.nombre} ${usuarioCreador.apellido}`
      : '—'
    : `${usuario.nombre} ${usuario.apellido}`;

  const historialOrdenado = [...historial].reverse();
  const historialMostrado = historialOrdenado.slice(0, historialVisibles);

  const esCreador = ticket.id_usuario_creador === usuario?.id;
  const puedeCerrar = esCreador || esTecnico;
  const yaCerrado = nombreEstado === ESTADO_CERRADO;

  const dato = (etiqueta, valor) => (
    <div>
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );

  return (
    <div className="detalle-ticket">
      <div className="detalle-ticket-cabecera">
        <BackButton onClick={() => navigate(-1)}>Atrás</BackButton>
        <h1>
          {ticket.numero} — {ticket.titulo}
        </h1>
        {puedeCerrar && !yaCerrado && (
          <Button variant="secondary" size="sm" onClick={() => setMostrarCierre(true)}>
            Cerrar ticket
          </Button>
        )}
      </div>

      <dl className="detalle-ticket-datos">
        {dato('Estado', nombreEstado)}
        {dato('Tipo', nombreTipo)}
        {dato('Prioridad', nombrePrioridad ?? `${nombrePrioridadSugerida ?? '—'} (sugerida)`)}
        {dato('Creado por', nombreCreador)}
        {dato('Sucursal', nombreSucursal)}
        {dato('Sector', nombreSector)}
        {dato('Creación', new Date(ticket.fecha_creacion).toLocaleString())}
        {dato('Última actualización', new Date(ticket.fecha_actualizacion).toLocaleString())}
        {ticket.fecha_cierre && dato('Cierre', new Date(ticket.fecha_cierre).toLocaleString())}
      </dl>

      <div className="detalle-ticket-cuerpo">
        <div className="detalle-ticket-principal">
          <section className="detalle-ticket-descripcion">
            <h2>Descripción</h2>
            <p>{ticket.descripcion}</p>
          </section>

          {esTecnico && <Checklist idTicket={id} />}

          <section className="detalle-ticket-adjuntos">
            <h2>Adjuntos</h2>
            {adjuntosTicket.length === 0 ? (
              <p className="detalle-ticket-comentarios-vacio">Sin adjuntos</p>
            ) : (
              <ul className="detalle-ticket-adjuntos-lista">
                {adjuntosTicket.map((adjunto) => (
                  <li key={adjunto.id}>
                    <a href={`/api/adjuntos/${adjunto.id}/descargar`}>{adjunto.nombre_archivo}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="detalle-ticket-actividad">
          <div className="detalle-ticket-pestanas" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={pestana === 'comentarios'}
              className={pestana === 'comentarios' ? 'activa' : ''}
              onClick={() => setPestana('comentarios')}
            >
              Comentarios ({comentarios.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={pestana === 'historial'}
              className={pestana === 'historial' ? 'activa' : ''}
              onClick={() => setPestana('historial')}
            >
              Historial
            </button>
          </div>

          {pestana === 'comentarios' ? (
            <div className="detalle-ticket-comentarios" role="tabpanel">
              <ul className="detalle-ticket-comentarios-lista">
                {comentarios.map((comentario) => (
                  <li key={comentario.id}>
                    <div className="detalle-ticket-comentario-cabecera">
                      <strong>
                        {comentario.autor_nombre} {comentario.autor_apellido}
                      </strong>
                      <span>{new Date(comentario.fecha_creacion).toLocaleString()}</span>
                      {!comentario.eliminado && (comentario.id_autor === usuario?.id || esTecnico) && (
                        <button
                          type="button"
                          className="detalle-ticket-comentario-eliminar"
                          onClick={() => handleEliminarComentario(comentario)}
                          aria-label="Eliminar comentario"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <p>{comentario.eliminado ? 'Comentario eliminado' : comentario.contenido}</p>
                    {comentario.adjuntos?.length > 0 && (
                      <ul className="detalle-ticket-adjuntos-lista">
                        {comentario.adjuntos.map((adjunto) => (
                          <li key={adjunto.id}>
                            <a href={`/api/adjuntos/${adjunto.id}/descargar`}>{adjunto.nombre_archivo}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
                {comentarios.length === 0 && <li className="detalle-ticket-comentarios-vacio">Sin comentarios todavía</li>}
              </ul>

              {!yaCerrado && (
                <form className="detalle-ticket-nuevo-comentario" onSubmit={handleAgregarComentario}>
                  <FormField
                    id="nuevoComentario"
                    label="Agregar comentario"
                    type="textarea"
                    rows={2}
                    value={nuevoComentario}
                    onChange={(event) => setNuevoComentario(event.target.value)}
                    required
                  />
                  <FileInput
                    id="adjuntoComentario"
                    label="Adjunto (opcional)"
                    compacto
                    value={adjuntoComentario}
                    onChange={setAdjuntoComentario}
                  />
                  <Button type="submit" size="sm" disabled={enviandoComentario}>
                    {enviandoComentario ? 'Enviando...' : 'Comentar'}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="detalle-ticket-historial" role="tabpanel">
              <ul className="detalle-ticket-historial-lista">
                {historialMostrado.map((evento) => (
                  <li key={evento.id}>
                    <span className="detalle-ticket-historial-detalle">{evento.detalle}</span>
                    <span className="detalle-ticket-historial-fecha">{new Date(evento.fecha).toLocaleString()}</span>
                  </li>
                ))}
                {historial.length === 0 && <li className="detalle-ticket-comentarios-vacio">Sin eventos registrados</li>}
              </ul>
              {historialVisibles < historialOrdenado.length && (
                <button
                  type="button"
                  className="detalle-ticket-historial-cargar-mas"
                  onClick={() => setHistorialVisibles((anteriores) => anteriores + 10)}
                >
                  Cargar 10 más
                </button>
              )}
            </div>
          )}
        </aside>
      </div>

      {mostrarCierre && (
        <ModalCerrarTicket ticket={ticket} onClose={() => setMostrarCierre(false)} onCerrado={handleTicketCerrado} />
      )}
    </div>
  );
}

export default DetalleTicket;

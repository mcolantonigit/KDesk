import { useEffect, useMemo, useState } from 'react';
import { getAuditoria, getRetencion } from '../services/auditoria.service';
import { getUsuarios } from '../services/usuarios.service';
import { useAuth } from '../context/AuthContext';
import Paginacion from '../components/Paginacion';
import ModalLimpiarLogs from '../components/ModalLimpiarLogs';
import ModalConfigurarRetencion from '../components/ModalConfigurarRetencion';
import Button from '../components/Button';
import { usePersistentState } from '../hooks/usePersistentState';
import '../styles/TablaTickets.css';
import '../styles/Tablero.css';
import '../styles/Auditoria.css';

const POR_PAGINA = 10;
const ROL_ADMINISTRADOR = 3;

const COLUMNAS = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'accion', label: 'Acción' },
  { key: 'detalle', label: 'Detalle' },
];

function Auditoria() {
  const { usuario } = useAuth();
  const esAdministrador = usuario?.id_rol === ROL_ADMINISTRADOR;

  const [eventos, setEventos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [diasRetencion, setDiasRetencion] = useState('');
  const [mostrarModalLimpiar, setMostrarModalLimpiar] = useState(false);
  const [mostrarModalRetencion, setMostrarModalRetencion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = usePersistentState('kdesk:auditoria:busqueda', '');
  const [fechaDesde, setFechaDesde] = usePersistentState('kdesk:auditoria:fechaDesde', '');
  const [fechaHasta, setFechaHasta] = usePersistentState('kdesk:auditoria:fechaHasta', '');
  const [ordenPor, setOrdenPor] = useState('fecha');
  const [ordenAsc, setOrdenAsc] = useState(false);
  const [pagina, setPagina] = useState(1);

  async function cargarEventos() {
    const eventosData = await getAuditoria();
    setEventos(eventosData);
  }

  useEffect(() => {
    async function cargar() {
      try {
        const promesas = [getAuditoria(), getUsuarios()];
        if (esAdministrador) promesas.push(getRetencion());

        const [eventosData, usuariosData, retencionData] = await Promise.all(promesas);
        setEventos(eventosData);
        setUsuarios(usuariosData);
        if (retencionData) setDiasRetencion(retencionData.dias_retencion_logs);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usuariosPorId = useMemo(() => Object.fromEntries(usuarios.map((usuario) => [usuario.id, usuario])), [usuarios]);

  const eventosEnriquecidos = useMemo(
    () =>
      eventos.map((evento) => {
        if (evento.id_usuario === null) {
          return { ...evento, usuario: 'Sistema (limpieza automática)' };
        }
        const autor = usuariosPorId[evento.id_usuario];
        return {
          ...evento,
          usuario: autor ? `${autor.nombre} ${autor.apellido}` : `#${evento.id_usuario}`,
        };
      }),
    [eventos, usuariosPorId]
  );

  const eventosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return eventosEnriquecidos.filter((evento) => {
      if (fechaDesde && new Date(evento.fecha) < new Date(`${fechaDesde}T00:00:00`)) return false;
      if (fechaHasta && new Date(evento.fecha) > new Date(`${fechaHasta}T23:59:59`)) return false;

      if (busquedaNormalizada) {
        const campos = [evento.usuario, evento.accion, evento.detalle];
        if (!campos.some((campo) => campo?.toLowerCase().includes(busquedaNormalizada))) return false;
      }

      return true;
    });
  }, [eventosEnriquecidos, busqueda, fechaDesde, fechaHasta]);

  const eventosOrdenados = useMemo(() => {
    const copia = [...eventosFiltrados];
    copia.sort((a, b) => {
      const valorA = a[ordenPor] ?? '';
      const valorB = b[ordenPor] ?? '';
      if (valorA < valorB) return ordenAsc ? -1 : 1;
      if (valorA > valorB) return ordenAsc ? 1 : -1;
      return 0;
    });
    return copia;
  }, [eventosFiltrados, ordenPor, ordenAsc]);

  const totalPaginas = Math.max(1, Math.ceil(eventosOrdenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const eventosPagina = eventosOrdenados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  function handleOrdenar(columna) {
    if (columna === ordenPor) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenPor(columna);
      setOrdenAsc(true);
    }
    setPagina(1);
  }

  function handleFiltroChange(setter) {
    return (valor) => {
      setter(valor);
      setPagina(1);
    };
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;

  return (
    <div className="tablero">
      <h1>Auditoría</h1>

      <div className="tablero-toolbar">
        <div className="tablero-toolbar-fila">
          <input
            className="tablero-busqueda"
            type="text"
            placeholder="Buscar por usuario, acción o detalle..."
            value={busqueda}
            onChange={(event) => handleFiltroChange(setBusqueda)(event.target.value)}
          />

          <label className="tablero-campo">
            <span>Fecha desde</span>
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(event) => handleFiltroChange(setFechaDesde)(event.target.value)}
            />
          </label>

          <label className="tablero-campo">
            <span>Fecha hasta</span>
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(event) => handleFiltroChange(setFechaHasta)(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="tabla-tickets-scroll">
        <table className="tabla-tickets tabla-catalogo">
          <thead>
            <tr>
              {COLUMNAS.map((columna) => (
                <th key={columna.key} onClick={() => handleOrdenar(columna.key)}>
                  {columna.label}
                  {ordenPor === columna.key && <span className="tabla-tickets-orden">{ordenAsc ? ' ▲' : ' ▼'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eventosPagina.map((evento) => (
              <tr key={evento.id}>
                <td>{new Date(evento.fecha).toLocaleString()}</td>
                <td>{evento.usuario}</td>
                <td>{evento.accion}</td>
                <td>{evento.detalle}</td>
              </tr>
            ))}
            {eventosPagina.length === 0 && (
              <tr>
                <td colSpan={COLUMNAS.length} className="tabla-tickets-vacio">
                  Sin eventos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />

      {esAdministrador && (
        <div className="tablero-toolbar-fila auditoria-acciones">
          <Button variant="secondary" type="button" onClick={() => setMostrarModalLimpiar(true)}>
            Limpiar logs y auditorías
          </Button>
          <Button variant="secondary" type="button" onClick={() => setMostrarModalRetencion(true)}>
            Limpieza automática
          </Button>
        </div>
      )}

      {mostrarModalLimpiar && (
        <ModalLimpiarLogs
          diasPorDefecto={diasRetencion || 365}
          onClose={() => setMostrarModalLimpiar(false)}
          onLimpiado={async (resultado) => {
            setMostrarModalLimpiar(false);
            setPagina(1);
            await cargarEventos();
            window.alert(
              `Listo. Se eliminaron ${resultado.auditoriaEliminadas} eventos de auditoría y ` +
                `${resultado.historialEliminados} de historial de tickets.`
            );
          }}
        />
      )}

      {mostrarModalRetencion && (
        <ModalConfigurarRetencion
          diasActuales={diasRetencion || 365}
          onClose={() => setMostrarModalRetencion(false)}
          onGuardado={(dias) => {
            setDiasRetencion(dias);
            setMostrarModalRetencion(false);
          }}
        />
      )}
    </div>
  );
}

export default Auditoria;

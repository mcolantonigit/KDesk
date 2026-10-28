import { useEffect, useMemo, useState } from 'react';
import { useNuevoTicket } from '../context/NuevoTicketContext';
import { useEsMovil } from '../hooks/useEsMovil';
import {
  getTickets,
  cambiarEstado,
  cambiarTipo,
  cambiarPrioridad,
  asignarResponsable,
} from '../services/tickets.service';
import { getEstados } from '../services/estados.service';
import { getPrioridades } from '../services/prioridades.service';
import { getTiposTicket } from '../services/tiposTicket.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import { getUsuarios } from '../services/usuarios.service';
import TablaTicketsAdmin from '../components/TablaTicketsAdmin';
import TarjetasTickets from '../components/TarjetasTickets';
import ModalCerrarTicket from '../components/ModalCerrarTicket';
import Button from '../components/Button';
import Selector from '../components/Selector';
import { usePersistentState } from '../hooks/usePersistentState';
import { descargarCSV, filasACSV } from '../utils/exportar';
import '../styles/Tablero.css';

const ESTADOS_CERRADOS = ['Cerrado', 'Cancelado'];
const ROLES_TECNICOS = [2, 3];

const COLUMNAS_REPORTE = [
  { key: 'numero', label: 'ID' },
  { key: 'titulo', label: 'Detalle' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'prioridad', label: 'Prioridad' },
  { key: 'estado', label: 'Estado' },
  { key: 'usuarioCreador', label: 'Usuario' },
  { key: 'tecnicoResponsable', label: 'Responsable' },
  { key: 'sucursal', label: 'Sucursal' },
  { key: 'sector', label: 'Sector' },
  { key: 'fechaCreacion', label: 'Fecha de creación' },
  { key: 'fechaActualizacion', label: 'Última actualización' },
  { key: 'fechaCierre', label: 'Fecha de cierre' },
];

const FILTROS_INICIALES = {
  idSucursal: '',
  idSector: '',
  idEstado: '',
  idPrioridad: '',
  idTecnico: '',
  fechaDesde: '',
  fechaHasta: '',
};

const ICONO_LISTA = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const ICONO_TARJETAS = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);

function Tablero() {
  const { abrir: abrirNuevoTicket } = useNuevoTicket();
  const esMovil = useEsMovil();
  const [tickets, setTickets] = useState([]);
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

  const [vista, setVista] = usePersistentState('kdesk:tablero:vista', 'lista');
  // En el celular la tabla no entra: siempre se muestran las tarjetas (la elección guardada se respeta en la PC).
  const vistaMostrada = esMovil ? 'tarjetas' : vista;
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = usePersistentState('kdesk:tablero:filtros', FILTROS_INICIALES);
  const [busqueda, setBusqueda] = usePersistentState('kdesk:tablero:busqueda', '');
  const [ticketACerrar, setTicketACerrar] = useState(null);
  const [mostrarReporte, setMostrarReporte] = useState(false);

  async function cargarTodo({ mostrarCargando = true } = {}) {
    if (mostrarCargando) setCargando(true);
    try {
      const [ticketsData, estados, prioridades, tipos, sucursales, sectores, usuarios] = await Promise.all([
        getTickets(),
        getEstados(),
        getPrioridades(),
        getTiposTicket(),
        getSucursales(),
        getSectores(),
        getUsuarios(),
      ]);
      setTickets(ticketsData);
      setCatalogos({ estados, prioridades, tipos, sucursales, sectores, usuarios });
    } catch (err) {
      setError(err.message);
    } finally {
      if (mostrarCargando) setCargando(false);
    }
  }

  async function refrescarTickets() {
    try {
      const ticketsData = await getTickets();
      setTickets(ticketsData);
    } catch (err) {
      window.alert(err.message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTodo();
  }, []);

  const usuariosPorId = useMemo(
    () => Object.fromEntries(catalogos.usuarios.map((usuario) => [usuario.id, usuario])),
    [catalogos.usuarios]
  );
  const tecnicos = useMemo(
    () => catalogos.usuarios.filter((usuario) => ROLES_TECNICOS.includes(usuario.id_rol)),
    [catalogos.usuarios]
  );

  const ticketsEnriquecidos = useMemo(() => {
    const estadosPorId = Object.fromEntries(catalogos.estados.map((estado) => [estado.id, estado.nombre]));
    const prioridadesPorId = Object.fromEntries(
      catalogos.prioridades.map((prioridad) => [prioridad.id, prioridad.nombre])
    );
    const tiposPorId = Object.fromEntries(catalogos.tipos.map((tipo) => [tipo.id, tipo.nombre]));
    const sucursalesPorId = Object.fromEntries(
      catalogos.sucursales.map((sucursal) => [sucursal.id, sucursal.nombre])
    );
    const sectoresPorId = Object.fromEntries(catalogos.sectores.map((sector) => [sector.id, sector.nombre]));

    function nombreUsuario(idUsuario) {
      const usuario = usuariosPorId[idUsuario];
      return usuario ? `${usuario.nombre} ${usuario.apellido}` : '—';
    }

    return tickets.map((ticket) => ({
      ...ticket,
      estado: estadosPorId[ticket.id_estado] ?? '—',
      prioridad: prioridadesPorId[ticket.id_prioridad ?? ticket.id_prioridad_sugerida] ?? '—',
      idPrioridadEfectiva: ticket.id_prioridad ?? ticket.id_prioridad_sugerida,
      tipo: tiposPorId[ticket.id_tipo] ?? '—',
      sucursal: sucursalesPorId[ticket.id_sucursal] ?? '—',
      sector: sectoresPorId[ticket.id_sector] ?? '—',
      usuarioCreador: nombreUsuario(ticket.id_usuario_creador),
      tecnicoResponsable: ticket.id_tecnico_responsable ? nombreUsuario(ticket.id_tecnico_responsable) : 'Sin asignar',
    }));
  }, [tickets, catalogos, usuariosPorId]);

  const ticketsFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return ticketsEnriquecidos.filter((ticket) => {
      if (filtros.idEstado === '' && ESTADOS_CERRADOS.includes(ticket.estado)) return false;
      if (filtros.idEstado === 'todos') {
        // sin restricción de estado
      } else if (filtros.idEstado !== '' && ticket.id_estado !== Number(filtros.idEstado)) {
        return false;
      }

      if (filtros.idSucursal !== '' && ticket.id_sucursal !== Number(filtros.idSucursal)) return false;
      if (filtros.idSector !== '' && ticket.id_sector !== Number(filtros.idSector)) return false;
      if (filtros.idPrioridad !== '' && ticket.idPrioridadEfectiva !== Number(filtros.idPrioridad)) return false;

      if (filtros.idTecnico === 'sin-asignar' && ticket.id_tecnico_responsable !== null) return false;
      if (
        filtros.idTecnico !== '' &&
        filtros.idTecnico !== 'sin-asignar' &&
        ticket.id_tecnico_responsable !== Number(filtros.idTecnico)
      ) {
        return false;
      }

      if (filtros.fechaDesde) {
        const desde = new Date(`${filtros.fechaDesde}T00:00:00`);
        if (new Date(ticket.fecha_creacion) < desde) return false;
      }
      if (filtros.fechaHasta) {
        const hasta = new Date(`${filtros.fechaHasta}T23:59:59`);
        if (new Date(ticket.fecha_creacion) > hasta) return false;
      }

      if (busquedaNormalizada) {
        const campos = [ticket.numero, ticket.titulo, ticket.descripcion, ticket.usuarioCreador, ticket.tecnicoResponsable];
        const coincide = campos.some((campo) => campo?.toLowerCase().includes(busquedaNormalizada));
        if (!coincide) return false;
      }

      return true;
    });
  }, [ticketsEnriquecidos, filtros, busqueda]);

  function handleFiltroChange(campo, valor) {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  async function handleCambiarEstado(ticket, idEstado) {
    try {
      await cambiarEstado(ticket.id, idEstado);
      await refrescarTickets();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleCambiarTipo(ticket, idTipo) {
    try {
      await cambiarTipo(ticket.id, idTipo);
      await refrescarTickets();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleCambiarPrioridad(ticket, idPrioridad) {
    try {
      await cambiarPrioridad(ticket.id, idPrioridad);
      await refrescarTickets();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleAsignarResponsable(ticket, idTecnicoResponsable) {
    try {
      await asignarResponsable(ticket.id, idTecnicoResponsable);
      await refrescarTickets();
    } catch (err) {
      window.alert(err.message);
    }
  }

  function handleExportarCSV() {
    const filasReporte = ticketsFiltrados.map((ticket) => ({
      ...ticket,
      fechaCreacion: new Date(ticket.fecha_creacion).toLocaleString(),
      fechaActualizacion: new Date(ticket.fecha_actualizacion).toLocaleString(),
      fechaCierre: ticket.fecha_cierre ? new Date(ticket.fecha_cierre).toLocaleString() : '',
    }));
    descargarCSV('tablero-kdesk.csv', filasACSV(COLUMNAS_REPORTE, filasReporte));
    setMostrarReporte(false);
  }

  function handleExportarPDF() {
    setMostrarReporte(false);
    window.print();
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;

  return (
    <div className={vistaMostrada === 'lista' ? 'tablero tablero-con-tabla' : 'tablero'}>
      <h1 className="solo-imprimir">Tablero</h1>

      <div className="tablero-toolbar no-imprimir">
        <div className="tablero-toolbar-fila">
          <div className="tablero-vista-toggle">
            <button
              type="button"
              className={`tablero-vista-btn ${vista === 'lista' ? 'activo' : ''}`}
              onClick={() => setVista('lista')}
            >
              {ICONO_LISTA} Lista
            </button>
            <button
              type="button"
              className={`tablero-vista-btn ${vista === 'tarjetas' ? 'activo' : ''}`}
              onClick={() => setVista('tarjetas')}
            >
              {ICONO_TARJETAS} Tarjetas
            </button>
          </div>

          <Button variant="secondary" size="sm" type="button" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            Filtrar
          </Button>

          <input
            className="tablero-busqueda"
            type="text"
            placeholder={esMovil ? 'Buscar tickets...' : 'Buscar por número, usuario, título, contenido o responsable...'}
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />

          <Button type="button" size="sm" onClick={abrirNuevoTicket}>
            Nuevo ticket
          </Button>

          <div className="tablero-reporte">
            <Button variant="secondary" size="sm" type="button" onClick={() => setMostrarReporte(!mostrarReporte)}>
              Generar reporte
            </Button>
            {mostrarReporte && (
              <div className="tablero-reporte-panel">
                <button type="button" onClick={handleExportarCSV}>
                  Exportar CSV
                </button>
                <button type="button" onClick={handleExportarPDF}>
                  Exportar PDF (imprimir)
                </button>
              </div>
            )}
          </div>
        </div>

        {mostrarFiltros && (
          <div className="tablero-filtros">
            <label className="tablero-campo">
              <span>Sucursal</span>
              <Selector aria-label="Sucursal" value={filtros.idSucursal} onChange={(event) => handleFiltroChange('idSucursal', event.target.value)}>
                <option value="">Todas</option>
                {catalogos.sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </Selector>
            </label>

            <label className="tablero-campo">
              <span>Sector</span>
              <Selector aria-label="Sector" value={filtros.idSector} onChange={(event) => handleFiltroChange('idSector', event.target.value)}>
                <option value="">Todos</option>
                {catalogos.sectores.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.nombre}
                  </option>
                ))}
              </Selector>
            </label>

            <label className="tablero-campo">
              <span>Estado</span>
              <Selector aria-label="Estado" value={filtros.idEstado} onChange={(event) => handleFiltroChange('idEstado', event.target.value)}>
                <option value="">Activos</option>
                <option value="todos">Todos</option>
                {catalogos.estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </Selector>
            </label>

            <label className="tablero-campo">
              <span>Prioridad</span>
              <Selector aria-label="Prioridad" value={filtros.idPrioridad} onChange={(event) => handleFiltroChange('idPrioridad', event.target.value)}>
                <option value="">Todas</option>
                {catalogos.prioridades.map((prioridad) => (
                  <option key={prioridad.id} value={prioridad.id}>
                    {prioridad.nombre}
                  </option>
                ))}
              </Selector>
            </label>

            <label className="tablero-campo">
              <span>Responsable</span>
              <Selector aria-label="Responsable" value={filtros.idTecnico} onChange={(event) => handleFiltroChange('idTecnico', event.target.value)}>
                <option value="">Todos</option>
                <option value="sin-asignar">Sin asignar</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre} {tecnico.apellido}
                  </option>
                ))}
              </Selector>
            </label>

            <label className="tablero-campo">
              <span>Fecha desde</span>
              <input
                type="date"
                value={filtros.fechaDesde}
                max={filtros.fechaHasta || undefined}
                onChange={(event) => handleFiltroChange('fechaDesde', event.target.value)}
              />
            </label>

            <label className="tablero-campo">
              <span>Fecha hasta</span>
              <input
                type="date"
                value={filtros.fechaHasta}
                min={filtros.fechaDesde || undefined}
                onChange={(event) => handleFiltroChange('fechaHasta', event.target.value)}
              />
            </label>
          </div>
        )}
      </div>

      {vistaMostrada === 'lista' ? (
        <TablaTicketsAdmin
          tickets={ticketsFiltrados}
          catalogos={catalogos}
          tecnicos={tecnicos}
          onCerrar={setTicketACerrar}
          onCambiarEstado={handleCambiarEstado}
          onCambiarTipo={handleCambiarTipo}
          onCambiarPrioridad={handleCambiarPrioridad}
          onAsignarResponsable={handleAsignarResponsable}
        />
      ) : (
        <TarjetasTickets
          tickets={ticketsFiltrados}
          catalogos={catalogos}
          tecnicos={tecnicos}
          onCerrar={setTicketACerrar}
          onCambiarEstado={handleCambiarEstado}
          onCambiarTipo={handleCambiarTipo}
          onCambiarPrioridad={handleCambiarPrioridad}
          onAsignarResponsable={handleAsignarResponsable}
        />
      )}

      {ticketACerrar && (
        <ModalCerrarTicket
          ticket={ticketACerrar}
          onClose={() => setTicketACerrar(null)}
          onCerrado={async () => {
            setTicketACerrar(null);
            await refrescarTickets();
          }}
        />
      )}
    </div>
  );
}

export default Tablero;

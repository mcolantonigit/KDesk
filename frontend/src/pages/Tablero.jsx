import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getTickets,
  cambiarEstado,
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
import '../styles/Tablero.css';

const ESTADOS_CERRADOS = ['Cerrado', 'Cancelado'];
const ROLES_TECNICOS = [2, 3];

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

  const [vista, setVista] = useState('lista');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [ticketACerrar, setTicketACerrar] = useState(null);

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

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;

  return (
    <div className="tablero">
      <h1>Tablero</h1>

      <div className="tablero-toolbar">
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

          <Button variant="secondary" type="button" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            Filtrar
          </Button>

          <input
            className="tablero-busqueda"
            type="text"
            placeholder="Buscar por número, usuario, título, contenido o responsable..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />

          <Link to="/tickets/nuevo">
            <Button type="button">Nuevo ticket</Button>
          </Link>
        </div>

        {mostrarFiltros && (
          <div className="tablero-filtros">
            <label className="tablero-campo">
              <span>Sucursal</span>
              <select value={filtros.idSucursal} onChange={(event) => handleFiltroChange('idSucursal', event.target.value)}>
                <option value="">Todas</option>
                {catalogos.sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="tablero-campo">
              <span>Sector</span>
              <select value={filtros.idSector} onChange={(event) => handleFiltroChange('idSector', event.target.value)}>
                <option value="">Todos</option>
                {catalogos.sectores.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="tablero-campo">
              <span>Estado</span>
              <select value={filtros.idEstado} onChange={(event) => handleFiltroChange('idEstado', event.target.value)}>
                <option value="">Activos</option>
                <option value="todos">Todos</option>
                {catalogos.estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="tablero-campo">
              <span>Prioridad</span>
              <select value={filtros.idPrioridad} onChange={(event) => handleFiltroChange('idPrioridad', event.target.value)}>
                <option value="">Todas</option>
                {catalogos.prioridades.map((prioridad) => (
                  <option key={prioridad.id} value={prioridad.id}>
                    {prioridad.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="tablero-campo">
              <span>Responsable</span>
              <select value={filtros.idTecnico} onChange={(event) => handleFiltroChange('idTecnico', event.target.value)}>
                <option value="">Todos</option>
                <option value="sin-asignar">Sin asignar</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre} {tecnico.apellido}
                  </option>
                ))}
              </select>
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

      {vista === 'lista' ? (
        <TablaTicketsAdmin
          tickets={ticketsFiltrados}
          catalogos={catalogos}
          tecnicos={tecnicos}
          onCerrar={setTicketACerrar}
          onCambiarEstado={handleCambiarEstado}
          onCambiarPrioridad={handleCambiarPrioridad}
          onAsignarResponsable={handleAsignarResponsable}
        />
      ) : (
        <TarjetasTickets tickets={ticketsFiltrados} onCerrar={setTicketACerrar} />
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

import { useEffect, useMemo, useState } from 'react';
import { getTickets } from '../services/tickets.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import { getTiposTicket } from '../services/tiposTicket.service';
import { getPrioridades } from '../services/prioridades.service';
import { getUsuarios } from '../services/usuarios.service';
import BarChartHorizontal from '../components/BarChartHorizontal';
import '../styles/Tablero.css';
import '../styles/Estadisticas.css';

function contarPor(tickets, obtenerClave, nombresPorClave) {
  const conteos = new Map();
  for (const ticket of tickets) {
    const clave = obtenerClave(ticket);
    conteos.set(clave, (conteos.get(clave) ?? 0) + 1);
  }
  return [...conteos.entries()]
    .map(([clave, value]) => ({ label: nombresPorClave(clave), value }))
    .sort((a, b) => b.value - a.value);
}

function Estadisticas() {
  const [tickets, setTickets] = useState([]);
  const [catalogos, setCatalogos] = useState({
    sucursales: [],
    sectores: [],
    tipos: [],
    prioridades: [],
    usuarios: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const [ticketsData, sucursales, sectores, tipos, prioridades, usuarios] = await Promise.all([
          getTickets(),
          getSucursales(),
          getSectores(),
          getTiposTicket(),
          getPrioridades(),
          getUsuarios(),
        ]);
        setTickets(ticketsData);
        setCatalogos({ sucursales, sectores, tipos, prioridades, usuarios });
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((ticket) => {
      if (fechaDesde && new Date(ticket.fecha_creacion) < new Date(`${fechaDesde}T00:00:00`)) return false;
      if (fechaHasta && new Date(ticket.fecha_creacion) > new Date(`${fechaHasta}T23:59:59`)) return false;
      return true;
    });
  }, [tickets, fechaDesde, fechaHasta]);

  const nombresPorId = useMemo(
    () => Object.fromEntries(catalogos.usuarios.map((usuario) => [usuario.id, `${usuario.nombre} ${usuario.apellido}`])),
    [catalogos.usuarios]
  );
  const sucursalesPorId = useMemo(
    () => Object.fromEntries(catalogos.sucursales.map((sucursal) => [sucursal.id, sucursal.nombre])),
    [catalogos.sucursales]
  );
  const sectoresPorId = useMemo(
    () => Object.fromEntries(catalogos.sectores.map((sector) => [sector.id, sector.nombre])),
    [catalogos.sectores]
  );
  const tiposPorId = useMemo(
    () => Object.fromEntries(catalogos.tipos.map((tipo) => [tipo.id, tipo.nombre])),
    [catalogos.tipos]
  );
  const prioridadesPorId = useMemo(
    () => Object.fromEntries(catalogos.prioridades.map((prioridad) => [prioridad.id, prioridad.nombre])),
    [catalogos.prioridades]
  );

  const porSucursal = useMemo(
    () => contarPor(ticketsFiltrados, (t) => t.id_sucursal, (id) => sucursalesPorId[id] ?? '—'),
    [ticketsFiltrados, sucursalesPorId]
  );
  const porSector = useMemo(
    () => contarPor(ticketsFiltrados, (t) => t.id_sector, (id) => sectoresPorId[id] ?? '—'),
    [ticketsFiltrados, sectoresPorId]
  );
  const porTecnico = useMemo(
    () =>
      contarPor(
        ticketsFiltrados,
        (t) => t.id_tecnico_responsable ?? 'sin-asignar',
        (id) => (id === 'sin-asignar' ? 'Sin asignar' : nombresPorId[id] ?? '—')
      ),
    [ticketsFiltrados, nombresPorId]
  );
  const porPrioridad = useMemo(
    () =>
      contarPor(
        ticketsFiltrados,
        (t) => t.id_prioridad ?? t.id_prioridad_sugerida,
        (id) => prioridadesPorId[id] ?? '—'
      ),
    [ticketsFiltrados, prioridadesPorId]
  );
  const porTipo = useMemo(
    () => contarPor(ticketsFiltrados, (t) => t.id_tipo, (id) => tiposPorId[id] ?? '—'),
    [ticketsFiltrados, tiposPorId]
  );

  const ticketsCerrados = useMemo(
    () => ticketsFiltrados.filter((ticket) => ticket.fecha_cierre),
    [ticketsFiltrados]
  );

  const diasResolucionPromedio = useMemo(() => {
    if (ticketsCerrados.length === 0) return null;
    const total = ticketsCerrados.reduce(
      (suma, ticket) => suma + (new Date(ticket.fecha_cierre) - new Date(ticket.fecha_creacion)),
      0
    );
    return total / ticketsCerrados.length / 86400000;
  }, [ticketsCerrados]);

  const resolucionPorTecnico = useMemo(() => {
    const grupos = new Map();
    for (const ticket of ticketsCerrados) {
      const clave = ticket.id_tecnico_responsable ?? 'sin-asignar';
      const dias = (new Date(ticket.fecha_cierre) - new Date(ticket.fecha_creacion)) / 86400000;
      const grupo = grupos.get(clave) ?? { suma: 0, cantidad: 0 };
      grupo.suma += dias;
      grupo.cantidad += 1;
      grupos.set(clave, grupo);
    }
    return [...grupos.entries()]
      .map(([clave, { suma, cantidad }]) => ({
        label: clave === 'sin-asignar' ? 'Sin asignar' : nombresPorId[clave] ?? '—',
        value: suma / cantidad,
      }))
      .sort((a, b) => b.value - a.value);
  }, [ticketsCerrados, nombresPorId]);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;

  return (
    <div className="tablero">
      <h1>Estadísticas</h1>

      <div className="tablero-toolbar">
        <div className="tablero-toolbar-fila">
          <label className="tablero-campo">
            <span>Fecha desde</span>
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(event) => setFechaDesde(event.target.value)}
            />
          </label>
          <label className="tablero-campo">
            <span>Fecha hasta</span>
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(event) => setFechaHasta(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="estadisticas-hero">
        <span className="estadisticas-hero-valor">
          {diasResolucionPromedio === null ? '—' : diasResolucionPromedio.toFixed(1)}
        </span>
        <span className="estadisticas-hero-etiqueta">días promedio de resolución ({ticketsCerrados.length} tickets cerrados)</span>
      </div>

      <div className="estadisticas-grid">
        <div className="estadisticas-card">
          <h2>Tiempo de resolución por técnico</h2>
          <BarChartHorizontal data={resolucionPorTecnico} formatValue={(value) => `${value.toFixed(1)}d`} />
        </div>

        <div className="estadisticas-card">
          <h2>Tickets por sucursal</h2>
          <BarChartHorizontal data={porSucursal} />
        </div>

        <div className="estadisticas-card">
          <h2>Tickets por sector</h2>
          <BarChartHorizontal data={porSector} />
        </div>

        <div className="estadisticas-card">
          <h2>Tickets por técnico</h2>
          <BarChartHorizontal data={porTecnico} />
        </div>

        <div className="estadisticas-card">
          <h2>Tickets por prioridad</h2>
          <BarChartHorizontal data={porPrioridad} />
        </div>

        <div className="estadisticas-card">
          <h2>Tickets por tipo</h2>
          <BarChartHorizontal data={porTipo} />
        </div>
      </div>
    </div>
  );
}

export default Estadisticas;

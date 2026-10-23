import { useMemo, useState } from 'react';
import { useAsideTicket } from '../context/AsideTicketContext';
import { useColumnasAnchos } from '../hooks/useColumnasAnchos';
import { useColumnasOrden } from '../hooks/useColumnasOrden';
import { usePersistentState } from '../hooks/usePersistentState';
import ThRedimensionable from './ThRedimensionable';
import Button from './Button';
import '../styles/TablaTickets.css';

const COLUMNAS = [
  { key: 'numero', label: 'ID', visiblePorDefecto: true },
  { key: 'titulo', label: 'Detalle', visiblePorDefecto: true },
  { key: 'tipo', label: 'Tipo', visiblePorDefecto: true },
  { key: 'prioridad', label: 'Prioridad', visiblePorDefecto: true },
  { key: 'estado', label: 'Estado', visiblePorDefecto: true },
  { key: 'usuarioCreador', label: 'Usuario', visiblePorDefecto: true },
  { key: 'tecnicoResponsable', label: 'Responsable', visiblePorDefecto: true },
  { key: 'sucursal', label: 'Sucursal', visiblePorDefecto: true },
  { key: 'sector', label: 'Sector', visiblePorDefecto: true },
  { key: 'fecha_creacion', label: 'Fecha de creación', visiblePorDefecto: true },
  { key: 'fecha_actualizacion', label: 'Última actualización', visiblePorDefecto: false },
  { key: 'fecha_cierre', label: 'Fecha de cierre', visiblePorDefecto: false },
];

const ESTADO_CERRADO = 'Cerrado';

const ANCHOS_POR_DEFECTO = {
  numero: 120,
  titulo: 340,
  tipo: 140,
  prioridad: 140,
  estado: 150,
  usuarioCreador: 170,
  tecnicoResponsable: 200,
  sucursal: 150,
  sector: 150,
  fecha_creacion: 190,
  fecha_actualizacion: 190,
  fecha_cierre: 170,
};
const ANCHO_ACCIONES = 120;
const CLAVE_TABLA = 'tablero';
const CLAVES = COLUMNAS.map((columna) => columna.key);
const ORDEN_FILAS_POR_DEFECTO = { por: 'fecha_creacion', asc: false };

function TablaTicketsAdmin({ tickets, catalogos, tecnicos, onCerrar, onCambiarEstado, onCambiarPrioridad, onAsignarResponsable }) {
  // Todo lo que el usuario elige de la tabla (orden de filas, columnas
  // visibles, su orden y sus anchos) se recuerda en el navegador.
  const [ordenFilas, setOrdenFilas] = usePersistentState(`kdesk:tabla:${CLAVE_TABLA}:orden-filas`, ORDEN_FILAS_POR_DEFECTO);
  const [visiblesGuardadas, setVisiblesGuardadas] = usePersistentState(`kdesk:tabla:${CLAVE_TABLA}:visibles`, {});
  const [mostrarColumnas, setMostrarColumnas] = useState(false);
  const { abrirTicket } = useAsideTicket();
  const { anchos, cambiarAncho, resetearAncho, restablecerAnchos } = useColumnasAnchos(CLAVE_TABLA, ANCHOS_POR_DEFECTO);
  const { orden, moverColumna, restablecerOrden } = useColumnasOrden(CLAVE_TABLA, CLAVES);

  const ordenPor = CLAVES.includes(ordenFilas.por) ? ordenFilas.por : ORDEN_FILAS_POR_DEFECTO.por;
  const ordenAsc = CLAVES.includes(ordenFilas.por) ? ordenFilas.asc : ORDEN_FILAS_POR_DEFECTO.asc;
  const columnasVisibles = {
    ...Object.fromEntries(COLUMNAS.map((columna) => [columna.key, columna.visiblePorDefecto])),
    ...visiblesGuardadas,
  };
  const columnasActivas = orden
    .map((clave) => COLUMNAS.find((columna) => columna.key === clave))
    .filter((columna) => columnasVisibles[columna.key]);
  const anchoTotal = columnasActivas.reduce((suma, columna) => suma + anchos[columna.key], ANCHO_ACCIONES);

  const ticketsOrdenados = useMemo(() => {
    const copia = [...tickets];
    copia.sort((a, b) => {
      const valorA = a[ordenPor] ?? '';
      const valorB = b[ordenPor] ?? '';
      if (valorA < valorB) return ordenAsc ? -1 : 1;
      if (valorA > valorB) return ordenAsc ? 1 : -1;
      return 0;
    });
    return copia;
  }, [tickets, ordenPor, ordenAsc]);

  function handleOrdenar(clave) {
    setOrdenFilas(clave === ordenPor ? { por: clave, asc: !ordenAsc } : { por: clave, asc: true });
  }

  function toggleColumna(key) {
    setVisiblesGuardadas({ ...columnasVisibles, [key]: !columnasVisibles[key] });
  }

  function restablecerTabla() {
    setVisiblesGuardadas({});
    restablecerAnchos();
    restablecerOrden();
  }

  function renderCelda(ticket, key) {
    switch (key) {
      case 'numero':
        return ticket.numero;
      case 'titulo':
        return <span className="tabla-tickets-detalle">{ticket.titulo}</span>;
      case 'tipo':
        return ticket.tipo;
      case 'prioridad':
        return (
          <select
            value={ticket.idPrioridadEfectiva ?? ''}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onCambiarPrioridad(ticket, Number(event.target.value))}
          >
            {catalogos.prioridades.map((prioridad) => (
              <option key={prioridad.id} value={prioridad.id}>
                {prioridad.nombre}
              </option>
            ))}
          </select>
        );
      case 'estado':
        return (
          <select
            value={ticket.id_estado}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onCambiarEstado(ticket, Number(event.target.value))}
          >
            {catalogos.estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        );
      case 'usuarioCreador':
        return ticket.usuarioCreador;
      case 'tecnicoResponsable':
        return (
          <select
            value={ticket.id_tecnico_responsable ?? ''}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onAsignarResponsable(ticket, Number(event.target.value))}
          >
            <option value="" disabled>
              Sin asignar
            </option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nombre} {tecnico.apellido}
              </option>
            ))}
          </select>
        );
      case 'sucursal':
        return ticket.sucursal;
      case 'sector':
        return ticket.sector;
      case 'fecha_creacion':
        return new Date(ticket.fecha_creacion).toLocaleDateString();
      case 'fecha_actualizacion':
        return new Date(ticket.fecha_actualizacion).toLocaleDateString();
      case 'fecha_cierre':
        return ticket.fecha_cierre ? new Date(ticket.fecha_cierre).toLocaleDateString() : '—';
      default:
        return null;
    }
  }

  return (
    <div className="tabla-tickets-contenedor">
      <div className="tabla-tickets-columnas no-imprimir">
        <Button variant="secondary" size="sm" type="button" onClick={() => setMostrarColumnas(!mostrarColumnas)}>
          Columnas
        </Button>
        {mostrarColumnas && (
          <div className="tabla-tickets-columnas-panel">
            {COLUMNAS.map((columna) => (
              <label key={columna.key}>
                <input
                  type="checkbox"
                  checked={columnasVisibles[columna.key]}
                  onChange={() => toggleColumna(columna.key)}
                />
                {columna.label}
              </label>
            ))}
            <button type="button" className="tabla-tickets-restablecer" onClick={restablecerTabla}>
              Restablecer columnas
            </button>
          </div>
        )}
      </div>

      <div className="tabla-tickets-scroll">
        <table className="tabla-tickets tabla-tickets-fija" style={{ width: anchoTotal, minWidth: '100%' }}>
          <colgroup>
            {columnasActivas.map((columna) => (
              <col key={columna.key} style={{ width: anchos[columna.key] }} />
            ))}
            <col style={{ width: ANCHO_ACCIONES }} />
          </colgroup>
          <thead>
            <tr>
              {columnasActivas.map((columna) => (
                <ThRedimensionable
                  key={columna.key}
                  clave={columna.key}
                  etiqueta={columna.label}
                  ancho={anchos[columna.key]}
                  onResize={(ancho) => cambiarAncho(columna.key, ancho)}
                  onReset={() => resetearAncho(columna.key)}
                  onMover={moverColumna}
                  onClick={() => handleOrdenar(columna.key)}
                >
                  {columna.label}
                  {ordenPor === columna.key && <span className="tabla-tickets-orden">{ordenAsc ? ' ▲' : ' ▼'}</span>}
                </ThRedimensionable>
              ))}
              <th className="no-imprimir tabla-tickets-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsOrdenados.map((ticket) => (
              <tr key={ticket.id} onClick={() => abrirTicket(ticket.id)}>
                {columnasActivas.map((columna) => (
                  <td key={columna.key}>{renderCelda(ticket, columna.key)}</td>
                ))}
                <td className="no-imprimir tabla-tickets-acciones" onClick={(event) => event.stopPropagation()}>
                  {ticket.estado !== ESTADO_CERRADO && (
                    <Button variant="secondary" size="sm" onClick={() => onCerrar(ticket)}>
                      Cerrar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {ticketsOrdenados.length === 0 && (
              <tr>
                <td colSpan={columnasActivas.length + 1} className="tabla-tickets-vacio">
                  No hay tickets para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaTicketsAdmin;

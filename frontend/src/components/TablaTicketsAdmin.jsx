import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function TablaTicketsAdmin({ tickets, catalogos, tecnicos, onCerrar, onCambiarEstado, onCambiarPrioridad, onAsignarResponsable }) {
  const [ordenPor, setOrdenPor] = useState('fecha_creacion');
  const [ordenAsc, setOrdenAsc] = useState(false);
  const [mostrarColumnas, setMostrarColumnas] = useState(false);
  const [columnasVisibles, setColumnasVisibles] = useState(() =>
    Object.fromEntries(COLUMNAS.map((columna) => [columna.key, columna.visiblePorDefecto]))
  );
  const navigate = useNavigate();

  const columnasActivas = COLUMNAS.filter((columna) => columnasVisibles[columna.key]);

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

  function handleOrdenar(columna) {
    if (columna === ordenPor) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenPor(columna);
      setOrdenAsc(true);
    }
  }

  function toggleColumna(key) {
    setColumnasVisibles((anteriores) => ({ ...anteriores, [key]: !anteriores[key] }));
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
      <div className="tabla-tickets-columnas">
        <Button variant="secondary" type="button" onClick={() => setMostrarColumnas(!mostrarColumnas)}>
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
          </div>
        )}
      </div>

      <div className="tabla-tickets-scroll">
        <table className="tabla-tickets">
          <thead>
            <tr>
              {columnasActivas.map((columna) => (
                <th key={columna.key} onClick={() => handleOrdenar(columna.key)}>
                  {columna.label}
                  {ordenPor === columna.key && <span className="tabla-tickets-orden">{ordenAsc ? ' ▲' : ' ▼'}</span>}
                </th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsOrdenados.map((ticket) => (
              <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                {columnasActivas.map((columna) => (
                  <td key={columna.key}>{renderCelda(ticket, columna.key)}</td>
                ))}
                <td onClick={(event) => event.stopPropagation()}>
                  {ticket.estado !== ESTADO_CERRADO && (
                    <Button variant="secondary" onClick={() => onCerrar(ticket)}>
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

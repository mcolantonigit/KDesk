import { useMemo } from 'react';
import { useAsideTicket } from '../context/AsideTicketContext';
import { useColumnasAnchos } from '../hooks/useColumnasAnchos';
import { useColumnasOrden } from '../hooks/useColumnasOrden';
import { usePersistentState } from '../hooks/usePersistentState';
import { useEsMovil } from '../hooks/useEsMovil';
import ThRedimensionable from './ThRedimensionable';
import ListaTicketsMovil from './ListaTicketsMovil';
import '../styles/TablaTickets.css';
import { formatearFechaHora } from '../utils/fechas';

const CLAVE_TABLA = 'tickets';

const COLUMNAS = [
  { key: 'numero', label: 'ID', renderCelda: (ticket) => ticket.numero },
  { key: 'prioridad', label: 'Prioridad', renderCelda: (ticket) => ticket.prioridad },
  { key: 'titulo', label: 'Detalle', className: 'tabla-tickets-detalle', renderCelda: (ticket) => ticket.titulo },
  { key: 'estado', label: 'Estado', renderCelda: (ticket) => ticket.estado },
  {
    key: 'fecha_creacion',
    label: 'Fecha de creación',
    renderCelda: (ticket) => formatearFechaHora(ticket.fecha_creacion),
  },
];

const CLAVES = COLUMNAS.map((columna) => columna.key);
const ANCHOS_POR_DEFECTO = { numero: 120, prioridad: 130, titulo: 420, estado: 140, fecha_creacion: 190 };
const ORDEN_FILAS_POR_DEFECTO = { por: 'fecha_creacion', asc: false };

function TablaTickets({ tickets }) {
  const esMovil = useEsMovil();
  const { abrirTicket } = useAsideTicket();
  const { anchos, cambiarAncho, resetearAncho } = useColumnasAnchos(CLAVE_TABLA, ANCHOS_POR_DEFECTO);
  const { orden, moverColumna } = useColumnasOrden(CLAVE_TABLA, CLAVES);
  const [ordenFilas, setOrdenFilas] = usePersistentState(`kdesk:tabla:${CLAVE_TABLA}:orden-filas`, ORDEN_FILAS_POR_DEFECTO);

  const columnas = orden.map((clave) => COLUMNAS.find((columna) => columna.key === clave));
  const anchoTotal = columnas.reduce((suma, columna) => suma + anchos[columna.key], 0);
  const ordenPor = CLAVES.includes(ordenFilas.por) ? ordenFilas.por : ORDEN_FILAS_POR_DEFECTO.por;
  const ordenAsc = CLAVES.includes(ordenFilas.por) ? ordenFilas.asc : ORDEN_FILAS_POR_DEFECTO.asc;

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

  if (esMovil) {
    return (
      <ListaTicketsMovil
        tickets={ticketsOrdenados}
        ordenPor={ordenPor}
        ordenAsc={ordenAsc}
        opcionesOrden={COLUMNAS.map((columna) => ({ clave: columna.key, etiqueta: columna.label }))}
        onOrdenar={handleOrdenar}
        onAbrir={abrirTicket}
      />
    );
  }

  return (
    <div className="tabla-tickets-scroll">
      <table className="tabla-tickets tabla-tickets-fija" style={{ width: anchoTotal, minWidth: '100%' }}>
        <colgroup>
          {columnas.map((columna) => (
            <col key={columna.key} style={{ width: anchos[columna.key] }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columnas.map((columna) => (
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
          </tr>
        </thead>
        <tbody>
          {ticketsOrdenados.map((ticket) => (
            <tr key={ticket.id} onClick={() => abrirTicket(ticket.id)}>
              {columnas.map((columna) => (
                <td key={columna.key} className={columna.className}>
                  {columna.renderCelda(ticket)}
                </td>
              ))}
            </tr>
          ))}
          {ticketsOrdenados.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="tabla-tickets-vacio">
                No hay tickets para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaTickets;

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TablaTickets.css';

const COLUMNAS = [
  { key: 'numero', label: 'ID' },
  { key: 'prioridad', label: 'Prioridad' },
  { key: 'titulo', label: 'Detalle' },
  { key: 'estado', label: 'Estado' },
  { key: 'fecha_creacion', label: 'Fecha de creación' },
];

function TablaTickets({ tickets }) {
  const [ordenPor, setOrdenPor] = useState('fecha_creacion');
  const [ordenAsc, setOrdenAsc] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="tabla-tickets-scroll">
      <table className="tabla-tickets">
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
          {ticketsOrdenados.map((ticket) => (
            <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}>
              <td>{ticket.numero}</td>
              <td>{ticket.prioridad}</td>
              <td className="tabla-tickets-detalle">{ticket.titulo}</td>
              <td>{ticket.estado}</td>
              <td>{new Date(ticket.fecha_creacion).toLocaleDateString()}</td>
            </tr>
          ))}
          {ticketsOrdenados.length === 0 && (
            <tr>
              <td colSpan={COLUMNAS.length} className="tabla-tickets-vacio">
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

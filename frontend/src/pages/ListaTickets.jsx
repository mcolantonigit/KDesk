import { useEffect, useState } from 'react';
import { getTickets } from '../services/tickets.service';
import { getEstados } from '../services/estados.service';
import { getPrioridades } from '../services/prioridades.service';
import TablaTickets from '../components/TablaTickets';
import '../styles/Tablero.css';

const ESTADOS_CERRADOS = ['Cerrado', 'Cancelado'];

function ListaTickets({ soloCerrados }) {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const [ticketsData, estados, prioridades] = await Promise.all([
          getTickets(),
          getEstados(),
          getPrioridades(),
        ]);

        const estadosPorId = Object.fromEntries(estados.map((estado) => [estado.id, estado.nombre]));
        const prioridadesPorId = Object.fromEntries(prioridades.map((prioridad) => [prioridad.id, prioridad.nombre]));

        const ticketsConNombres = ticketsData.map((ticket) => ({
          ...ticket,
          estado: estadosPorId[ticket.id_estado] ?? '—',
          prioridad: prioridadesPorId[ticket.id_prioridad ?? ticket.id_prioridad_sugerida] ?? '—',
        }));

        const ticketsFiltrados = ticketsConNombres.filter((ticket) =>
          soloCerrados ? ESTADOS_CERRADOS.includes(ticket.estado) : !ESTADOS_CERRADOS.includes(ticket.estado)
        );

        setTickets(ticketsFiltrados);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [soloCerrados]);

  return (
    <div className="tablero">
      <h1>{soloCerrados ? 'Tickets cerrados' : 'Tickets activos'}</h1>

      {error && <p className="ticket-form-error">{error}</p>}
      {cargando ? <p>Cargando...</p> : <TablaTickets tickets={tickets} />}
    </div>
  );
}

export default ListaTickets;

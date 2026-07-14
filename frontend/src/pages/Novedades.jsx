import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTickets } from '../services/tickets.service';
import { getEstados } from '../services/estados.service';
import Button from '../components/Button';
import '../styles/Inicio.css';

const ESTADOS_CERRADOS = ['Cerrado', 'Cancelado'];
const CANTIDAD_LISTA = 5;

function obtenerSaludo() {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return 'Buenos días';
  if (hora >= 12 && hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function Novedades() {
  const { usuario } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [ticketsData, estadosData] = await Promise.all([getTickets(), getEstados()]);
        setTickets(ticketsData);
        setEstados(estadosData);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  const ticketsEnriquecidos = useMemo(() => {
    const estadosPorId = Object.fromEntries(estados.map((estado) => [estado.id, estado.nombre]));
    return tickets.map((ticket) => ({ ...ticket, estado: estadosPorId[ticket.id_estado] ?? '—' }));
  }, [tickets, estados]);

  const ticketsAbiertos = useMemo(
    () => ticketsEnriquecidos.filter((ticket) => !ESTADOS_CERRADOS.includes(ticket.estado)),
    [ticketsEnriquecidos]
  );

  const sinAsignar = useMemo(
    () => ticketsAbiertos.filter((ticket) => !ticket.id_tecnico_responsable),
    [ticketsAbiertos]
  );

  const asignadosAVos = useMemo(
    () => ticketsAbiertos.filter((ticket) => ticket.id_tecnico_responsable === usuario?.id),
    [ticketsAbiertos, usuario]
  );

  const masAntiguosSinAsignar = useMemo(
    () =>
      [...sinAsignar].sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)).slice(0, CANTIDAD_LISTA),
    [sinAsignar]
  );

  if (cargando) return <p>Cargando...</p>;

  return (
    <div className="inicio">
      <h1>{obtenerSaludo()}, {usuario?.nombre}!</h1>

      <div className="inicio-stats">
        <div className="inicio-stat">
          <span className="inicio-stat-valor">{sinAsignar.length}</span>
          <span className="inicio-stat-etiqueta">Tickets sin asignar</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat-valor">{asignadosAVos.length}</span>
          <span className="inicio-stat-etiqueta">Asignados a vos</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat-valor">{ticketsAbiertos.length}</span>
          <span className="inicio-stat-etiqueta">Tickets abiertos (total)</span>
        </div>
      </div>

      <div className="inicio-grid">
        <div className="inicio-card">
          <h2>Sin asignar más antiguos</h2>
          <ul className="inicio-lista">
            {masAntiguosSinAsignar.map((ticket) => (
              <li key={ticket.id}>
                <Link to={`/tickets/${ticket.id}`}>
                  <span className="inicio-lista-numero">{ticket.numero}</span>
                  <span className="inicio-lista-titulo">{ticket.titulo}</span>
                  <span className="inicio-lista-fecha">{new Date(ticket.fecha_creacion).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
            {masAntiguosSinAsignar.length === 0 && <li className="inicio-lista-vacio">Nada por acá 🎉</li>}
          </ul>
        </div>

        <div className="inicio-card inicio-accesos">
          <h2>Accesos directos</h2>
          <Link to="/tickets/nuevo">
            <Button type="button">Nuevo ticket</Button>
          </Link>
          <Link to="/dashboard/tablero">
            <Button type="button" variant="secondary">
              Ir al Tablero
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Novedades;

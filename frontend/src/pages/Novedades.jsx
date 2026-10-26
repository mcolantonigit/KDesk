import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNuevoTicket } from '../context/NuevoTicketContext';
import { useAsideTicket } from '../context/AsideTicketContext';
import { useAuth } from '../context/AuthContext';
import { useNotificaciones } from '../context/NotificacionesContext';
import { getTickets, asignarResponsable } from '../services/tickets.service';
import { getEstados } from '../services/estados.service';
import { getPrioridades } from '../services/prioridades.service';
import { calcularNovedades, cuando, textoHace, DIAS_ESTANCADO } from '../utils/novedades';
import { TIPOS_NOTIFICACION } from '../utils/alertas';
import Button from '../components/Button';
import '../styles/Novedades.css';

const CANTIDAD_POR_LISTA = 5;

function obtenerSaludo() {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return 'Buenos días';
  if (hora >= 12 && hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function ChipPrioridad({ prioridad }) {
  return <span className={`novedades-chip novedades-chip-${prioridad.toLowerCase()}`}>{prioridad === 'Critica' ? 'Crítica' : prioridad}</span>;
}

function Motivo({ motivo }) {
  if (motivo.tipo === 'prioridad') return null;
  return <span className="novedades-chip novedades-chip-estancado">Sin movimiento {motivo.dias} d</span>;
}

const ETIQUETA_TIPO = Object.fromEntries(
  TIPOS_NOTIFICACION.map((tipo) => [tipo.clave, { ticket_nuevo: 'Nuevo', asignado: 'Asignado', comentario: 'Comentario', estado: 'Estado' }[tipo.clave]])
);
const CANTIDAD_EVENTOS = 5;
const CANTIDAD_ATENCION = 4;

function FilaTicket({ ticket, onAbrir, accion }) {
  return (
    <li>
      <button type="button" className="novedades-item" onClick={() => onAbrir(ticket.id)}>
        <span className="novedades-item-linea">
          <ChipPrioridad prioridad={ticket.prioridad} />
          <span className="novedades-item-numero">{ticket.numero}</span>
          {ticket.motivos?.map((motivo) => (
            <Motivo key={motivo.tipo} motivo={motivo} />
          ))}
        </span>
        <span className="novedades-item-titulo">{ticket.titulo}</span>
        <span className="novedades-item-meta">
          {ticket.estado} · actividad {textoHace(ticket.diasSinActividad)}
        </span>
      </button>
      {accion && accion(ticket)}
    </li>
  );
}

// Lista "Notificaciones": los eventos recientes (los mismos que salen como popup, con los
// no vistos resaltados) y, debajo, los tickets que hoy requieren atención.
function ListaNotificaciones({ eventos, ultimoVisto, atencion, onAbrir, onMarcarVistas }) {
  const eventosVisibles = eventos.slice(0, CANTIDAD_EVENTOS);
  const atencionVisible = atencion.slice(0, CANTIDAD_ATENCION);
  const sinVer = eventos.filter((evento) => evento.id > ultimoVisto).length;
  const total = eventos.length + atencion.length;

  return (
    <section className="novedades-lista">
      <header>
        <h2>Notificaciones</h2>
        <span className="novedades-lista-cantidad">{sinVer > 0 ? `${sinVer} nuevas` : total}</span>
      </header>

      {eventosVisibles.length > 0 && (
        <>
          <div className="novedades-subtitulo">
            <span>Últimos eventos</span>
            {sinVer > 0 && (
              <button type="button" className="novedades-link" onClick={onMarcarVistas}>
                Marcar como vistas
              </button>
            )}
          </div>
          <ul>
            {eventosVisibles.map((evento) => (
              <li key={evento.id}>
                <button
                  type="button"
                  className={`novedades-item novedades-evento ${evento.id > ultimoVisto ? 'nueva' : ''}`}
                  onClick={() => onAbrir(evento.idTicket)}
                >
                  <span className="novedades-item-linea">
                    <span className={`novedades-chip novedades-chip-ev-${evento.tipo}`}>{ETIQUETA_TIPO[evento.tipo]}</span>
                    <span className="novedades-item-meta">{cuando(evento.fecha)}</span>
                  </span>
                  <span className="novedades-item-mensaje">{evento.mensaje}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {atencionVisible.length > 0 && (
        <>
          <div className="novedades-subtitulo">
            <span>Requieren atención</span>
          </div>
          <ul>
            {atencionVisible.map((ticket) => (
              <FilaTicket key={ticket.id} ticket={ticket} onAbrir={onAbrir} />
            ))}
          </ul>
        </>
      )}

      {total === 0 && <p className="novedades-vacio">Todo al día 🎉</p>}

      {atencion.length > atencionVisible.length && (
        <Link to="/dashboard/tablero" className="novedades-mas">
          y {atencion.length - atencionVisible.length} más en el Tablero →
        </Link>
      )}
    </section>
  );
}

function ListaNovedades({ titulo, tickets, vacio, accion, onAbrir }) {
  const visibles = tickets.slice(0, CANTIDAD_POR_LISTA);
  const restantes = tickets.length - visibles.length;

  return (
    <section className="novedades-lista">
      <header>
        <h2>{titulo}</h2>
        <span className="novedades-lista-cantidad">{tickets.length}</span>
      </header>

      <ul>
        {visibles.map((ticket) => (
          <FilaTicket key={ticket.id} ticket={ticket} onAbrir={onAbrir} accion={accion} />
        ))}
        {tickets.length === 0 && <li className="novedades-vacio">{vacio}</li>}
      </ul>

      {restantes > 0 && (
        <Link to="/dashboard/tablero" className="novedades-mas">
          y {restantes} más en el Tablero →
        </Link>
      )}
    </section>
  );
}

function Novedades() {
  const { abrir: abrirNuevoTicket } = useNuevoTicket();
  const { abrirTicket } = useAsideTicket();
  const { usuario } = useAuth();
  const { eventos, ultimoVisto, marcarVistas } = useNotificaciones();

  // Al salir de Novedades lo que se mostró cuenta como visto (con la versión más reciente de marcarVistas).
  const marcarVistasRef = useRef(marcarVistas);
  useEffect(() => {
    marcarVistasRef.current = marcarVistas;
  }, [marcarVistas]);
  useEffect(() => () => marcarVistasRef.current(), []);

  const [tickets, setTickets] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [tomando, setTomando] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const [ticketsData, estadosData, prioridadesData] = await Promise.all([
          getTickets(),
          getEstados(),
          getPrioridades(),
        ]);
        setTickets(ticketsData);
        setEstados(estadosData);
        setPrioridades(prioridadesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  const { miCola, sinAsignar, atencion, kpis } = useMemo(
    () => calcularNovedades({ tickets, estados, prioridades, usuarioId: usuario?.id, ahora: new Date() }),
    [tickets, estados, prioridades, usuario]
  );

  async function handleTomar(ticket) {
    setTomando(ticket.id);
    setError('');
    try {
      await asignarResponsable(ticket.id, usuario.id);
      setTickets(await getTickets());
    } catch (err) {
      setError(err.message);
    } finally {
      setTomando(null);
    }
  }

  if (cargando) return <p>Cargando...</p>;

  const indicador = (valor, etiqueta, alerta) => (
    <div className={`novedades-kpi ${alerta && valor > 0 ? 'alerta' : ''}`}>
      <span className="novedades-kpi-valor">{valor}</span>
      <span className="novedades-kpi-etiqueta">{etiqueta}</span>
    </div>
  );

  return (
    <div className="novedades">
      <div className="novedades-cabecera">
        <h1>
          {obtenerSaludo()}, {usuario?.nombre}!
        </h1>
        <div className="novedades-acciones">
          <Button type="button" size="sm" onClick={abrirNuevoTicket}>
            Nuevo ticket
          </Button>
          <Link to="/dashboard/tablero">
            <Button type="button" variant="secondary" size="sm">
              Ir al Tablero
            </Button>
          </Link>
        </div>
      </div>

      {error && <p className="ticket-form-error">{error}</p>}

      <div className="novedades-kpis">
        {indicador(kpis.sinAsignar, 'Sin asignar', true)}
        {indicador(kpis.miCola, 'Asignados a vos')}
        {indicador(kpis.altaCritica, 'Prioridad alta o crítica', true)}
        {indicador(kpis.estancados, `Sin movimiento (${DIAS_ESTANCADO}+ días)`, true)}
        {indicador(kpis.abiertos, 'Abiertos en total')}
      </div>

      <div className="novedades-listas">
        <ListaNovedades
          titulo="Mi cola"
          tickets={miCola}
          vacio="No tenés tickets asignados."
          onAbrir={abrirTicket}
        />
        <ListaNovedades
          titulo="Sin asignar"
          tickets={sinAsignar}
          vacio="Nada sin asignar 🎉"
          onAbrir={abrirTicket}
          accion={(ticket) => (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={tomando === ticket.id}
              onClick={() => handleTomar(ticket)}
              aria-label={`Tomar ${ticket.numero}`}
            >
              {tomando === ticket.id ? '...' : 'Tomar'}
            </Button>
          )}
        />
        <ListaNotificaciones
          eventos={eventos}
          ultimoVisto={ultimoVisto}
          atencion={atencion}
          onAbrir={abrirTicket}
          onMarcarVistas={marcarVistas}
        />
      </div>
    </div>
  );
}

export default Novedades;

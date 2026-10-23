import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useAsideTicket } from './AsideTicketContext';
import { usePreferenciasAlertas } from '../hooks/usePreferenciasAlertas';
import { usePersistentState } from '../hooks/usePersistentState';
import { getNotificaciones } from '../services/notificaciones.service';
import { instalarDesbloqueoDeAudio, reproducirSonidoNotificacion } from '../utils/sonido';
import { hablar } from '../utils/voz';
import PopupsNotificaciones from '../components/PopupsNotificaciones';

const INTERVALO_MS = 20000;
const TAMANO_FEED = 50;
const MAXIMO_POPUPS = 4;
// Si se vuelve a KDesk tras muchas horas, solo se avisa de lo último (el resto queda en la lista).
const MAXIMO_AL_RETOMAR = 3;
const MAXIMO_EN_COLA_DE_AUDIO = 3;

const NotificacionesContext = createContext(null);

const claveCursor = (idUsuario) => `kdesk:notificaciones:cursor:${idUsuario}`;

function leerCursor(idUsuario) {
  try {
    const guardado = window.localStorage.getItem(claveCursor(idUsuario));
    return guardado === null ? null : Number(guardado);
  } catch {
    return null;
  }
}

function guardarCursor(idUsuario, valor) {
  try {
    window.localStorage.setItem(claveCursor(idUsuario), String(valor));
  } catch {
    // sin localStorage seguimos igual: el cursor queda solo en memoria
  }
}

// Consulta las notificaciones cada 20 segundos (y al volver a la pestaña) y,
// según las preferencias de cada tipo, muestra un popup, hace sonar el aviso
// y lee el mensaje en voz alta. Guarda además la lista para mostrarla en Novedades.
export function NotificacionesProvider({ children }) {
  const { usuario } = useAuth();
  const { abrirTicket } = useAsideTicket();
  const { preferencias } = usePreferenciasAlertas();
  const idUsuario = usuario?.id;

  const [feed, setFeed] = useState([]);
  const [popups, setPopups] = useState([]);
  const [ultimoVisto, setUltimoVisto] = usePersistentState(`kdesk:notificaciones:visto:${idUsuario}`, 0);

  // Siempre las preferencias vigentes, sin reiniciar la consulta cada vez que cambian.
  const preferenciasRef = useRef(preferencias);
  useEffect(() => {
    preferenciasRef.current = preferencias;
  }, [preferencias]);

  // Sonido y voz se encolan para no pisarse: cada aviso espera a que termine el anterior.
  const colaAudio = useRef({ turno: Promise.resolve(), pendientes: 0 });

  const alertar = useCallback((evento) => {
    const prefs = preferenciasRef.current;
    const opciones = prefs.tipos[evento.tipo];
    if (!prefs.activas || !opciones) return;

    if (opciones.popup) {
      setPopups((anteriores) =>
        anteriores.some((popup) => popup.id === evento.id) ? anteriores : [...anteriores, evento].slice(-MAXIMO_POPUPS)
      );
    }

    if ((opciones.sonido || opciones.voz) && colaAudio.current.pendientes < MAXIMO_EN_COLA_DE_AUDIO) {
      colaAudio.current.pendientes += 1;
      colaAudio.current.turno = colaAudio.current.turno.then(async () => {
        try {
          if (opciones.sonido) await reproducirSonidoNotificacion(prefs.volumen);
          if (opciones.voz) await hablar(evento.mensajeVoz ?? evento.mensaje, { nombreVoz: prefs.voz, volumen: prefs.volumen });
        } catch {
          // si el audio falla no debe romper nada más
        } finally {
          colaAudio.current.pendientes -= 1;
        }
      });
    }
  }, []);

  useEffect(() => instalarDesbloqueoDeAudio(), []);

  useEffect(() => {
    if (!idUsuario) return undefined;

    let activo = true;
    let consultando = false;
    let cursor = null;

    // Primera consulta: arma la lista y, si ya se había usado KDesk antes en este
    // navegador, avisa de lo que pasó desde la última vez (sin inundar de popups).
    async function cargarInicial() {
      const anterior = leerCursor(idUsuario);
      const { eventos, ultimoId } = await getNotificaciones({ limite: TAMANO_FEED });
      if (!activo) return;

      cursor = ultimoId;
      guardarCursor(idUsuario, ultimoId);
      setFeed(eventos);

      if (anterior !== null) {
        const nuevos = eventos.filter((evento) => evento.id > anterior).reverse();
        nuevos.slice(-MAXIMO_AL_RETOMAR).forEach(alertar);
      }
    }

    async function sondear() {
      const { eventos, ultimoId } = await getNotificaciones({ despuesDe: cursor, limite: TAMANO_FEED });
      if (!activo) return;

      cursor = ultimoId;
      guardarCursor(idUsuario, ultimoId);
      if (eventos.length === 0) return;

      setFeed((anteriores) =>
        [...eventos, ...anteriores.filter((previo) => !eventos.some((evento) => evento.id === previo.id))].slice(0, TAMANO_FEED)
      );
      [...eventos].reverse().forEach(alertar);
    }

    async function sincronizar() {
      if (consultando) return;
      consultando = true;
      try {
        await (cursor === null ? cargarInicial() : sondear());
      } catch {
        // sin conexión o servidor caído: se reintenta en la próxima vuelta
      } finally {
        consultando = false;
      }
    }

    function alVolverAPestana() {
      if (!document.hidden) sincronizar();
    }

    sincronizar();
    const intervalo = setInterval(sincronizar, INTERVALO_MS);
    document.addEventListener('visibilitychange', alVolverAPestana);

    return () => {
      activo = false;
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolverAPestana);
    };
  }, [idUsuario, alertar]);

  const cerrarPopup = useCallback((id) => {
    setPopups((anteriores) => anteriores.filter((popup) => popup.id !== id));
  }, []);

  const abrirDesdePopup = useCallback(
    (evento) => {
      abrirTicket(evento.idTicket);
      cerrarPopup(evento.id);
    },
    [abrirTicket, cerrarPopup]
  );

  const valor = useMemo(
    () => ({
      eventos: feed,
      noVistas: feed.filter((evento) => evento.id > ultimoVisto).length,
      ultimoVisto,
      marcarVistas: () => setUltimoVisto(feed.reduce((maximo, evento) => Math.max(maximo, evento.id), ultimoVisto)),
    }),
    [feed, ultimoVisto, setUltimoVisto]
  );

  return (
    <NotificacionesContext.Provider value={valor}>
      {children}
      <PopupsNotificaciones popups={popups} onCerrar={cerrarPopup} onAbrir={abrirDesdePopup} />
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}

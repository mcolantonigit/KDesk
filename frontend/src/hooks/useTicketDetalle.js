import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTicketById,
  getComentarios,
  crearComentario,
  eliminarComentario,
  cambiarEstado,
  cambiarTipo,
  cambiarPrioridad,
  asignarResponsable,
} from '../services/tickets.service';
import { getEstados } from '../services/estados.service';
import { getPrioridades } from '../services/prioridades.service';
import { getTiposTicket } from '../services/tiposTicket.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import { getUsuarios } from '../services/usuarios.service';
import { getAdjuntosDeTicket, getAdjuntosDeComentario, subirAdjuntoDeComentario } from '../services/adjuntos.service';
import { getHistorial } from '../services/historial.service';

const ESTADO_CERRADO = 'Cerrado';
const ROLES_TECNICOS = [2, 3];

// Carga un ticket con todo lo necesario para mostrarlo (comentarios,
// adjuntos, historial y nombres de catálogos), las acciones para comentar
// y, para técnicos, las de cambiar estado, tipo, prioridad y responsable.
// Lo usan la página de detalle y el panel lateral.
export function useTicketDetalle(id) {
  const { usuario } = useAuth();
  const esTecnico = ROLES_TECNICOS.includes(usuario?.id_rol);

  const [ticket, setTicket] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [adjuntosTicket, setAdjuntosTicket] = useState([]);
  const [historial, setHistorial] = useState([]);
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

  const cargarTicket = useCallback(async () => {
    const [ticketData, comentariosData, adjuntosData, historialData] = await Promise.all([
      getTicketById(id),
      getComentarios(id),
      getAdjuntosDeTicket(id),
      getHistorial(id),
    ]);

    const comentariosConAdjuntos = await Promise.all(
      comentariosData.map(async (comentario) => ({
        ...comentario,
        adjuntos: comentario.eliminado ? [] : await getAdjuntosDeComentario(comentario.id),
      }))
    );

    setTicket(ticketData);
    setComentarios(comentariosConAdjuntos);
    setAdjuntosTicket(adjuntosData);
    setHistorial(historialData);
  }, [id]);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const [estados, prioridades, tipos, sucursales, sectores, usuarios] = await Promise.all([
          getEstados(),
          getPrioridades(),
          getTiposTicket(),
          getSucursales(),
          getSectores(),
          esTecnico ? getUsuarios() : Promise.resolve([]),
        ]);
        setCatalogos({ estados, prioridades, tipos, sucursales, sectores, usuarios });
        await cargarTicket();
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [cargarTicket, esTecnico]);

  async function agregarComentario(contenido, adjunto) {
    try {
      const comentario = await crearComentario(id, contenido);
      if (adjunto) {
        await subirAdjuntoDeComentario(comentario.id, adjunto);
      }
      await cargarTicket();
    } catch (err) {
      setError(err.message);
    }
  }

  async function quitarComentario(comentario) {
    try {
      await eliminarComentario(comentario.id);
      await cargarTicket();
    } catch (err) {
      setError(err.message);
    }
  }

  // Igual que en el Tablero: si falla, se avisa y el ticket queda como estaba.
  async function editar(accion, valor) {
    try {
      await accion(id, valor);
      await cargarTicket();
    } catch (err) {
      window.alert(err.message);
    }
  }

  const tecnicos = catalogos.usuarios.filter((item) => ROLES_TECNICOS.includes(item.id_rol));

  const nombres = ticket && {
    estado: catalogos.estados.find((estado) => estado.id === ticket.id_estado)?.nombre ?? '—',
    tipo: catalogos.tipos.find((tipo) => tipo.id === ticket.id_tipo)?.nombre ?? '—',
    prioridad: (() => {
      const asignada = catalogos.prioridades.find((prioridad) => prioridad.id === ticket.id_prioridad)?.nombre;
      const sugerida = catalogos.prioridades.find((prioridad) => prioridad.id === ticket.id_prioridad_sugerida)?.nombre;
      return asignada ?? `${sugerida ?? '—'} (sugerida)`;
    })(),
    sucursal: catalogos.sucursales.find((sucursal) => sucursal.id === ticket.id_sucursal)?.nombre ?? '—',
    sector: catalogos.sectores.find((sector) => sector.id === ticket.id_sector)?.nombre ?? '—',
    responsable: ticket.tecnico_responsable ?? 'Sin asignar',
    creador: (() => {
      if (!esTecnico) return `${usuario.nombre} ${usuario.apellido}`;
      const creador = catalogos.usuarios.find((item) => item.id === ticket.id_usuario_creador);
      return creador ? `${creador.nombre} ${creador.apellido}` : '—';
    })(),
  };

  const yaCerrado = nombres?.estado === ESTADO_CERRADO;
  const puedeCerrar = Boolean(ticket) && (ticket.id_usuario_creador === usuario?.id || esTecnico);

  return {
    usuario,
    esTecnico,
    cargando,
    error,
    ticket,
    comentarios,
    adjuntosTicket,
    historial,
    catalogos,
    tecnicos,
    nombres,
    yaCerrado,
    puedeCerrar,
    recargar: cargarTicket,
    agregarComentario,
    quitarComentario,
    cambiarEstado: (idEstado) => editar(cambiarEstado, idEstado),
    cambiarTipo: (idTipo) => editar(cambiarTipo, idTipo),
    cambiarPrioridad: (idPrioridad) => editar(cambiarPrioridad, idPrioridad),
    asignarResponsable: (idTecnico) => editar(asignarResponsable, idTecnico),
  };
}

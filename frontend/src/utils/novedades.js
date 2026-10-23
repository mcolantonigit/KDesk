export const ESTADOS_CERRADOS = ['Cerrado', 'Cancelado'];
// En este estado el ticket espera una respuesta del usuario: no es culpa del técnico que esté quieto.
const ESTADO_EN_ESPERA = 'En espera del usuario';
export const DIAS_ESTANCADO = 3;

const PESO_PRIORIDAD = { Baja: 1, Media: 2, Alta: 3, Critica: 4 };
const PRIORIDADES_URGENTES = ['Alta', 'Critica'];
const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function diasDesde(fecha, ahora = new Date()) {
  return Math.max(0, Math.floor((ahora - new Date(fecha)) / MS_POR_DIA));
}

export function textoHace(dias) {
  if (dias === 0) return 'hoy';
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}

// Arma lo que muestra el panel de Novedades a partir de todos los tickets.
// Devuelve las tres listas (cada ticket con `estado`, `prioridad`,
// `diasSinActividad` y, en `atencion`, los `motivos`) y los indicadores.
export function calcularNovedades({ tickets, estados, prioridades, usuarioId, ahora = new Date() }) {
  const estadosPorId = Object.fromEntries(estados.map((estado) => [estado.id, estado.nombre]));
  const prioridadesPorId = Object.fromEntries(prioridades.map((prioridad) => [prioridad.id, prioridad.nombre]));

  const abiertos = tickets
    .map((ticket) => ({
      ...ticket,
      estado: estadosPorId[ticket.id_estado] ?? '—',
      prioridad: prioridadesPorId[ticket.id_prioridad ?? ticket.id_prioridad_sugerida] ?? '—',
      diasSinActividad: diasDesde(ticket.fecha_actualizacion, ahora),
    }))
    .filter((ticket) => !ESTADOS_CERRADOS.includes(ticket.estado));

  const peso = (ticket) => PESO_PRIORIDAD[ticket.prioridad] ?? 0;
  const porUrgenciaYAntiguedad = (a, b) =>
    peso(b) - peso(a) || new Date(a.fecha_creacion) - new Date(b.fecha_creacion);

  const estancado = (ticket) => ticket.estado !== ESTADO_EN_ESPERA && ticket.diasSinActividad >= DIAS_ESTANCADO;

  const miCola = abiertos.filter((ticket) => ticket.id_tecnico_responsable === usuarioId).sort(porUrgenciaYAntiguedad);
  const sinAsignar = abiertos.filter((ticket) => !ticket.id_tecnico_responsable).sort(porUrgenciaYAntiguedad);

  const atencion = abiertos
    .map((ticket) => {
      const motivos = [];
      if (PRIORIDADES_URGENTES.includes(ticket.prioridad)) motivos.push({ tipo: 'prioridad', texto: ticket.prioridad });
      if (estancado(ticket)) motivos.push({ tipo: 'estancado', dias: ticket.diasSinActividad });
      return { ...ticket, motivos };
    })
    .filter((ticket) => ticket.motivos.length > 0)
    .sort((a, b) => peso(b) - peso(a) || b.diasSinActividad - a.diasSinActividad);

  return {
    miCola,
    sinAsignar,
    atencion,
    kpis: {
      sinAsignar: sinAsignar.length,
      miCola: miCola.length,
      altaCritica: abiertos.filter((ticket) => PRIORIDADES_URGENTES.includes(ticket.prioridad)).length,
      estancados: abiertos.filter(estancado).length,
      abiertos: abiertos.length,
    },
  };
}

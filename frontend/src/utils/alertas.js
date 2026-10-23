// Tipos de notificación que genera el sistema (los mismos que arma el backend).
export const TIPOS_NOTIFICACION = [
  { clave: 'ticket_nuevo', etiqueta: 'Ticket nuevo', descripcion: 'Se creó un ticket (solo para técnicos)' },
  { clave: 'asignado', etiqueta: 'Asignado a mí', descripcion: 'Me asignaron un ticket' },
  { clave: 'comentario', etiqueta: 'Comentario nuevo', descripcion: 'Alguien comentó en un ticket mío' },
  { clave: 'estado', etiqueta: 'Cambio de estado o cierre', descripcion: 'Cambió el estado o se cerró un ticket mío' },
];

export const PREFERENCIAS_POR_DEFECTO = {
  activas: true,
  volumen: 0.7,
  // Nombre de la voz elegida; vacío = la voz recomendada para el navegador.
  voz: '',
  tipos: Object.fromEntries(
    TIPOS_NOTIFICACION.map((tipo) => [tipo.clave, { popup: true, sonido: true, voz: true }])
  ),
};

// Completa lo guardado con los valores por defecto, para que una opción o un
// tipo nuevo tenga valor aunque lo guardado sea de una versión anterior.
export function combinarPreferencias(guardadas = {}) {
  const tipos = {};
  for (const tipo of TIPOS_NOTIFICACION) {
    tipos[tipo.clave] = { ...PREFERENCIAS_POR_DEFECTO.tipos[tipo.clave], ...guardadas.tipos?.[tipo.clave] };
  }
  return { ...PREFERENCIAS_POR_DEFECTO, ...guardadas, tipos };
}

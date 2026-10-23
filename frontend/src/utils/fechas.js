const dos = (numero) => String(numero).padStart(2, '0');

// "23/10/2026 16:22": fecha y hora (24 h) en la zona horaria del navegador.
// Devuelve '—' si no hay fecha.
export function formatearFechaHora(fecha) {
  if (!fecha) return '—';
  const momento = new Date(fecha);
  if (Number.isNaN(momento.getTime())) return '—';

  const dia = `${dos(momento.getDate())}/${dos(momento.getMonth() + 1)}/${momento.getFullYear()}`;
  return `${dia} ${dos(momento.getHours())}:${dos(momento.getMinutes())}`;
}

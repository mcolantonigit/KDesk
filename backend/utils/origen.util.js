// ¿El pedido llegó desde internet (por Cloudflare Tunnel) o desde la red local?
// Cloudflare agrega estos encabezados a todo lo que pasa por él. Un pedido de la
// red local podría inventarlos, pero solo lograría que lo traten como de internet
// (más restringido), así que no hay forma de usarlos para saltarse nada.
export function vieneDeInternet(req) {
  return Boolean(req.headers['cf-connecting-ip'] || req.headers['cf-ray']);
}

// LOGIN_PASSWORD en el .env:
//   vacío  → usuario y contraseña en todos lados (como siempre)
//   local  → solo desde la red local; desde internet, únicamente Microsoft 365
//   off    → apagado del todo (cuando la versión local deje de existir)
export function loginConPasswordPermitido(req) {
  const modo = (process.env.LOGIN_PASSWORD ?? '').trim().toLowerCase();
  if (modo === 'off') return false;
  if (modo === 'local') return !vieneDeInternet(req);
  return true;
}

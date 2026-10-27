// 80 MB: por Cloudflare (plan gratis) un pedido no puede pasar de 100 MB.
export const TAMANO_MAXIMO_BYTES = 80 * 1024 * 1024;

const TIPOS_MIME_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export function esTipoPermitido(mimetype) {
  return TIPOS_MIME_PERMITIDOS.includes(mimetype);
}

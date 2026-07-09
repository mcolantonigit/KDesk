export const TAMANO_MAXIMO_BYTES = 500 * 1024 * 1024;

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

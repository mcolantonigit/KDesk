// Lo mismo que acepta el backend (backend/utils/archivos.util.js): si se
// cambia allá, cambiarlo acá.
export const TAMANO_MAXIMO_ADJUNTO = 80 * 1024 * 1024;

const TIPOS_ADJUNTOS = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// Para el `accept` del input: el diálogo de Windows muestra solo estos archivos.
export const ACEPTA_ADJUNTOS = [...new Set([...Object.keys(TIPOS_ADJUNTOS), ...Object.values(TIPOS_ADJUNTOS)])].join(',');

export const DESCRIPCION_ADJUNTOS = 'Imágenes, PDF, Word, Excel o TXT, hasta 80 MB';

function extension(nombre) {
  const punto = nombre.lastIndexOf('.');
  return punto === -1 ? '' : nombre.slice(punto).toLowerCase();
}

// Si el archivo calza con un `accept` ("".sql", "image/png,.pdf", "image/*").
export function cumpleAccept(archivo, accept) {
  if (!accept) return true;
  const tipo = (archivo.type ?? '').toLowerCase();
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith('.')) return extension(archivo.name) === token;
      if (token.endsWith('/*')) return tipo.startsWith(token.slice(0, -1));
      return tipo === token;
    });
}

// Motivo por el que no se puede elegir el archivo, o null si está bien.
export function problemaConArchivo(archivo, { accept, tamanoMaximo, descripcion } = {}) {
  if (!cumpleAccept(archivo, accept)) {
    return `No se puede adjuntar "${archivo.name}": ese tipo de archivo no está permitido.${
      descripcion ? `\n\nSe permiten: ${descripcion}.` : ''
    }`;
  }
  if (tamanoMaximo && archivo.size > tamanoMaximo) {
    return `No se puede adjuntar "${archivo.name}": pesa más de ${Math.round(tamanoMaximo / (1024 * 1024))} MB.`;
  }
  return null;
}

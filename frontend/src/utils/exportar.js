function escaparCampoCSV(valor) {
  const texto = String(valor ?? '');
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function filasACSV(columnas, filas) {
  const encabezado = columnas.map((columna) => escaparCampoCSV(columna.label)).join(',');
  const lineas = filas.map((fila) => columnas.map((columna) => escaparCampoCSV(fila[columna.key])).join(','));
  return [encabezado, ...lineas].join('\n');
}

export function descargarArchivo(nombreArchivo, contenido, tipoMime) {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

const BOM_UTF8 = '﻿';

export function descargarCSV(nombreArchivo, contenidoCSV) {
  // BOM al inicio para que Excel detecte UTF-8 y no rompa los acentos/ñ
  descargarArchivo(nombreArchivo, BOM_UTF8 + contenidoCSV, 'text/csv;charset=utf-8;');
}

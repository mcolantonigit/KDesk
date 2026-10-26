// Deja un orden guardado utilizable con las columnas actuales: descarta las
// que ya no existen (o están repetidas) y agrega al final las que son nuevas.
export function reconciliarOrden(guardado, claves) {
  const validas = (guardado ?? []).filter((clave, i, todas) => claves.includes(clave) && todas.indexOf(clave) === i);
  const faltantes = claves.filter((clave) => !validas.includes(clave));
  return [...validas, ...faltantes];
}

// Mueve la columna `desde` a un costado de la columna `hacia` (después si
// `despues` es true, antes si no). Devuelve un orden nuevo, sin modificar el original.
export function moverClave(orden, desde, hacia, despues) {
  if (desde === hacia || !orden.includes(desde) || !orden.includes(hacia)) return orden;

  const resto = orden.filter((clave) => clave !== desde);
  const posicion = resto.indexOf(hacia);
  resto.splice(despues ? posicion + 1 : posicion, 0, desde);
  return resto;
}

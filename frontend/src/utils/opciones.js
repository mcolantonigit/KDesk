// Minúsculas y sin acentos, para comparar lo que escribe el usuario con los
// nombres del listado ("sucursal" encuentra "Sucursal Córdoba").
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function ordenarAlfabeticamente(opciones) {
  return [...opciones].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
}

function esSubsecuencia(buscado, texto) {
  let i = 0;
  for (const letra of texto) {
    if (letra === buscado[i]) i += 1;
    if (i === buscado.length) return true;
  }
  return false;
}

// Qué tan bien calza `texto` con el nombre: 0 empieza igual, 1 empieza una
// palabra, 2 está contenido, 3 tiene las letras en orden (aunque salteadas),
// null no calza.
function puntaje(nombre, texto) {
  if (nombre.startsWith(texto)) return 0;
  if (nombre.split(/\s+/).some((palabra) => palabra.startsWith(texto))) return 1;
  if (nombre.includes(texto)) return 2;
  if (esSubsecuencia(texto, nombre)) return 3;
  return null;
}

// Devuelve las opciones que calzan con lo escrito, de la más cercana a la
// menos cercana (y alfabéticamente dentro de un mismo nivel). Sin texto,
// devuelve todas ordenadas alfabéticamente. La primera es la recomendada.
export function filtrarOpciones(opciones, texto) {
  const buscado = normalizar(texto);
  const ordenadas = ordenarAlfabeticamente(opciones);
  if (!buscado) return ordenadas;

  const puntuadas = ordenadas.map((opcion) => ({ opcion, puntos: puntaje(normalizar(opcion.nombre), buscado) }));
  const fuertes = puntuadas.filter((item) => item.puntos !== null && item.puntos <= 2);
  // Letras en orden pero salteadas: solo como último recurso, si nada contiene el texto.
  const elegidas = fuertes.length ? fuertes : puntuadas.filter((item) => item.puntos === 3);

  return elegidas.sort((a, b) => a.puntos - b.puntos).map((item) => item.opcion);
}

export function buscarExacta(opciones, texto) {
  const buscado = normalizar(texto);
  return opciones.find((opcion) => normalizar(opcion.nombre) === buscado);
}

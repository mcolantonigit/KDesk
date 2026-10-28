// Pantalla a la que volver después de iniciar sesión (por ejemplo, el link de
// un ticket abierto sin sesión, o donde se estaba cuando venció la sesión).
const CLAVE = 'kdesk.volverA';

export function guardarVolverA(ruta) {
  try {
    sessionStorage.setItem(CLAVE, ruta);
  } catch {
    // Sin almacenamiento disponible: se vuelve al inicio
  }
}

export function tomarVolverA() {
  try {
    const ruta = sessionStorage.getItem(CLAVE);
    sessionStorage.removeItem(CLAVE);
    return ruta;
  } catch {
    return null;
  }
}

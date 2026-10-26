import { useEffect, useState } from 'react';

// Hasta este ancho se considera "celular": la interfaz cambia de estructura
// (barra de navegación inferior, listas de tarjetas, pantallas completas).
export const ANCHO_MAXIMO_MOVIL = 768;
const CONSULTA = `(max-width: ${ANCHO_MAXIMO_MOVIL}px)`;

export function useEsMovil() {
  const [esMovil, setEsMovil] = useState(() => window.matchMedia?.(CONSULTA).matches ?? false);

  useEffect(() => {
    const consulta = window.matchMedia?.(CONSULTA);
    if (!consulta) return undefined;

    const alCambiar = (evento) => setEsMovil(evento.matches);
    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, []);

  return esMovil;
}

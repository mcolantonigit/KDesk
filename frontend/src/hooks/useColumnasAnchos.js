import { usePersistentState } from './usePersistentState';

export const ANCHO_MINIMO_COLUMNA = 70;

// Anchos (en px) de las columnas de una tabla, ajustables por el usuario y
// recordados en el navegador. `anchosPorDefecto` es { clave: px }; si más
// adelante se agrega una columna, toma su ancho por defecto aunque lo
// guardado no la incluya.
export function useColumnasAnchos(claveTabla, anchosPorDefecto) {
  const [guardados, setGuardados] = usePersistentState(`kdesk:tabla:${claveTabla}:anchos`, {});

  const anchos = { ...anchosPorDefecto, ...guardados };

  function cambiarAncho(clave, ancho) {
    setGuardados((anteriores) => ({ ...anteriores, [clave]: Math.max(ANCHO_MINIMO_COLUMNA, Math.round(ancho)) }));
  }

  function resetearAncho(clave) {
    setGuardados((anteriores) => {
      const resto = { ...anteriores };
      delete resto[clave];
      return resto;
    });
  }

  function restablecerAnchos() {
    setGuardados({});
  }

  return { anchos, cambiarAncho, resetearAncho, restablecerAnchos };
}

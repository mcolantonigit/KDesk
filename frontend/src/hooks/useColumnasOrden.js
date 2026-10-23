import { usePersistentState } from './usePersistentState';
import { moverClave, reconciliarOrden } from '../utils/columnas';

// Orden de las columnas de una tabla, que el usuario cambia arrastrando los
// encabezados. Se recuerda en el navegador; `claves` es el orden original.
export function useColumnasOrden(claveTabla, claves) {
  const [guardado, setGuardado] = usePersistentState(`kdesk:tabla:${claveTabla}:orden-columnas`, []);

  const orden = reconciliarOrden(guardado, claves);

  function moverColumna(desde, hacia, despues) {
    setGuardado(moverClave(orden, desde, hacia, despues));
  }

  function restablecerOrden() {
    setGuardado([]);
  }

  return { orden, moverColumna, restablecerOrden };
}

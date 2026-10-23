import { createContext, useContext } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { resolverFondo } from '../utils/fondos';

const PreferenciasContext = createContext(null);

// Antes la preferencia era un casillero "Fondo animado" (sí/no): se lee para no
// pisar la decisión de quien lo había apagado.
function leerFondoAnimadoAnterior() {
  try {
    return JSON.parse(window.localStorage.getItem('kdesk:preferencias:fondoAnimado'));
  } catch {
    return null;
  }
}

export function PreferenciasProvider({ children }) {
  const [fondoElegido, setFondo] = usePersistentState('kdesk:preferencias:fondo', '');
  const fondo = resolverFondo(fondoElegido, leerFondoAnimadoAnterior());

  return <PreferenciasContext.Provider value={{ fondo, setFondo }}>{children}</PreferenciasContext.Provider>;
}

export function usePreferencias() {
  return useContext(PreferenciasContext);
}

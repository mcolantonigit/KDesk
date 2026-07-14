import { createContext, useContext } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

const PreferenciasContext = createContext(null);

export function PreferenciasProvider({ children }) {
  const [fondoAnimado, setFondoAnimado] = usePersistentState('kdesk:preferencias:fondoAnimado', true);

  return (
    <PreferenciasContext.Provider value={{ fondoAnimado, setFondoAnimado }}>
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  return useContext(PreferenciasContext);
}

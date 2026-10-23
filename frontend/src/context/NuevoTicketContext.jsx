import { createContext, useCallback, useContext, useState } from 'react';
import ModalNuevoTicket from '../components/ModalNuevoTicket';

const NuevoTicketContext = createContext(null);

// Permite abrir el modal "Nuevo ticket" desde cualquier pantalla del panel
// (menú, Tablero, Novedades) sin cambiar de página.
export function NuevoTicketProvider({ children }) {
  const [abierto, setAbierto] = useState(false);
  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  return (
    <NuevoTicketContext.Provider value={{ abrir }}>
      {children}
      {abierto && <ModalNuevoTicket onClose={cerrar} />}
    </NuevoTicketContext.Provider>
  );
}

export function useNuevoTicket() {
  return useContext(NuevoTicketContext);
}

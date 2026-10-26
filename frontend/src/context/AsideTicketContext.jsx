import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AsideTicket from '../components/AsideTicket';

const AsideTicketContext = createContext(null);

// Permite abrir el panel lateral de un ticket desde cualquier tabla del
// panel. Se cierra solo al cambiar de página.
export function AsideTicketProvider({ children }) {
  // Se guarda junto con la ruta en la que se abrió: al cambiar de página deja de coincidir y se cierra solo.
  const [abierto, setAbierto] = useState(null);
  const { pathname } = useLocation();
  const idTicket = abierto?.ruta === pathname ? abierto.id : null;

  const abrirTicket = useCallback((id) => setAbierto({ id, ruta: pathname }), [pathname]);
  const cerrar = useCallback(() => setAbierto(null), []);

  // La clase en <body> hace que el contenido deje lugar al panel (ver AsideTicket.css).
  useEffect(() => {
    document.body.classList.toggle('aside-abierto', idTicket !== null);
    return () => document.body.classList.remove('aside-abierto');
  }, [idTicket]);

  return (
    <AsideTicketContext.Provider value={{ abrirTicket }}>
      {children}
      {idTicket !== null && <AsideTicket key={idTicket} idTicket={idTicket} onClose={cerrar} />}
    </AsideTicketContext.Provider>
  );
}

export function useAsideTicket() {
  return useContext(AsideTicketContext);
}

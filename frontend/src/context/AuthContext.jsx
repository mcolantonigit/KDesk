import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getPerfil, logout } from '../services/usuarios.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const recargarPerfil = useCallback(async () => {
    setCargando(true);
    const perfil = await getPerfil();
    setUsuario(perfil);
    setCargando(false);
  }, []);

  useEffect(() => {
    recargarPerfil();
  }, [recargarPerfil]);

  async function cerrarSesion() {
    await logout();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, setUsuario, recargarPerfil, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

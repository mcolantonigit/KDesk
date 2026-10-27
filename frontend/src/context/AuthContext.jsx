import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getPerfil, logout } from '../services/usuarios.service';
import { escucharApi, SESION_VENCIDA } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuarioEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  // Por qué no hay sesión: 'requerida' (se entró sin haber iniciado sesión) o
  // 'vencida' (la sesión dejó de valer mientras se usaba KDesk).
  const [sinSesion, setSinSesion] = useState(null);
  const usuarioRef = useRef(null);

  const setUsuario = useCallback((nuevo) => {
    usuarioRef.current = nuevo;
    setUsuarioEstado(nuevo);
    if (nuevo) setSinSesion(null);
  }, []);

  const recargarPerfil = useCallback(async () => {
    setCargando(true);
    try {
      const perfil = await getPerfil();
      setUsuario(perfil);
      if (!perfil) setSinSesion('requerida');
      setCargando(false);
    } catch {
      // Sin servidor: queda cargando y la pantalla de sin conexión reintenta.
    }
  }, [setUsuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recargarPerfil();
  }, [recargarPerfil]);

  useEffect(
    () =>
      escucharApi((evento) => {
        if (evento === SESION_VENCIDA && usuarioRef.current) {
          usuarioRef.current = null;
          setUsuarioEstado(null);
          setSinSesion('vencida');
        }
      }),
    []
  );

  async function cerrarSesion() {
    await logout();
    setUsuario(null);
    setSinSesion(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, sinSesion, setUsuario, recargarPerfil, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

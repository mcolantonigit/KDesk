import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SesionRequerida from '../components/SesionRequerida';
import { guardarVolverA, tomarVolverA } from '../utils/volverA';

function RutaProtegida() {
  const { usuario, cargando, sinSesion } = useAuth();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const rutaActual = `${pathname}${search}`;

  // Recién iniciada la sesión: volver a donde se quería ir.
  useEffect(() => {
    if (!usuario) return;
    const volverA = tomarVolverA();
    if (volverA && volverA !== rutaActual) navigate(volverA, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  if (cargando) {
    return null;
  }

  if (!usuario) {
    // Entrar a la raíz sin sesión es lo normal: directo al login, sin aviso.
    if (sinSesion === 'vencida' || (sinSesion === 'requerida' && pathname !== '/')) {
      if (pathname !== '/') guardarVolverA(rutaActual);
      return <SesionRequerida motivo={sinSesion} />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RutaProtegida;

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RutaPublica() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RutaPublica;

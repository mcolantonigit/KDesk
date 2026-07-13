import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROL_ADMINISTRADOR = 3;

function RutaAdministrador() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.id_rol !== ROL_ADMINISTRADOR) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RutaAdministrador;

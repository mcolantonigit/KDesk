import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES_CON_ACCESO = [2, 3];

function RutaTecnico() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!ROLES_CON_ACCESO.includes(usuario.id_rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RutaTecnico;

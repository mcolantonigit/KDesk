import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES_TECNICOS = [2, 3];

function Inicio() {
  const { usuario } = useAuth();

  if (ROLES_TECNICOS.includes(usuario?.id_rol)) {
    return <Navigate to="/dashboard/novedades" replace />;
  }

  return <Navigate to="/tickets/activos" replace />;
}

export default Inicio;

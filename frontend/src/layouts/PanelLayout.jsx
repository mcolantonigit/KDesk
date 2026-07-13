import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import '../styles/PanelLayout.css';

const ROLES_DASHBOARD = [2, 3];
const ROL_ADMINISTRADOR = 3;

function PanelLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const puedeVerDashboard = ROLES_DASHBOARD.includes(usuario?.id_rol);
  const puedeVerAdministrar = ROLES_DASHBOARD.includes(usuario?.id_rol);
  const esAdministrador = usuario?.id_rol === ROL_ADMINISTRADOR;

  async function handleLogout() {
    await cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="panel-layout">
      <header className="panel-header">
        <span className="panel-brand">KDesk</span>

        <nav className="panel-nav">
          <div className="panel-nav-item">
            <span className="panel-nav-trigger">Mis tickets</span>
            <div className="panel-nav-submenu">
              <NavLink to="/tickets/nuevo">Nuevo Ticket</NavLink>
              <NavLink to="/tickets/activos">Tickets activos</NavLink>
              <NavLink to="/tickets/cerrados">Tickets cerrados</NavLink>
            </div>
          </div>

          {puedeVerDashboard && (
            <div className="panel-nav-item">
              <span className="panel-nav-trigger">Dashboard</span>
              <div className="panel-nav-submenu">
                <NavLink to="/dashboard/tablero">Tablero</NavLink>
              </div>
            </div>
          )}

          {puedeVerAdministrar && (
            <div className="panel-nav-item">
              <span className="panel-nav-trigger">Administrar</span>
              <div className="panel-nav-submenu">
                {esAdministrador && <NavLink to="/administrar/usuarios">Usuarios y permisos</NavLink>}
                {esAdministrador && <NavLink to="/administrar/parametros">Parámetros</NavLink>}
                <NavLink to="/administrar/estadisticas">Estadísticas</NavLink>
                <NavLink to="/administrar/auditoria">Auditoría</NavLink>
              </div>
            </div>
          )}
        </nav>

        <div className="panel-user">
          <span>{usuario?.nombre} {usuario?.apellido}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="panel-content">
        <Outlet />
      </main>
    </div>
  );
}

export default PanelLayout;

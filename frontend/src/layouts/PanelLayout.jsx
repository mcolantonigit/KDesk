import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferencias } from '../context/PreferenciasContext';
import Button from '../components/Button';
import ModalCambiarPassword from '../components/ModalCambiarPassword';
import { NuevoTicketProvider, useNuevoTicket } from '../context/NuevoTicketContext';
import '../styles/PanelLayout.css';

const ROLES_DASHBOARD = [2, 3];
const ROL_ADMINISTRADOR = 3;

const ICONO_ENGRANAJE = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
         1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2
         2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65
         1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65
         1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83
         2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    />
  </svg>
);

const ICONO_CERRAR_SESION = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

function PanelLayoutContenido() {
  const { abrir: abrirNuevoTicket } = useNuevoTicket();
  const { usuario, cerrarSesion } = useAuth();
  const { fondoAnimado, setFondoAnimado } = usePreferencias();
  const navigate = useNavigate();
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const puedeVerDashboard = ROLES_DASHBOARD.includes(usuario?.id_rol);
  const esTecnicoOAdministrador = ROLES_DASHBOARD.includes(usuario?.id_rol);
  const esAdministrador = usuario?.id_rol === ROL_ADMINISTRADOR;
  const puedeCambiarPasswordDesdeMenu = usuario && !esAdministrador;

  async function handleLogout() {
    await cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="panel-layout">
      <header className="panel-header no-imprimir">
        <Link to="/" className="panel-brand">
          <img src="/favicon.svg" alt="" className="panel-logo" />
          KDesk
        </Link>

        <nav className="panel-nav">
          <div className="panel-nav-item">
            <span className="panel-nav-trigger">Mis tickets</span>
            <div className="panel-nav-submenu">
              <button type="button" className="panel-nav-destacado" onClick={abrirNuevoTicket}>
                Nuevo Ticket
              </button>
              <NavLink to="/tickets/activos">Tickets activos</NavLink>
              <NavLink to="/tickets/cerrados">Tickets cerrados</NavLink>
            </div>
          </div>

          {puedeVerDashboard && (
            <div className="panel-nav-item">
              <span className="panel-nav-trigger">Dashboard</span>
              <div className="panel-nav-submenu">
                <NavLink to="/dashboard/novedades">Novedades</NavLink>
                <NavLink to="/dashboard/tablero">Tablero</NavLink>
              </div>
            </div>
          )}
        </nav>

        <div className="panel-header-derecha">
          <div className="panel-user">
            <span>{usuario?.nombre} {usuario?.apellido}</span>
          </div>

          <div className="panel-nav-item">
            <Button
              variant="secondary"
              className="panel-logout-btn"
              title="Administrar"
              aria-label="Administrar"
            >
              {ICONO_ENGRANAJE}
            </Button>
            <div className="panel-nav-submenu panel-nav-submenu-derecha">
              {puedeCambiarPasswordDesdeMenu && (
                <button type="button" onClick={() => setModalPasswordAbierto(true)}>
                  Cambiar contraseña
                </button>
              )}
              {esAdministrador && <NavLink to="/administrar/usuarios">Usuarios y permisos</NavLink>}
              {esAdministrador && <NavLink to="/administrar/parametros">Parámetros</NavLink>}
              {esTecnicoOAdministrador && <NavLink to="/administrar/estadisticas">Estadísticas</NavLink>}
              {esTecnicoOAdministrador && <NavLink to="/administrar/auditoria">Auditoría</NavLink>}
              {esTecnicoOAdministrador && <NavLink to="/administrar/backups">Backups</NavLink>}
              <label className="panel-nav-submenu-checkbox">
                <input
                  type="checkbox"
                  checked={fondoAnimado}
                  onChange={(event) => setFondoAnimado(event.target.checked)}
                />
                Fondo animado
              </label>
            </div>
          </div>

          {modalPasswordAbierto && (
            <ModalCambiarPassword onClose={() => setModalPasswordAbierto(false)} />
          )}

          <Button
            variant="secondary"
            className="panel-logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            {ICONO_CERRAR_SESION}
          </Button>
        </div>
      </header>

      <main className="panel-content">
        <Outlet />
      </main>
    </div>
  );
}

function PanelLayout() {
  return (
    <NuevoTicketProvider>
      <PanelLayoutContenido />
    </NuevoTicketProvider>
  );
}

export default PanelLayout;

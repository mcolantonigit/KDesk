import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import '../styles/PanelLayout.css';

function PanelLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="panel-layout">
      <header className="panel-header">
        <span className="panel-brand">KDesk</span>
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

import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import RecuperarContrasena from '../pages/RecuperarContrasena';
import ResetearContrasena from '../pages/ResetearContrasena';
import ActivarCuenta from '../pages/ActivarCuenta';
import Inicio from '../pages/Inicio';
import Novedades from '../pages/Novedades';
import NuevoTicket from '../pages/NuevoTicket';
import ListaTickets from '../pages/ListaTickets';
import DetalleTicket from '../pages/DetalleTicket';
import Tablero from '../pages/Tablero';
import UsuariosPermisos from '../pages/UsuariosPermisos';
import Parametros from '../pages/Parametros';
import Estadisticas from '../pages/Estadisticas';
import Auditoria from '../pages/Auditoria';
import Backups from '../pages/Backups';
import PanelLayout from '../layouts/PanelLayout';
import RutaProtegida from './RutaProtegida';
import RutaPublica from './RutaPublica';
import RutaTecnico from './RutaTecnico';
import RutaAdministrador from './RutaAdministrador';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RutaPublica />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/resetear-contrasena" element={<ResetearContrasena />} />
      <Route path="/activar-cuenta" element={<ActivarCuenta />} />

      <Route element={<RutaProtegida />}>
        <Route element={<PanelLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/tickets/nuevo" element={<NuevoTicket />} />
          <Route path="/tickets/activos" element={<ListaTickets soloCerrados={false} />} />
          <Route path="/tickets/cerrados" element={<ListaTickets soloCerrados />} />
          <Route path="/tickets/:id" element={<DetalleTicket />} />

          <Route element={<RutaTecnico />}>
            <Route path="/dashboard/novedades" element={<Novedades />} />
            <Route path="/dashboard/tablero" element={<Tablero />} />
            <Route path="/administrar/estadisticas" element={<Estadisticas />} />
            <Route path="/administrar/auditoria" element={<Auditoria />} />
            <Route path="/administrar/backups" element={<Backups />} />
          </Route>

          <Route element={<RutaAdministrador />}>
            <Route path="/administrar/usuarios" element={<UsuariosPermisos />} />
            <Route path="/administrar/parametros" element={<Parametros />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;

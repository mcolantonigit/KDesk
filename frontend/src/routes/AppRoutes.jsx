import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Inicio from '../pages/Inicio';
import PanelLayout from '../layouts/PanelLayout';
import RutaProtegida from './RutaProtegida';
import RutaPublica from './RutaPublica';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RutaPublica />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      <Route element={<RutaProtegida />}>
        <Route element={<PanelLayout />}>
          <Route path="/" element={<Inicio />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;

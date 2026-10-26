import { AuthProvider } from './context/AuthContext';
import { PreferenciasProvider, usePreferencias } from './context/PreferenciasContext';
import FondoApp from './components/FondoApp';
import AppRoutes from './routes/AppRoutes';

function Fondo() {
  const { fondo } = usePreferencias();
  return <FondoApp tipo={fondo} />;
}

function App() {
  return (
    <PreferenciasProvider>
      <AuthProvider>
        <Fondo />
        <AppRoutes />
      </AuthProvider>
    </PreferenciasProvider>
  );
}

export default App;

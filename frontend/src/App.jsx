import { AuthProvider } from './context/AuthContext';
import { PreferenciasProvider, usePreferencias } from './context/PreferenciasContext';
import AppRoutes from './routes/AppRoutes';

function FondoAnimado() {
  const { fondoAnimado } = usePreferencias();
  if (!fondoAnimado) return null;
  return <div className="app-fondo-animado" aria-hidden="true" />;
}

function App() {
  return (
    <PreferenciasProvider>
      <AuthProvider>
        <FondoAnimado />
        <AppRoutes />
      </AuthProvider>
    </PreferenciasProvider>
  );
}

export default App;

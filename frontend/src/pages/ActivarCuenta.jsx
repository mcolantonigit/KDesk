import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { activarCuenta } from '../services/usuarios.service';
import AuthLayout from '../components/AuthLayout';

function ActivarCuenta() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [estado, setEstado] = useState(() => (token ? 'cargando' : 'error'));
  const [error, setError] = useState(() => (token ? '' : 'Este link no es válido.'));

  useEffect(() => {
    if (!token) {
      return;
    }

    async function activar() {
      try {
        await activarCuenta(token);
        setEstado('exito');
      } catch (err) {
        setEstado('error');
        setError(err.message);
      }
    }

    activar();
  }, [token]);

  if (estado === 'cargando') {
    return (
      <AuthLayout title="Activando tu cuenta">
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Un momento...</p>
      </AuthLayout>
    );
  }

  if (estado === 'exito') {
    return (
      <AuthLayout title="¡Cuenta activada!">
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Ya podés iniciar sesión con tu correo y contraseña.
        </p>
        <div className="auth-links">
          <Link to="/login">Ir a iniciar sesión</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="No pudimos activar tu cuenta">
      <p className="auth-error">{error}</p>
      <div className="auth-links">
        <Link to="/login">Volver a iniciar sesión</Link>
      </div>
    </AuthLayout>
  );
}

export default ActivarCuenta;

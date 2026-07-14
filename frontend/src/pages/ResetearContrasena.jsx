import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetearPassword } from '../services/usuarios.service';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';

function ResetearContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (passwordNueva !== confirmacion) {
      setError('La contraseña y su confirmación no coinciden');
      return;
    }

    setEnviando(true);
    try {
      await resetearPassword({ token, passwordNueva, confirmacion });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Link inválido">
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Este link no es válido. Pedí uno nuevo desde "¿Olvidaste tu contraseña?".
        </p>
        <div className="auth-links">
          <Link to="/recuperar-contrasena">Pedir un link nuevo</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Elegir nueva contraseña" onSubmit={handleSubmit}>
      <FormField
        id="passwordNueva"
        label="Contraseña nueva"
        type="password"
        value={passwordNueva}
        onChange={(event) => setPasswordNueva(event.target.value)}
        required
      />

      <FormField
        id="confirmacion"
        label="Confirmar contraseña"
        type="password"
        value={confirmacion}
        onChange={(event) => setConfirmacion(event.target.value)}
        required
      />

      <Button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Restablecer contraseña'}
      </Button>

      {error && <p className="auth-error">{error}</p>}

      <div className="auth-links">
        <Link to="/login">Volver a iniciar sesión</Link>
      </div>
    </AuthLayout>
  );
}

export default ResetearContrasena;

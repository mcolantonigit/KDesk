import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../services/usuarios.service';
import { getConfigLogin, urlLoginMicrosoft } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';

// Lo que vuelve el backend en ?error= cuando el login con Microsoft no se completa.
const ERRORES_MICROSOFT = {
  organizacion: 'Solo se puede entrar con una cuenta de Microsoft 365 de Kalop',
  deshabilitada: 'Tu cuenta está deshabilitada. Contactá a un administrador',
  sesion: 'El intento de inicio de sesión venció. Probá de nuevo',
  microsoft: 'Microsoft no completó el inicio de sesión. Probá de nuevo',
};
const ERROR_GENERICO = 'No se pudo iniciar sesión con Microsoft. Probá de nuevo';

const ICONO_MICROSOFT = (
  <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const { setUsuario } = useAuth();

  const codigoError = searchParams.get('error');
  const errorMicrosoft = codigoError ? (ERRORES_MICROSOFT[codigoError] ?? ERROR_GENERICO) : '';

  useEffect(() => {
    getConfigLogin().then(setConfig);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const usuario = await login({ correo, password });
      setUsuario(usuario);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!config) return null;

  return (
    <AuthLayout title="Iniciar sesión" onSubmit={handleSubmit}>
      {config.microsoft && (
        <Button
          variant={config.password ? 'secondary' : 'primary'}
          onClick={() => window.location.assign(urlLoginMicrosoft())}
        >
          {ICONO_MICROSOFT} Entrar con Microsoft
        </Button>
      )}

      {errorMicrosoft && <p className="auth-error">{errorMicrosoft}</p>}

      {config.password && (
        <>
          <FormField
            id="correo"
            label="Correo electrónico"
            type="email"
            placeholder="nombre@tuempresa.com"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            required
          />

          <FormField
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button type="submit">Iniciar sesión</Button>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-links">
            <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
            <Link to="/registro">Registrarse</Link>
          </div>
        </>
      )}

      {!config.password && !config.microsoft && (
        <p className="auth-error">El inicio de sesión no está disponible. Contactá a Sistemas</p>
      )}
    </AuthLayout>
  );
}

export default Login;

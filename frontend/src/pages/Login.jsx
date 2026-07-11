import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/usuarios.service';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setUsuario } = useAuth();

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

  return (
    <AuthLayout title="Iniciar sesión" onSubmit={handleSubmit}>
      <FormField
        id="correo"
        label="Correo electrónico"
        type="email"
        placeholder="nombre@kalop.com.ar"
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
    </AuthLayout>
  );
}

export default Login;

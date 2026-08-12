import { useState } from 'react';
import { Link } from 'react-router-dom';
import { solicitarResetPassword } from '../services/usuarios.service';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';

function RecuperarContrasena() {
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      await solicitarResetPassword(correo);
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <AuthLayout title="Revisá tu correo">
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Si <strong>{correo}</strong> está registrado en KDesk, te enviamos un mail con instrucciones para
          restablecer tu contraseña. El link vence en 1 hora.
        </p>
        <div className="auth-links">
          <Link to="/login">Volver a iniciar sesión</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Recuperar contraseña" onSubmit={handleSubmit}>
      <FormField
        id="correo"
        label="Correo electrónico"
        type="email"
        placeholder="nombre@tuempresa.com"
        value={correo}
        onChange={(event) => setCorreo(event.target.value)}
        required
      />

      <Button type="submit" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar instrucciones'}
      </Button>

      {error && <p className="auth-error">{error}</p>}

      <div className="auth-links">
        <Link to="/login">Volver a iniciar sesión</Link>
      </div>
    </AuthLayout>
  );
}

export default RecuperarContrasena;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from './Button';

const SEGUNDOS_REDIRECCION = 5;

const TEXTOS = {
  vencida: {
    titulo: 'Tu sesión venció',
    detalle: 'Por seguridad, la sesión dura unas horas. Volvé a iniciar sesión para seguir.',
  },
  requerida: {
    titulo: 'Tenés que iniciar sesión',
    detalle: 'Para ver esta pantalla de KDesk primero tenés que iniciar sesión.',
  },
};

// Avisa que hace falta iniciar sesión y lleva solo a /login después de unos
// segundos (o en el momento, con el botón).
function SesionRequerida({ motivo }) {
  const navigate = useNavigate();
  const [segundos, setSegundos] = useState(SEGUNDOS_REDIRECCION);
  const textos = TEXTOS[motivo] ?? TEXTOS.requerida;

  useEffect(() => {
    if (segundos <= 0) {
      navigate('/login', { replace: true });
      return undefined;
    }
    const temporizador = setTimeout(() => setSegundos((anterior) => anterior - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [segundos, navigate]);

  function irAhora(event) {
    event.preventDefault();
    navigate('/login', { replace: true });
  }

  return (
    <AuthLayout title={textos.titulo} onSubmit={irAhora}>
      <p className="auth-texto" role="status">
        {textos.detalle}
        <br />
        Te llevamos al inicio de sesión en {segundos} {segundos === 1 ? 'segundo' : 'segundos'}.
      </p>
      <Button type="submit">Iniciar sesión ahora</Button>
    </AuthLayout>
  );
}

export default SesionRequerida;

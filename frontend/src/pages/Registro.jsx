import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/usuarios.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import '../styles/Registro.css';

const ROL_USUARIO = 1;

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [idSucursal, setIdSucursal] = useState('');
  const [idSector, setIdSector] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    getSucursales().then((data) => setSucursales(data.filter((sucursal) => sucursal.activo)));
    getSectores().then((data) => setSectores(data.filter((sector) => sector.activo)));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmacion) {
      setError('La contraseña y su confirmación no coinciden');
      return;
    }

    try {
      await register({
        nombre,
        apellido,
        correo,
        password,
        idRol: ROL_USUARIO,
        idSucursal,
        idSector,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout title="Crear cuenta" onSubmit={handleSubmit} className="auth-card-registro">
      <div className="registro-campos">
        <FormField
          id="nombre"
          label="Nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          required
        />

        <FormField
          id="apellido"
          label="Apellido"
          value={apellido}
          onChange={(event) => setApellido(event.target.value)}
          required
        />

        <FormField
          id="correo"
          label="Correo electrónico"
          type="email"
          placeholder="nombre@kalop.com.ar"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          className="registro-campo-completo"
          required
        />

        <FormField
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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

        <FormField
          id="idSucursal"
          label="Sucursal"
          value={idSucursal}
          onChange={(event) => setIdSucursal(event.target.value)}
          options={sucursales}
          required
        />

        <FormField
          id="idSector"
          label="Sector"
          value={idSector}
          onChange={(event) => setIdSector(event.target.value)}
          options={sectores}
          required
        />
      </div>

      <Button type="submit">Registrarse</Button>

      {error && <p className="auth-error">{error}</p>}

      <div className="auth-links registro-links">
        <Link to="/login">¿Ya tenés cuenta? Iniciar sesión</Link>
      </div>
    </AuthLayout>
  );
}

export default Registro;

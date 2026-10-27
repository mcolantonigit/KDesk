import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAltaPendiente, confirmarAlta } from '../services/auth.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import '../styles/Registro.css';

// Primera vez que alguien entra con Microsoft 365: los datos vienen de su
// cuenta y solo falta elegir sucursal y sector (y corregir el nombre si hace falta).
function CompletarRegistro() {
  const [alta, setAlta] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [idSucursal, setIdSucursal] = useState('');
  const [idSector, setIdSector] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();
  const { setUsuario } = useAuth();

  useEffect(() => {
    getAltaPendiente()
      .then((datos) => {
        setAlta(datos);
        setNombre(datos.nombre);
        setApellido(datos.apellido);
      })
      .catch((err) => setError(err.message));
    getSucursales().then((data) => setSucursales(data.filter((sucursal) => sucursal.activo)));
    getSectores().then((data) => setSectores(data.filter((sector) => sector.activo)));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const usuario = await confirmarAlta({ nombre, apellido, idSucursal: Number(idSucursal), idSector: Number(idSector) });
      setUsuario(usuario);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  if (!alta) {
    return (
      <AuthLayout title="Completar registro">
        {error ? <p className="auth-error">{error}</p> : <p>Cargando...</p>}
        <div className="auth-links">
          <Link to="/login">Volver a iniciar sesión</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Completar registro" onSubmit={handleSubmit} className="auth-card-registro">
      <p>
        Es la primera vez que entrás con <strong>{alta.correo}</strong>. Revisá tus datos y elegí tu sucursal y sector.
      </p>

      <div className="registro-campos">
        <FormField id="nombre" label="Nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} required />

        <FormField id="apellido" label="Apellido" value={apellido} onChange={(event) => setApellido(event.target.value)} required />

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

      <Button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Entrar a KDesk'}
      </Button>

      {error && <p className="auth-error">{error}</p>}
    </AuthLayout>
  );
}

export default CompletarRegistro;

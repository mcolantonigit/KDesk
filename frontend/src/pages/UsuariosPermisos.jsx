import { useEffect, useMemo, useState } from 'react';
import { getUsuarios, cambiarRolUsuario, cambiarEstadoActivo } from '../services/usuarios.service';
import { getRoles } from '../services/roles.service';
import { useAuth } from '../context/AuthContext';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import ModalBlanquearPassword from '../components/ModalBlanquearPassword';
import Button from '../components/Button';
import '../styles/TablaTickets.css';
import Selector from '../components/Selector';
import '../styles/Tablero.css';

const ROL_ADMINISTRADOR = 3;
const ROLES_ASIGNABLES = [1, 2, ROL_ADMINISTRADOR];

const COLUMNAS = [
  { key: 'nombre', label: 'Nombre', visiblePorDefecto: true },
  { key: 'apellido', label: 'Apellido', visiblePorDefecto: true },
  { key: 'correo', label: 'Correo', visiblePorDefecto: true },
  { key: 'rol', label: 'Rol', visiblePorDefecto: true },
  { key: 'sucursal', label: 'Sucursal', visiblePorDefecto: true },
  { key: 'sector', label: 'Sector', visiblePorDefecto: true },
  { key: 'fecha_registro', label: 'Fecha de registro', visiblePorDefecto: false },
];

function UsuariosPermisos() {
  const { usuario: sesion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [mostrarDeshabilitados, setMostrarDeshabilitados] = useState(false);
  const [usuarioParaPassword, setUsuarioParaPassword] = useState(null);
  const [mostrarColumnas, setMostrarColumnas] = useState(false);
  const [columnasVisibles, setColumnasVisibles] = useState(() =>
    Object.fromEntries(COLUMNAS.map((columna) => [columna.key, columna.visiblePorDefecto]))
  );
  const [ordenPor, setOrdenPor] = useState('nombre');
  const [ordenAsc, setOrdenAsc] = useState(true);

  async function cargarTodo() {
    try {
      const [usuariosData, rolesData, sucursalesData, sectoresData] = await Promise.all([
        getUsuarios(),
        getRoles(),
        getSucursales(),
        getSectores(),
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setSucursales(sucursalesData);
      setSectores(sectoresData);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function refrescarUsuarios() {
    try {
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
    } catch (err) {
      window.alert(err.message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTodo();
  }, []);

  const rolesPorId = useMemo(() => Object.fromEntries(roles.map((rol) => [rol.id, rol.nombre])), [roles]);
  const sucursalesPorId = useMemo(
    () => Object.fromEntries(sucursales.map((sucursal) => [sucursal.id, sucursal.nombre])),
    [sucursales]
  );
  const sectoresPorId = useMemo(() => Object.fromEntries(sectores.map((sector) => [sector.id, sector.nombre])), [sectores]);

  const usuariosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      if (!mostrarDeshabilitados && !usuario.activo) return false;

      if (!busquedaNormalizada) return true;
      const campos = [usuario.nombre, usuario.apellido, usuario.correo];
      return campos.some((campo) => campo?.toLowerCase().includes(busquedaNormalizada));
    });
  }, [usuarios, busqueda, mostrarDeshabilitados]);

  function valorOrdenable(usuario, key) {
    switch (key) {
      case 'rol':
        return rolesPorId[usuario.id_rol] ?? '';
      case 'sucursal':
        return sucursalesPorId[usuario.id_sucursal] ?? '';
      case 'sector':
        return sectoresPorId[usuario.id_sector] ?? '';
      case 'fecha_registro':
        return new Date(usuario.fecha_registro).getTime();
      case 'activo':
        return usuario.activo ? 1 : 0;
      default:
        return usuario[key] ?? '';
    }
  }

  const usuariosOrdenados = useMemo(() => {
    const copia = [...usuariosFiltrados];
    copia.sort((a, b) => {
      const valorA = valorOrdenable(a, ordenPor);
      const valorB = valorOrdenable(b, ordenPor);
      if (valorA < valorB) return ordenAsc ? -1 : 1;
      if (valorA > valorB) return ordenAsc ? 1 : -1;
      return 0;
    });
    return copia;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuariosFiltrados, ordenPor, ordenAsc, rolesPorId, sucursalesPorId, sectoresPorId]);

  function handleOrdenar(columna) {
    if (columna === ordenPor) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenPor(columna);
      setOrdenAsc(true);
    }
  }

  async function handleCambiarRol(usuario, idRol) {
    if (idRol === ROL_ADMINISTRADOR) {
      const confirmado = window.confirm(
        `${usuario.nombre} ${usuario.apellido} va a poder administrar usuarios, roles y parámetros de KDesk. ¿Confirmás?`
      );
      if (!confirmado) return;
    }

    try {
      await cambiarRolUsuario(usuario.id, idRol);
      await refrescarUsuarios();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleToggleActivo(usuario) {
    if (usuario.activo) {
      const confirmado = window.confirm(
        `Deshabilitar a ${usuario.nombre} ${usuario.apellido} no lo borra de la base de datos, ` +
          'pero le impedirá usar el sistema. ¿Confirmás?'
      );
      if (!confirmado) return;
    }

    try {
      await cambiarEstadoActivo(usuario.id, !usuario.activo);
      await refrescarUsuarios();
    } catch (err) {
      window.alert(err.message);
    }
  }

  function toggleColumna(key) {
    setColumnasVisibles((anteriores) => ({ ...anteriores, [key]: !anteriores[key] }));
  }

  const columnasActivas = COLUMNAS.filter((columna) => columnasVisibles[columna.key]);

  function renderCelda(usuario, key) {
    switch (key) {
      case 'nombre':
        return usuario.nombre;
      case 'apellido':
        return usuario.apellido;
      case 'correo':
        return usuario.correo;
      case 'rol':
        // El propio rol no se cambia, para no quedarse afuera por error.
        return usuario.id === sesion?.id ? (
          rolesPorId[usuario.id_rol] ?? '—'
        ) : (
          <Selector aria-label="Rol" value={usuario.id_rol} onChange={(event) => handleCambiarRol(usuario, Number(event.target.value))}>
            {ROLES_ASIGNABLES.map((idRol) => (
              <option key={idRol} value={idRol}>
                {rolesPorId[idRol] ?? idRol}
              </option>
            ))}
          </Selector>
        );
      case 'sucursal':
        return sucursalesPorId[usuario.id_sucursal] ?? '—';
      case 'sector':
        return sectoresPorId[usuario.id_sector] ?? '—';
      case 'fecha_registro':
        return new Date(usuario.fecha_registro).toLocaleDateString();
      default:
        return null;
    }
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;

  return (
    <div className="tablero">
      <h1>Usuarios y permisos</h1>

      <div className="tablero-toolbar">
        <div className="tablero-toolbar-fila">
          <input
            className="tablero-busqueda"
            type="text"
            placeholder="Buscar por nombre, apellido o correo..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
      </div>

      <div className="tabla-tickets-contenedor">
        <label className="tabla-catalogo-mostrar-inactivos">
          <input
            type="checkbox"
            checked={mostrarDeshabilitados}
            onChange={(event) => setMostrarDeshabilitados(event.target.checked)}
          />
          Mostrar deshabilitados
        </label>

        <div className="tabla-tickets-columnas">
          <Button variant="secondary" type="button" onClick={() => setMostrarColumnas(!mostrarColumnas)}>
            Columnas
          </Button>
          {mostrarColumnas && (
            <div className="tabla-tickets-columnas-panel">
              {COLUMNAS.map((columna) => (
                <label key={columna.key}>
                  <input
                    type="checkbox"
                    checked={columnasVisibles[columna.key]}
                    onChange={() => toggleColumna(columna.key)}
                  />
                  {columna.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="tabla-tickets-scroll">
          <table className="tabla-tickets tabla-apilada tabla-usuarios">
            <thead>
              <tr>
                {columnasActivas.map((columna) => (
                  <th key={columna.key} onClick={() => handleOrdenar(columna.key)}>
                    {columna.label}
                    {ordenPor === columna.key && <span className="tabla-tickets-orden">{ordenAsc ? ' ▲' : ' ▼'}</span>}
                  </th>
                ))}
                <th onClick={() => handleOrdenar('activo')}>
                  Activo
                  {ordenPor === 'activo' && <span className="tabla-tickets-orden">{ordenAsc ? ' ▲' : ' ▼'}</span>}
                </th>
                <th>Contraseña</th>
              </tr>
            </thead>
            <tbody>
              {usuariosOrdenados.map((usuario) => (
                <tr key={usuario.id}>
                  {columnasActivas.map((columna) => (
                    <td key={columna.key} data-label={columna.label}>
                      {renderCelda(usuario, columna.key)}
                    </td>
                  ))}
                  <td data-label="">
                    <Button variant="secondary" onClick={() => handleToggleActivo(usuario)}>
                      {usuario.activo ? 'Deshabilitar' : 'Habilitar'}
                    </Button>
                  </td>
                  <td data-label="">
                    {usuario.con_password ? (
                      <Button variant="secondary" onClick={() => setUsuarioParaPassword(usuario)}>
                        Cambiar contraseña
                      </Button>
                    ) : (
                      'Microsoft 365'
                    )}
                  </td>
                </tr>
              ))}
              {usuariosOrdenados.length === 0 && (
                <tr>
                  <td colSpan={columnasActivas.length + 2} className="tabla-tickets-vacio">
                    No hay usuarios para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {usuarioParaPassword && (
        <ModalBlanquearPassword
          usuario={usuarioParaPassword}
          onClose={() => setUsuarioParaPassword(null)}
          onBlanqueado={() => {
            setUsuarioParaPassword(null);
            window.alert('Contraseña actualizada');
          }}
        />
      )}
    </div>
  );
}

export default UsuariosPermisos;

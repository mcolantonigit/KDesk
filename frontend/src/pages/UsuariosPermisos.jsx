import { useEffect, useMemo, useState } from 'react';
import { getUsuarios, cambiarRolUsuario } from '../services/usuarios.service';
import { getRoles } from '../services/roles.service';
import { getSucursales } from '../services/sucursales.service';
import { getSectores } from '../services/sectores.service';
import ModalBlanquearPassword from '../components/ModalBlanquearPassword';
import Button from '../components/Button';
import '../styles/TablaTickets.css';
import '../styles/Tablero.css';

const ROL_ADMINISTRADOR = 3;
const ROLES_ASIGNABLES = [1, 2];

const COLUMNAS = [
  { key: 'id', label: 'ID', visiblePorDefecto: true },
  { key: 'nombre', label: 'Nombre', visiblePorDefecto: true },
  { key: 'apellido', label: 'Apellido', visiblePorDefecto: true },
  { key: 'correo', label: 'Correo', visiblePorDefecto: true },
  { key: 'rol', label: 'Rol', visiblePorDefecto: true },
  { key: 'sucursal', label: 'Sucursal', visiblePorDefecto: true },
  { key: 'sector', label: 'Sector', visiblePorDefecto: true },
  { key: 'fecha_registro', label: 'Fecha de registro', visiblePorDefecto: false },
  { key: 'activo', label: 'Activo', visiblePorDefecto: false },
];

function UsuariosPermisos() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [usuarioParaPassword, setUsuarioParaPassword] = useState(null);
  const [mostrarColumnas, setMostrarColumnas] = useState(false);
  const [columnasVisibles, setColumnasVisibles] = useState(() =>
    Object.fromEntries(COLUMNAS.map((columna) => [columna.key, columna.visiblePorDefecto]))
  );

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
    if (!busquedaNormalizada) return usuarios;

    return usuarios.filter((usuario) => {
      const campos = [usuario.nombre, usuario.apellido, usuario.correo];
      return campos.some((campo) => campo?.toLowerCase().includes(busquedaNormalizada));
    });
  }, [usuarios, busqueda]);

  async function handleCambiarRol(usuario, idRol) {
    try {
      await cambiarRolUsuario(usuario.id, idRol);
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
      case 'id':
        return usuario.id;
      case 'nombre':
        return usuario.nombre;
      case 'apellido':
        return usuario.apellido;
      case 'correo':
        return usuario.correo;
      case 'rol':
        return usuario.id_rol === ROL_ADMINISTRADOR ? (
          rolesPorId[usuario.id_rol] ?? '—'
        ) : (
          <select value={usuario.id_rol} onChange={(event) => handleCambiarRol(usuario, Number(event.target.value))}>
            {ROLES_ASIGNABLES.map((idRol) => (
              <option key={idRol} value={idRol}>
                {rolesPorId[idRol] ?? idRol}
              </option>
            ))}
          </select>
        );
      case 'sucursal':
        return sucursalesPorId[usuario.id_sucursal] ?? '—';
      case 'sector':
        return sectoresPorId[usuario.id_sector] ?? '—';
      case 'fecha_registro':
        return new Date(usuario.fecha_registro).toLocaleDateString();
      case 'activo':
        return usuario.activo ? 'Sí' : 'No';
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
          <table className="tabla-tickets">
            <thead>
              <tr>
                {columnasActivas.map((columna) => (
                  <th key={columna.key}>{columna.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  {columnasActivas.map((columna) => (
                    <td key={columna.key}>{renderCelda(usuario, columna.key)}</td>
                  ))}
                  <td>
                    <Button variant="secondary" onClick={() => setUsuarioParaPassword(usuario)}>
                      Cambiar contraseña
                    </Button>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={columnasActivas.length + 1} className="tabla-tickets-vacio">
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

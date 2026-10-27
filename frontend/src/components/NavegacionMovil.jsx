import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useNuevoTicket } from '../context/NuevoTicketContext';
import '../styles/NavegacionMovil.css';

const ROLES_TECNICOS = [2, 3];
const ROL_ADMINISTRADOR = 3;

const icono = (contenido) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {contenido}
  </svg>
);

const ICONOS = {
  inicio: icono(<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />),
  novedades: icono(<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />),
  tickets: icono(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />),
  tablero: icono(<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />),
  cerrados: icono(<path d="M20 6L9 17l-5-5" />),
  mas: icono(<path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />),
  nuevo: icono(<path d="M12 5v14M5 12h14" />),
};

// Navegación del celular: barra fija abajo con los destinos principales, un botón
// central para crear un ticket y "Más", que abre el resto de las opciones.
function NavegacionMovil({ usuario, onMisDatos, onCambiarPassword, onCerrarSesion }) {
  const { abrir: abrirNuevoTicket } = useNuevoTicket();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const esTecnico = ROLES_TECNICOS.includes(usuario?.id_rol);
  const esAdministrador = usuario?.id_rol === ROL_ADMINISTRADOR;

  const primero = esTecnico
    ? { to: '/dashboard/novedades', etiqueta: 'Novedades', icono: ICONOS.novedades }
    : { to: '/', etiqueta: 'Inicio', icono: ICONOS.inicio, end: true };
  const cuarto = esTecnico
    ? { to: '/dashboard/tablero', etiqueta: 'Tablero', icono: ICONOS.tablero }
    : { to: '/tickets/cerrados', etiqueta: 'Cerrados', icono: ICONOS.cerrados };

  useEffect(() => {
    if (!menuAbierto) return undefined;
    function alTeclear(evento) {
      if (evento.key === 'Escape') setMenuAbierto(false);
    }
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [menuAbierto]);

  const enlaceDeBarra = (destino) => (
    <NavLink to={destino.to} end={destino.end} className="navegacion-movil-item">
      {destino.icono}
      <span>{destino.etiqueta}</span>
    </NavLink>
  );

  // Cada opción del menú "Más" lo cierra al elegirla.
  const opcion = (to, etiqueta) => (
    <NavLink to={to} onClick={() => setMenuAbierto(false)}>
      {etiqueta}
    </NavLink>
  );

  return (
    <>
      <nav className="navegacion-movil no-imprimir" aria-label="Navegación principal">
        {enlaceDeBarra(primero)}
        {enlaceDeBarra({ to: '/tickets/activos', etiqueta: 'Tickets', icono: ICONOS.tickets })}
        <button type="button" className="navegacion-movil-nuevo" onClick={abrirNuevoTicket} aria-label="Nuevo ticket">
          {ICONOS.nuevo}
        </button>
        {enlaceDeBarra(cuarto)}
        <button
          type="button"
          className={`navegacion-movil-item ${menuAbierto ? 'active' : ''}`}
          onClick={() => setMenuAbierto(true)}
          aria-haspopup="dialog"
        >
          {ICONOS.mas}
          <span>Más</span>
        </button>
      </nav>

      {menuAbierto && (
        <div className="menu-movil-fondo no-imprimir" onClick={() => setMenuAbierto(false)}>
          <div className="menu-movil" role="dialog" aria-modal="true" aria-label="Más opciones" onClick={(evento) => evento.stopPropagation()}>
            <div className="menu-movil-agarre" aria-hidden="true" />
            <p className="menu-movil-usuario">
              {usuario?.nombre} {usuario?.apellido}
            </p>

            <div className="menu-movil-grupo">
              {esTecnico && opcion('/tickets/cerrados', 'Tickets cerrados')}
              {opcion('/configuracion/alertas', 'Alertas')}
              {opcion('/configuracion/apariencia', 'Apariencia')}
              {usuario && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuAbierto(false);
                    onMisDatos();
                  }}
                >
                  Mis datos
                </button>
              )}
              {usuario && !esAdministrador && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuAbierto(false);
                    onCambiarPassword();
                  }}
                >
                  Cambiar contraseña
                </button>
              )}
            </div>

            {esTecnico && (
              <div className="menu-movil-grupo">
                <span className="menu-movil-titulo">Administración</span>
                {esAdministrador && opcion('/administrar/usuarios', 'Usuarios y permisos')}
                {esAdministrador && opcion('/administrar/parametros', 'Parámetros')}
                {opcion('/administrar/estadisticas', 'Estadísticas')}
                {opcion('/administrar/auditoria', 'Auditoría')}
                {opcion('/administrar/backups', 'Backups')}
              </div>
            )}

            <button type="button" className="menu-movil-salir" onClick={onCerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default NavegacionMovil;

const TITULOS = {
  '/': 'Inicio',
  '/dashboard/novedades': 'Novedades',
  '/dashboard/tablero': 'Tablero',
  '/tickets/activos': 'Tickets activos',
  '/tickets/cerrados': 'Tickets cerrados',
  '/configuracion/alertas': 'Alertas',
  '/configuracion/apariencia': 'Apariencia',
  '/administrar/usuarios': 'Usuarios y permisos',
  '/administrar/parametros': 'Parámetros',
  '/administrar/estadisticas': 'Estadísticas',
  '/administrar/auditoria': 'Auditoría',
  '/administrar/backups': 'Backups',
};

// Título de la pantalla actual, para la barra superior del celular.
export function tituloDeRuta(pathname) {
  if (TITULOS[pathname]) return TITULOS[pathname];
  if (/^\/tickets\/\d+$/.test(pathname)) return 'Ticket';
  return 'KDesk';
}

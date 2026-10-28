import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NavegacionMovil from './NavegacionMovil';

const abrirNuevoTicket = vi.fn();
vi.mock('../context/NuevoTicketContext', () => ({ useNuevoTicket: () => ({ abrir: abrirNuevoTicket }) }));

const tecnico = { id: 1, id_rol: 2, nombre: 'Luis', apellido: 'Gómez', con_password: true };
const comun = { id: 2, id_rol: 1, nombre: 'Ana', apellido: 'Pérez' };
const administrador = { id: 3, id_rol: 3, nombre: 'Marta', apellido: 'Ruiz', con_password: false };

function abrir(usuario, { ruta = '/', onCambiarPassword = () => {}, onCerrarSesion = () => {} } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <NavegacionMovil usuario={usuario} onCambiarPassword={onCambiarPassword} onCerrarSesion={onCerrarSesion} />
    </MemoryRouter>
  );
}

const barra = () => within(screen.getByRole('navigation', { name: 'Navegación principal' }));
const menu = () => within(screen.getByRole('dialog', { name: 'Más opciones' }));

describe('NavegacionMovil', () => {
  beforeEach(() => vi.clearAllMocks());

  it('un técnico ve Novedades, Tickets, el botón de nuevo ticket, Tablero y Más', () => {
    abrir(tecnico, { ruta: '/dashboard/novedades' });

    const enlaces = barra().getAllByRole('link').map((enlace) => enlace.textContent);
    expect(enlaces).toEqual(['Novedades', 'Tickets', 'Tablero']);
    expect(barra().getByRole('button', { name: 'Nuevo ticket' })).toBeInTheDocument();
    expect(barra().getByRole('button', { name: 'Más' })).toBeInTheDocument();
  });

  it('un usuario común ve Inicio y Cerrados en lugar de Novedades y Tablero', () => {
    abrir(comun);

    const enlaces = barra().getAllByRole('link').map((enlace) => enlace.textContent);
    expect(enlaces).toEqual(['Inicio', 'Tickets', 'Cerrados']);
  });

  it('marca la pantalla actual', () => {
    abrir(tecnico, { ruta: '/tickets/activos' });

    expect(barra().getByRole('link', { name: 'Tickets' })).toHaveClass('active');
    expect(barra().getByRole('link', { name: 'Tablero' })).not.toHaveClass('active');
  });

  it('el botón central abre el formulario de nuevo ticket', async () => {
    abrir(tecnico);

    await userEvent.click(barra().getByRole('button', { name: 'Nuevo ticket' }));

    expect(abrirNuevoTicket).toHaveBeenCalled();
  });

  it('"Más" abre un menú con las opciones de un técnico, sin las de administrador', async () => {
    abrir(tecnico);

    await userEvent.click(barra().getByRole('button', { name: 'Más' }));

    expect(menu().getByText('Luis Gómez')).toBeInTheDocument();
    for (const texto of ['Tickets cerrados', 'Alertas', 'Apariencia', 'Mis datos', 'Cambiar contraseña', 'Estadísticas', 'Auditoría', 'Backups', 'Cerrar sesión']) {
      expect(menu().getByText(texto)).toBeInTheDocument();
    }
    expect(menu().queryByText('Usuarios y permisos')).not.toBeInTheDocument();
    expect(menu().queryByText('Parámetros')).not.toBeInTheDocument();
  });

  it('un administrador ve además Usuarios y Parámetros', async () => {
    abrir(administrador);

    await userEvent.click(barra().getByRole('button', { name: 'Más' }));

    expect(menu().getByText('Usuarios y permisos')).toBeInTheDocument();
    expect(menu().getByText('Parámetros')).toBeInTheDocument();
  });

  it('quien entra con Microsoft 365 no ve "Cambiar contraseña"', async () => {
    abrir({ ...tecnico, con_password: false });

    await userEvent.click(barra().getByRole('button', { name: 'Más' }));

    expect(menu().getByText('Mis datos')).toBeInTheDocument();
    expect(menu().queryByText('Cambiar contraseña')).not.toBeInTheDocument();
  });

  it('un usuario común no ve administración ni "Tickets cerrados" (ya está en la barra)', async () => {
    abrir(comun);

    await userEvent.click(barra().getByRole('button', { name: 'Más' }));

    expect(menu().queryByText('Administración')).not.toBeInTheDocument();
    expect(menu().queryByText('Tickets cerrados')).not.toBeInTheDocument();
    expect(menu().getByText('Alertas')).toBeInTheDocument();
  });

  it('elegir una opción cierra el menú', async () => {
    abrir(tecnico);
    await userEvent.click(barra().getByRole('button', { name: 'Más' }));

    await userEvent.click(menu().getByText('Alertas'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('"Cambiar contraseña" y "Cerrar sesión" avisan', async () => {
    const onCambiarPassword = vi.fn();
    const onCerrarSesion = vi.fn();
    abrir(tecnico, { onCambiarPassword, onCerrarSesion });

    await userEvent.click(barra().getByRole('button', { name: 'Más' }));
    await userEvent.click(menu().getByText('Cambiar contraseña'));
    expect(onCambiarPassword).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(barra().getByRole('button', { name: 'Más' }));
    await userEvent.click(menu().getByText('Cerrar sesión'));
    expect(onCerrarSesion).toHaveBeenCalled();
  });

  it('el menú se cierra con Escape', async () => {
    abrir(tecnico);
    await userEvent.click(barra().getByRole('button', { name: 'Más' }));

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

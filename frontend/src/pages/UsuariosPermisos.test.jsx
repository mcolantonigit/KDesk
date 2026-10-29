import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsuariosPermisos from './UsuariosPermisos';
import { getUsuarios, cambiarKadiUsuario } from '../services/usuarios.service';
import { getKadiActiva } from '../services/kadi.service';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ usuario: { id: 1, id_rol: 3 } }) }));
vi.mock('../services/usuarios.service', () => ({
  getUsuarios: vi.fn(),
  cambiarRolUsuario: vi.fn(),
  cambiarEstadoActivo: vi.fn(),
  cambiarKadiUsuario: vi.fn(),
}));
vi.mock('../services/kadi.service', () => ({ getKadiActiva: vi.fn() }));
vi.mock('../services/roles.service', () => ({
  getRoles: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'usuario' },
    { id: 2, nombre: 'tecnico' },
    { id: 3, nombre: 'administrador' },
  ]),
}));
vi.mock('../services/sucursales.service', () => ({ getSucursales: vi.fn().mockResolvedValue([{ id: 1, nombre: 'ACSA' }]) }));
vi.mock('../services/sectores.service', () => ({ getSectores: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Sistemas' }]) }));

const usuario = (id, nombre, kadi) => ({
  id,
  nombre,
  apellido: 'Prueba',
  correo: `${nombre.toLowerCase()}@kalop.com.ar`,
  id_rol: 1,
  id_sucursal: 1,
  id_sector: 1,
  fecha_registro: '2026-10-01T10:00:00Z',
  activo: true,
  con_password: false,
  kadi_habilitada: kadi,
});

describe('UsuariosPermisos: columna Kadi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUsuarios.mockResolvedValue([usuario(2, 'Ana', true), usuario(3, 'Beto', false)]);
  });

  it('con Kadi activa en el backend muestra una casilla por usuario, marcada según corresponda', async () => {
    getKadiActiva.mockResolvedValue(true);
    render(<UsuariosPermisos />);

    expect(await screen.findByRole('columnheader', { name: 'Kadi' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Kadi para Ana Prueba' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Kadi para Beto Prueba' })).not.toBeChecked();
  });

  it('al tildar una casilla habilita Kadi para ese usuario y recarga la lista', async () => {
    getKadiActiva.mockResolvedValue(true);
    cambiarKadiUsuario.mockResolvedValue({});
    render(<UsuariosPermisos />);

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Kadi para Beto Prueba' }));

    expect(cambiarKadiUsuario).toHaveBeenCalledWith(3, true);
    expect(getUsuarios).toHaveBeenCalledTimes(2);
  });

  it('si el backend no tiene Kadi activa (producción) la columna no aparece', async () => {
    getKadiActiva.mockResolvedValue(false);
    render(<UsuariosPermisos />);

    await screen.findByText('Ana');
    expect(screen.queryByRole('columnheader', { name: 'Kadi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Kadi para/ })).not.toBeInTheDocument();
  });
});

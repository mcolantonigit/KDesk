import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CompletarRegistro from './CompletarRegistro';

const setUsuario = vi.fn();
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ setUsuario }) }));
vi.mock('../services/auth.service', () => ({ getAltaPendiente: vi.fn(), confirmarAlta: vi.fn() }));
vi.mock('../services/sucursales.service', () => ({
  getSucursales: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Casa Central', activo: true },
    { id: 2, nombre: 'Cerrada', activo: false },
  ]),
}));
vi.mock('../services/sectores.service', () => ({
  getSectores: vi.fn().mockResolvedValue([{ id: 4, nombre: 'Ventas', activo: true }]),
}));

import { getAltaPendiente, confirmarAlta } from '../services/auth.service';

function abrir() {
  render(
    <MemoryRouter initialEntries={['/completar-registro']}>
      <Routes>
        <Route path="/completar-registro" element={<CompletarRegistro />} />
        <Route path="/" element={<p>Inicio</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CompletarRegistro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trae los datos de Microsoft, pide sucursal y sector, y entra a KDesk', async () => {
    getAltaPendiente.mockResolvedValue({ correo: 'ana@kalop.com.ar', nombre: 'Ana', apellido: 'Pérez' });
    const usuario = { id: 7, nombre: 'Ana', apellido: 'Pérez' };
    confirmarAlta.mockResolvedValue(usuario);
    abrir();

    expect(await screen.findByText('ana@kalop.com.ar')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
    expect(screen.queryByRole('option', { name: 'Cerrada' })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Sucursal'), 'Casa Central');
    await userEvent.selectOptions(screen.getByLabelText('Sector'), 'Ventas');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar a KDesk' }));

    expect(confirmarAlta).toHaveBeenCalledWith({ nombre: 'Ana', apellido: 'Pérez', idSucursal: 1, idSector: 4 });
    expect(setUsuario).toHaveBeenCalledWith(usuario);
    expect(await screen.findByText('Inicio')).toBeInTheDocument();
  });

  it('si el alta venció, lo dice y ofrece volver al login', async () => {
    getAltaPendiente.mockRejectedValue(new Error('El alta venció. Volvé a entrar con Microsoft'));
    abrir();

    expect(await screen.findByText('El alta venció. Volvé a entrar con Microsoft')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a iniciar sesión' })).toBeInTheDocument();
  });
});

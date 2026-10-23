import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ModalNuevoTicket from './ModalNuevoTicket';

const navigate = vi.fn();
let usuarioActual = { id: 7, id_rol: 1 };

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ usuario: usuarioActual }) }));
vi.mock('../services/tickets.service', () => ({ crearTicket: vi.fn() }));
vi.mock('../services/adjuntos.service', () => ({ subirAdjuntoDeTicket: vi.fn() }));
vi.mock('../services/tiposTicket.service', () => ({
  getTiposTicket: vi.fn().mockResolvedValue([
    { id: 2, nombre: 'Software', activo: true },
    { id: 1, nombre: 'Hardware', activo: true },
    { id: 3, nombre: 'Obsoleto', activo: false },
  ]),
}));
vi.mock('../services/prioridades.service', () => ({
  getPrioridades: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Alta', activo: true }]),
}));
vi.mock('../services/sucursales.service', () => ({
  getSucursales: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Casa Central', activo: true }]),
}));
vi.mock('../services/sectores.service', () => ({
  getSectores: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Sistemas', activo: true }]),
}));
vi.mock('../services/usuarios.service', () => ({
  getUsuarios: vi.fn().mockResolvedValue([{ id: 9, nombre: 'Ana', apellido: 'Pérez', activo: true }]),
}));

import { crearTicket } from '../services/tickets.service';

function abrir(onClose = () => {}) {
  render(
    <MemoryRouter>
      <ModalNuevoTicket onClose={onClose} />
    </MemoryRouter>
  );
}

describe('ModalNuevoTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usuarioActual = { id: 7, id_rol: 1 };
  });

  it('a un usuario común le pide tipo, prioridad, título y descripción', async () => {
    abrir();

    expect(screen.getByLabelText('Tipo de ticket')).toBeInTheDocument();
    expect(screen.getByLabelText('Prioridad sugerida')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sucursal')).not.toBeInTheDocument();
  });

  it('a un técnico además le pide sucursal, sector y usuario', async () => {
    usuarioActual = { id: 7, id_rol: 2 };
    abrir();

    expect(screen.getByLabelText('Sucursal')).toBeInTheDocument();
    expect(screen.getByLabelText('Sector')).toBeInTheDocument();
    expect(screen.getByLabelText(/Usuario que crea el ticket/)).toBeInTheDocument();
  });

  it('ofrece los tipos activos en orden alfabético', async () => {
    abrir();
    await userEvent.click(screen.getByLabelText('Tipo de ticket'));

    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Hardware', 'Software']);
  });

  it('crea el ticket, cierra el modal y navega al detalle', async () => {
    crearTicket.mockResolvedValue({ id: 55 });
    const onClose = vi.fn();
    abrir(onClose);

    await userEvent.click(screen.getByLabelText('Tipo de ticket'));
    await userEvent.click(await screen.findByRole('option', { name: 'Hardware' }));
    await userEvent.click(screen.getByLabelText('Prioridad sugerida'));
    await userEvent.click(await screen.findByRole('option', { name: 'Alta' }));
    await userEvent.type(screen.getByLabelText('Título'), 'No imprime');
    await userEvent.type(screen.getByLabelText('Descripción'), 'La impresora no responde');
    await userEvent.click(screen.getByRole('button', { name: 'Crear ticket' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/tickets/55'));
    expect(crearTicket).toHaveBeenCalledWith(
      expect.objectContaining({ idTipo: 1, idPrioridadSugerida: 1, titulo: 'No imprime' })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra el error si no se pudo crear y no cierra el modal', async () => {
    crearTicket.mockRejectedValue(new Error('Falló el servidor'));
    const onClose = vi.fn();
    abrir(onClose);

    await userEvent.click(screen.getByLabelText('Tipo de ticket'));
    await userEvent.click(await screen.findByRole('option', { name: 'Software' }));
    await userEvent.click(screen.getByLabelText('Prioridad sugerida'));
    await userEvent.click(await screen.findByRole('option', { name: 'Alta' }));
    await userEvent.type(screen.getByLabelText('Título'), 'Algo');
    await userEvent.type(screen.getByLabelText('Descripción'), 'Detalle');
    await userEvent.click(screen.getByRole('button', { name: 'Crear ticket' }));

    expect(await screen.findByText('Falló el servidor')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Crear ticket' })).toBeEnabled();
  });
});

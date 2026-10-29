import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ModalNuevoTicket from './ModalNuevoTicket';
import { getEstadoKadi } from '../services/kadi.service';

const navigate = vi.fn();
let usuarioActual = { id: 7, id_rol: 1 };

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ usuario: usuarioActual }) }));
vi.mock('../services/tickets.service', () => ({ crearTicket: vi.fn() }));
vi.mock('../services/adjuntos.service', () => ({ subirAdjuntoDeTicket: vi.fn() }));
vi.mock('../services/kadi.service', () => ({ getEstadoKadi: vi.fn(), enviarMensajeAKadi: vi.fn() }));
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
import { subirAdjuntoDeTicket } from '../services/adjuntos.service';

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
    getEstadoKadi.mockResolvedValue(false);
  });

  it('si Kadi está habilitada abre el chat, y "Generar manual" muestra el formulario de siempre', async () => {
    getEstadoKadi.mockResolvedValue(true);
    abrir();

    expect(await screen.findByText(/Hola, soy Kadi/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Tipo de ticket')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Generar manual' }));

    expect(await screen.findByLabelText('Tipo de ticket')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Generar asistido' }));

    expect(await screen.findByText(/Hola, soy Kadi/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Tipo de ticket')).not.toBeInTheDocument();
  });

  it('si Kadi no está habilitada o no se puede consultar, queda el formulario', async () => {
    getEstadoKadi.mockRejectedValue(new Error('sin conexión'));
    abrir();

    expect(await screen.findByLabelText('Tipo de ticket')).toBeInTheDocument();
    expect(screen.queryByText(/Hola, soy Kadi/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Generar asistido' })).not.toBeInTheDocument();
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

  it('el selector de archivos solo ofrece los tipos permitidos', () => {
    abrir();

    const accept = screen.getByLabelText('Adjunto (opcional)').getAttribute('accept');
    expect(accept).toContain('.pdf');
    expect(accept).toContain('.xlsx');
    expect(accept).not.toContain('.zip');
  });

  it('si el ticket se crea pero el adjunto falla, avisa y va al ticket (no lo crea dos veces)', async () => {
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
    crearTicket.mockResolvedValue({ id: 56 });
    subirAdjuntoDeTicket.mockRejectedValue(new Error('Tipo de archivo no permitido'));
    abrir();

    await userEvent.click(screen.getByLabelText('Tipo de ticket'));
    await userEvent.click(await screen.findByRole('option', { name: 'Hardware' }));
    await userEvent.click(screen.getByLabelText('Prioridad sugerida'));
    await userEvent.click(await screen.findByRole('option', { name: 'Alta' }));
    await userEvent.type(screen.getByLabelText('Título'), 'No imprime');
    await userEvent.type(screen.getByLabelText('Descripción'), 'Detalle');
    await userEvent.upload(screen.getByLabelText('Adjunto (opcional)'), new File(['x'], 'foto.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: 'Crear ticket' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/tickets/56'));
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining('El ticket se creó, pero no se pudo adjuntar "foto.png"'));
    expect(crearTicket).toHaveBeenCalledTimes(1);
    alerta.mockRestore();
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

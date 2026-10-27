import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DetalleTicket from './DetalleTicket';

const sesion = vi.hoisted(() => ({ usuario: null }));
const USUARIO_COMUN = { id: 1, id_rol: 1, nombre: 'Ana', apellido: 'Pérez' };
const TECNICO = { id: 9, id_rol: 2, nombre: 'Luis', apellido: 'Gómez' };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ usuario: sesion.usuario }),
}));
vi.mock('../components/Checklist', () => ({ default: () => null }));
vi.mock('../services/tickets.service', () => ({
  cambiarEstado: vi.fn().mockResolvedValue({}),
  cambiarTipo: vi.fn().mockResolvedValue({}),
  cambiarPrioridad: vi.fn().mockResolvedValue({}),
  asignarResponsable: vi.fn().mockResolvedValue({}),
  getTicketById: vi.fn().mockResolvedValue({
    id: 5,
    numero: 'TK-000005',
    titulo: 'No imprime',
    descripcion: 'La impresora no responde',
    id_estado: 1,
    id_tipo: 1,
    id_prioridad: 1,
    id_prioridad_sugerida: 1,
    id_sucursal: 1,
    id_sector: 1,
    id_usuario_creador: 1,
    id_tecnico_responsable: 9,
    tecnico_responsable: 'Luis Gómez',
    fecha_creacion: '2026-10-01T10:00:00',
    fecha_actualizacion: '2026-10-01T10:00:00',
    fecha_cierre: null,
  }),
  getComentarios: vi.fn().mockResolvedValue([
    {
      id: 1,
      id_autor: 1,
      autor_nombre: 'Ana',
      autor_apellido: 'Pérez',
      contenido: 'Sigue sin andar',
      fecha_creacion: '2026-10-01T11:00:00',
      eliminado: false,
    },
    {
      id: 2,
      id_autor: 9,
      autor_nombre: 'Luis',
      autor_apellido: 'Gómez',
      contenido: 'Reinicié el spooler',
      fecha_creacion: '2026-10-01T12:00:00',
      eliminado: false,
    },
  ]),
  crearComentario: vi.fn(),
  eliminarComentario: vi.fn(),
}));
vi.mock('../services/estados.service', () => ({
  getEstados: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Abierto' },
    { id: 3, nombre: 'En proceso' },
  ]),
}));
vi.mock('../services/prioridades.service', () => ({
  getPrioridades: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Alta' },
    { id: 2, nombre: 'Baja' },
  ]),
}));
vi.mock('../services/tiposTicket.service', () => ({
  getTiposTicket: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Hardware' },
    { id: 2, nombre: 'Software' },
  ]),
}));
vi.mock('../services/sucursales.service', () => ({ getSucursales: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Casa Central' }]) }));
vi.mock('../services/sectores.service', () => ({ getSectores: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Sistemas' }]) }));
vi.mock('../services/usuarios.service', () => ({
  getUsuarios: vi.fn().mockResolvedValue([
    { id: 1, id_rol: 1, nombre: 'Ana', apellido: 'Pérez' },
    { id: 9, id_rol: 2, nombre: 'Luis', apellido: 'Gómez' },
    { id: 12, id_rol: 3, nombre: 'Marta', apellido: 'Díaz' },
  ]),
}));
vi.mock('../services/adjuntos.service', () => ({
  getAdjuntosDeTicket: vi.fn().mockResolvedValue([]),
  getAdjuntosDeComentario: vi.fn().mockResolvedValue([]),
  subirAdjuntoDeComentario: vi.fn(),
}));
vi.mock('../services/historial.service', () => ({
  getHistorial: vi.fn().mockResolvedValue([{ id: 1, detalle: 'Ticket creado', fecha: '2026-10-01T10:00:00' }]),
}));

function abrir() {
  render(
    <MemoryRouter initialEntries={['/tickets/5']}>
      <Routes>
        <Route path="/tickets/:id" element={<DetalleTicket />} />
      </Routes>
    </MemoryRouter>
  );
}

import { cambiarEstado, cambiarTipo, asignarResponsable, getTicketById } from '../services/tickets.service';

describe('DetalleTicket', () => {
  beforeEach(() => {
    sesion.usuario = USUARIO_COMUN;
    vi.clearAllMocks();
  });

  it('un usuario común ve estado, tipo, prioridad y responsable como texto', async () => {
    abrir();

    expect(await screen.findByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('Responsable')).toBeInTheDocument();
    expect(screen.getAllByText('Luis Gómez').length).toBeGreaterThan(0);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('un técnico puede cambiar estado, tipo, prioridad y responsable, y el ticket se recarga', async () => {
    sesion.usuario = TECNICO;
    abrir();

    const tipo = await screen.findByRole('combobox', { name: 'Tipo' });
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveValue('1');
    expect(screen.getByRole('combobox', { name: 'Prioridad' })).toHaveValue('1');
    const responsable = screen.getByRole('combobox', { name: 'Responsable' });
    expect(responsable).toHaveValue('9');
    // Solo técnicos y administradores pueden ser responsables
    expect(screen.queryByRole('option', { name: 'Ana Pérez' })).not.toBeInTheDocument();

    const cargasAntes = getTicketById.mock.calls.length;
    await userEvent.selectOptions(tipo, 'Software');
    expect(cambiarTipo).toHaveBeenCalledWith('5', 2);
    expect(getTicketById.mock.calls.length).toBeGreaterThan(cargasAntes);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Estado' }), 'En proceso');
    expect(cambiarEstado).toHaveBeenCalledWith('5', 3);

    await userEvent.selectOptions(responsable, 'Marta Díaz');
    expect(asignarResponsable).toHaveBeenCalledWith('5', 12);
  });

  it('muestra "Sin asignar" si el ticket no tiene responsable', async () => {
    getTicketById.mockResolvedValueOnce({
      ...(await getTicketById()),
      id_tecnico_responsable: null,
      tecnico_responsable: null,
    });
    abrir();

    expect(await screen.findByText('Sin asignar')).toBeInTheDocument();
  });

  it('muestra los datos del ticket y su descripción', async () => {
    abrir();

    expect(await screen.findByText(/TK-000005 — No imprime/)).toBeInTheDocument();
    expect(screen.getByText('La impresora no responde')).toBeInTheDocument();
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
  });

  it('muestra quién cargó cada comentario', async () => {
    abrir();

    expect(await screen.findByText('Reinicié el spooler')).toBeInTheDocument();
    expect(screen.getAllByText('Luis Gómez')).toHaveLength(2); // autor del comentario y responsable
    expect(screen.getByText('Sigue sin andar')).toBeInTheDocument();
    expect(screen.getByText('Reinicié el spooler')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Comentarios (2)' })).toBeInTheDocument();
  });

  it('el historial está en otra pestaña del panel de actividad', async () => {
    abrir();
    await screen.findByText('Reinicié el spooler');
    expect(screen.queryByText('Ticket creado')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Historial' }));

    expect(screen.getByText('Ticket creado')).toBeInTheDocument();
    expect(screen.queryByText('Reinicié el spooler')).not.toBeInTheDocument();
  });
});

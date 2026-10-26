import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DetalleTicket from './DetalleTicket';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ usuario: { id: 1, id_rol: 1, nombre: 'Ana', apellido: 'Pérez' } }),
}));
vi.mock('../services/tickets.service', () => ({
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
vi.mock('../services/estados.service', () => ({ getEstados: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Abierto' }]) }));
vi.mock('../services/prioridades.service', () => ({ getPrioridades: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Alta' }]) }));
vi.mock('../services/tiposTicket.service', () => ({ getTiposTicket: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Hardware' }]) }));
vi.mock('../services/sucursales.service', () => ({ getSucursales: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Casa Central' }]) }));
vi.mock('../services/sectores.service', () => ({ getSectores: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Sistemas' }]) }));
vi.mock('../services/usuarios.service', () => ({ getUsuarios: vi.fn().mockResolvedValue([]) }));
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

describe('DetalleTicket', () => {
  it('muestra los datos del ticket y su descripción', async () => {
    abrir();

    expect(await screen.findByText(/TK-000005 — No imprime/)).toBeInTheDocument();
    expect(screen.getByText('La impresora no responde')).toBeInTheDocument();
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
  });

  it('muestra quién cargó cada comentario', async () => {
    abrir();

    expect(await screen.findByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.getByText('Sigue sin andar')).toBeInTheDocument();
    expect(screen.getByText('Reinicié el spooler')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Comentarios (2)' })).toBeInTheDocument();
  });

  it('el historial está en otra pestaña del panel de actividad', async () => {
    abrir();
    await screen.findByText('Luis Gómez');
    expect(screen.queryByText('Ticket creado')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Historial' }));

    expect(screen.getByText('Ticket creado')).toBeInTheDocument();
    expect(screen.queryByText('Reinicié el spooler')).not.toBeInTheDocument();
  });
});

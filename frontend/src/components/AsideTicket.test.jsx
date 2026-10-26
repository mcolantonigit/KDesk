import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AsideTicket from './AsideTicket';

vi.mock('../hooks/useTicketDetalle', () => ({
  useTicketDetalle: vi.fn(),
}));

import { useTicketDetalle } from '../hooks/useTicketDetalle';

const detalle = {
  usuario: { id: 1, id_rol: 1 },
  esTecnico: false,
  cargando: false,
  error: '',
  ticket: {
    id: 192,
    numero: 'TK-000192',
    titulo: 'No imprime',
    descripcion: 'La impresora no responde',
    fecha_creacion: '2026-10-01T10:00:00',
    fecha_actualizacion: '2026-10-02T10:00:00',
  },
  comentarios: [
    {
      id: 1,
      id_autor: 9,
      autor_nombre: 'Luis',
      autor_apellido: 'Gómez',
      contenido: 'Reinicié el spooler',
      fecha_creacion: '2026-10-01T12:00:00',
      eliminado: false,
    },
  ],
  adjuntosTicket: [{ id: 3, nombre_archivo: 'captura.png' }],
  historial: [],
  nombres: {
    estado: 'Abierto',
    tipo: 'Hardware',
    prioridad: 'Alta',
    sucursal: 'Casa Central',
    sector: 'Sistemas',
    creador: 'Ana Pérez',
  },
  yaCerrado: false,
  agregarComentario: vi.fn(),
  quitarComentario: vi.fn(),
};

function abrir(onClose = () => {}) {
  render(
    <MemoryRouter>
      <AsideTicket idTicket={192} onClose={onClose} />
    </MemoryRouter>
  );
}

describe('AsideTicket', () => {
  it('muestra una versión acotada del ticket', () => {
    useTicketDetalle.mockReturnValue(detalle);
    abrir();

    expect(screen.getByText('TK-000192 — No imprime')).toBeInTheDocument();
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
    expect(screen.getByText('La impresora no responde')).toBeInTheDocument();
    expect(screen.getByText('captura.png')).toBeInTheDocument();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
  });

  it('no muestra pestañas ni historial, solo los comentarios', () => {
    useTicketDetalle.mockReturnValue(detalle);
    abrir();

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByText('Historial')).not.toBeInTheDocument();
    expect(screen.getByText('Reinicié el spooler')).toBeInTheDocument();
  });

  it('tiene un link al detalle completo', () => {
    useTicketDetalle.mockReturnValue(detalle);
    abrir();

    expect(screen.getByRole('link', { name: /Ver detalle completo/ })).toHaveAttribute('href', '/tickets/192');
  });

  it('se cierra con la X y con Escape', async () => {
    useTicketDetalle.mockReturnValue(detalle);
    const onClose = vi.fn();
    abrir(onClose);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('avisa mientras carga y si hubo un error', () => {
    useTicketDetalle.mockReturnValue({ ...detalle, ticket: null, cargando: true });
    abrir();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('muestra el error si no se pudo cargar', () => {
    useTicketDetalle.mockReturnValue({ ...detalle, ticket: null, error: 'No tiene acceso a este ticket' });
    abrir();
    expect(screen.getByText('No tiene acceso a este ticket')).toBeInTheDocument();
  });
});

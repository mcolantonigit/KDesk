import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Novedades from './Novedades';

const abrirTicket = vi.fn();
vi.mock('../context/AsideTicketContext', () => ({ useAsideTicket: () => ({ abrirTicket }) }));
vi.mock('../context/NuevoTicketContext', () => ({ useNuevoTicket: () => ({ abrir: vi.fn() }) }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ usuario: { id: 10, nombre: 'Luis' } }) }));
vi.mock('../services/tickets.service', () => ({ getTickets: vi.fn(), asignarResponsable: vi.fn() }));
vi.mock('../services/estados.service', () => ({
  getEstados: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Asignado' },
    { id: 6, nombre: 'Cerrado' },
  ]),
}));
vi.mock('../services/prioridades.service', () => ({
  getPrioridades: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Baja' },
    { id: 3, nombre: 'Alta' },
  ]),
}));

import { getTickets, asignarResponsable } from '../services/tickets.service';

const hace = (dias) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
const ticket = (id, titulo, extra = {}) => ({
  id,
  numero: `TK-${id}`,
  titulo,
  id_estado: 1,
  id_prioridad: null,
  id_prioridad_sugerida: 1,
  id_tecnico_responsable: null,
  fecha_creacion: hace(1),
  fecha_actualizacion: hace(1),
  ...extra,
});

const datos = [
  ticket(1, 'Mío abierto', { id_estado: 2, id_tecnico_responsable: 10 }),
  ticket(2, 'Libre y urgente', { id_prioridad_sugerida: 3 }),
  ticket(3, 'Olvidado hace rato', { id_tecnico_responsable: 99, id_estado: 2, fecha_actualizacion: hace(7) }),
  ticket(4, 'Ya cerrado', { id_estado: 6 }),
];

function abrir() {
  render(
    <MemoryRouter>
      <Novedades />
    </MemoryRouter>
  );
}

const lista = (titulo) => within(screen.getByRole('heading', { name: titulo }).closest('section'));
const indicador = (etiqueta) => within(document.querySelector('.novedades-kpis')).getByText(etiqueta).previousSibling;

describe('Novedades', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTickets.mockResolvedValue(datos);
  });

  it('saluda al técnico y muestra los indicadores', async () => {
    abrir();

    expect(await screen.findByText(/Luis!/)).toBeInTheDocument();
    expect(indicador('Sin asignar')).toHaveTextContent('1');
    expect(indicador('Asignados a vos')).toHaveTextContent('1');
    expect(indicador('Abiertos en total')).toHaveTextContent('3');
  });

  it('arma las tres listas', async () => {
    abrir();
    await screen.findByText(/Luis!/);

    expect(lista('Mi cola').getByText('Mío abierto')).toBeInTheDocument();
    expect(lista('Sin asignar').getByText('Libre y urgente')).toBeInTheDocument();
    const atencion = lista('Requieren atención');
    expect(atencion.getByText('Libre y urgente')).toBeInTheDocument();
    expect(atencion.getByText('Olvidado hace rato')).toBeInTheDocument();
    expect(atencion.getByText('Sin movimiento 7 d')).toBeInTheDocument();
    expect(screen.queryByText('Ya cerrado')).not.toBeInTheDocument();
  });

  it('al hacer clic en un ticket abre el panel lateral', async () => {
    abrir();
    await screen.findByText(/Luis!/);

    await userEvent.click(lista('Mi cola').getByText('Mío abierto'));

    expect(abrirTicket).toHaveBeenCalledWith(1);
  });

  it('Tomar asigna el ticket al técnico y recarga las listas', async () => {
    asignarResponsable.mockResolvedValue({});
    abrir();
    await screen.findByText(/Luis!/);
    getTickets.mockResolvedValue([ticket(2, 'Libre y urgente', { id_prioridad_sugerida: 3, id_tecnico_responsable: 10, id_estado: 2 })]);

    await userEvent.click(screen.getByRole('button', { name: 'Tomar TK-2' }));

    expect(asignarResponsable).toHaveBeenCalledWith(2, 10);
    await waitFor(() => expect(lista('Mi cola').getByText('Libre y urgente')).toBeInTheDocument());
    expect(lista('Sin asignar').getByText('Nada sin asignar 🎉')).toBeInTheDocument();
  });

  it('si no se puede tomar el ticket muestra el error', async () => {
    asignarResponsable.mockRejectedValue(new Error('Otro técnico ya lo tomó'));
    abrir();
    await screen.findByText(/Luis!/);

    await userEvent.click(screen.getByRole('button', { name: 'Tomar TK-2' }));

    expect(await screen.findByText('Otro técnico ya lo tomó')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Novedades from './Novedades';

const abrirTicket = vi.fn();
const marcarVistas = vi.fn();
let notificaciones = { eventos: [], ultimoVisto: 0, marcarVistas };

vi.mock('../context/AsideTicketContext', () => ({ useAsideTicket: () => ({ abrirTicket }) }));
vi.mock('../context/NuevoTicketContext', () => ({ useNuevoTicket: () => ({ abrir: vi.fn() }) }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ usuario: { id: 10, nombre: 'Luis' } }) }));
vi.mock('../context/NotificacionesContext', () => ({ useNotificaciones: () => notificaciones }));
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

const evento = (id, tipo, mensaje, idTicket) => ({ id, tipo, mensaje, idTicket, titulo: mensaje, fecha: new Date().toISOString() });

function abrir() {
  return render(
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
    notificaciones = { eventos: [], ultimoVisto: 0, marcarVistas };
  });

  it('saluda al técnico y muestra los indicadores', async () => {
    abrir();

    expect(await screen.findByText(/Luis!/)).toBeInTheDocument();
    expect(indicador('Sin asignar')).toHaveTextContent('1');
    expect(indicador('Asignados a vos')).toHaveTextContent('1');
    expect(indicador('Abiertos en total')).toHaveTextContent('3');
  });

  it('arma las listas: mi cola, sin asignar y notificaciones (con las alertas actuales)', async () => {
    abrir();
    await screen.findByText(/Luis!/);

    expect(lista('Mi cola').getByText('Mío abierto')).toBeInTheDocument();
    expect(lista('Sin asignar').getByText('Libre y urgente')).toBeInTheDocument();
    const notifs = lista('Notificaciones');
    expect(notifs.getByText('Libre y urgente')).toBeInTheDocument();
    expect(notifs.getByText('Olvidado hace rato')).toBeInTheDocument();
    expect(notifs.getByText('Sin movimiento 7 d')).toBeInTheDocument();
    expect(screen.queryByText('Ya cerrado')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Requieren atención' })).not.toBeInTheDocument();
  });

  it('en Notificaciones los eventos van primero, con los no vistos marcados', async () => {
    notificaciones = {
      eventos: [
        evento(12, 'comentario', 'Ana Pérez comentó en el ticket TK-5: No imprime', 5),
        evento(11, 'asignado', 'Ana Pérez te asignó el ticket TK-6: Mouse', 6),
        evento(3, 'estado', 'Ana Pérez cerró el ticket TK-7: Viejo', 7),
      ],
      ultimoVisto: 10,
      marcarVistas,
    };
    abrir();
    await screen.findByText(/Luis!/);

    const notifs = lista('Notificaciones');
    expect(notifs.getByText('2 nuevas')).toBeInTheDocument();
    const filas = notifs.getAllByText(/Ana Pérez/).map((el) => el.closest('button'));
    expect(filas.map((fila) => fila.classList.contains('nueva'))).toEqual([true, true, false]);
    expect(notifs.getByText('Últimos eventos')).toBeInTheDocument();
  });

  it('al hacer clic en un evento abre el ticket en el panel lateral', async () => {
    notificaciones = { eventos: [evento(12, 'comentario', 'Ana comentó en TK-5', 5)], ultimoVisto: 0, marcarVistas };
    abrir();
    await screen.findByText(/Luis!/);

    await userEvent.click(lista('Notificaciones').getByText('Ana comentó en TK-5'));

    expect(abrirTicket).toHaveBeenCalledWith(5);
  });

  it('se pueden marcar como vistas, y al salir de Novedades se marcan solas', async () => {
    notificaciones = { eventos: [evento(12, 'comentario', 'Ana comentó en TK-5', 5)], ultimoVisto: 0, marcarVistas };
    const { unmount } = abrir();
    await screen.findByText(/Luis!/);

    await userEvent.click(screen.getByRole('button', { name: 'Marcar como vistas' }));
    expect(marcarVistas).toHaveBeenCalledTimes(1);

    unmount();
    expect(marcarVistas).toHaveBeenCalledTimes(2);
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

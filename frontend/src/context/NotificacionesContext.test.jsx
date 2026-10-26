import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { NotificacionesProvider, useNotificaciones } from './NotificacionesContext';

const abrirTicket = vi.fn();
vi.mock('./AuthContext', () => ({ useAuth: () => ({ usuario: { id: 7 } }) }));
vi.mock('./AsideTicketContext', () => ({ useAsideTicket: () => ({ abrirTicket }) }));
vi.mock('../services/notificaciones.service', () => ({ getNotificaciones: vi.fn() }));
vi.mock('../utils/sonido', () => ({
  instalarDesbloqueoDeAudio: vi.fn(() => () => {}),
  reproducirSonidoNotificacion: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../utils/voz', () => ({ hablar: vi.fn().mockResolvedValue(undefined) }));

import { getNotificaciones } from '../services/notificaciones.service';
import { reproducirSonidoNotificacion } from '../utils/sonido';
import { hablar } from '../utils/voz';

const evento = (id, tipo = 'comentario', extra = {}) => ({
  id,
  tipo,
  idTicket: id * 10,
  titulo: `Aviso ${id}`,
  mensaje: `Mensaje ${id}`,
  mensajeVoz: `Voz ${id}`,
  ...extra,
});

function Lista() {
  const { eventos, noVistas } = useNotificaciones();
  return (
    <p data-testid="resumen">
      {eventos.length} en la lista, {noVistas} sin ver
    </p>
  );
}

async function montar() {
  render(
    <NotificacionesProvider>
      <Lista />
    </NotificacionesProvider>
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

const avanzar = (ms) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe('NotificacionesProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('la primera vez que se usa en el navegador arma la lista pero no avisa de lo viejo', async () => {
    getNotificaciones.mockResolvedValue({ eventos: [evento(5), evento(4)], ultimoId: 5 });

    await montar();

    expect(screen.getByTestId('resumen')).toHaveTextContent('2 en la lista, 0 sin ver');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(reproducirSonidoNotificacion).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('kdesk:notificaciones:cursor:7')).toBe('5');
  });

  it('al volver avisa de lo ocurrido desde la última vez, solo de lo más reciente', async () => {
    window.localStorage.setItem('kdesk:notificaciones:cursor:7', '100');
    getNotificaciones.mockResolvedValue({
      eventos: [evento(104), evento(103), evento(102), evento(101), evento(99)],
      ultimoId: 104,
    });

    await montar();

    const popups = screen.getAllByRole('status');
    expect(popups.map((p) => p.querySelector('strong').textContent)).toEqual(['Aviso 102', 'Aviso 103', 'Aviso 104']);
    expect(hablar).toHaveBeenCalledTimes(3);
    expect(hablar).toHaveBeenNthCalledWith(1, 'Voz 102', { nombreVoz: '', volumen: 0.7 });
  });

  it('consulta cada 20 segundos desde el último evento y avisa de lo nuevo con popup, sonido y voz', async () => {
    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(5)], ultimoId: 5 });
    await montar();
    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(6, 'asignado')], ultimoId: 6 });

    await avanzar(20000);

    expect(getNotificaciones).toHaveBeenLastCalledWith({ despuesDe: 5, limite: 50 });
    expect(screen.getByText('Aviso 6')).toBeInTheDocument();
    expect(screen.getByTestId('resumen')).toHaveTextContent('2 en la lista');
    expect(reproducirSonidoNotificacion).toHaveBeenCalledWith(0.7);
    expect(hablar).toHaveBeenCalledWith('Voz 6', { nombreVoz: '', volumen: 0.7 });
  });

  it('tras restaurar un backup anterior (ids más bajos) lo nuevo vuelve a contar como no visto', async () => {
    window.localStorage.setItem('kdesk:notificaciones:cursor:7', '100');
    window.localStorage.setItem('kdesk:notificaciones:visto:7', '100');
    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(20)], ultimoId: 20 });
    await montar();

    expect(screen.getByTestId('resumen')).toHaveTextContent('1 en la lista, 0 sin ver');
    expect(window.localStorage.getItem('kdesk:notificaciones:visto:7')).toBe('20');

    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(21)], ultimoId: 21 });
    await avanzar(20000);

    expect(getNotificaciones).toHaveBeenLastCalledWith({ despuesDe: 20, limite: 50 });
    expect(screen.getByTestId('resumen')).toHaveTextContent('2 en la lista, 1 sin ver');
  });

  it('respeta las preferencias de cada tipo', async () => {
    window.localStorage.setItem(
      'kdesk:alertas:preferencias',
      JSON.stringify({ tipos: { comentario: { popup: false, sonido: true, voz: false } } })
    );
    getNotificaciones.mockResolvedValueOnce({ eventos: [], ultimoId: 5 });
    await montar();
    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(6, 'comentario')], ultimoId: 6 });

    await avanzar(20000);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(reproducirSonidoNotificacion).toHaveBeenCalled();
    expect(hablar).not.toHaveBeenCalled();
  });

  it('con las alertas apagadas no hace popup, sonido ni voz, pero la lista sigue al día', async () => {
    window.localStorage.setItem('kdesk:alertas:preferencias', JSON.stringify({ activas: false }));
    getNotificaciones.mockResolvedValueOnce({ eventos: [], ultimoId: 5 });
    await montar();
    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(6)], ultimoId: 6 });

    await avanzar(20000);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(reproducirSonidoNotificacion).not.toHaveBeenCalled();
    expect(hablar).not.toHaveBeenCalled();
    expect(screen.getByTestId('resumen')).toHaveTextContent('1 en la lista');
  });

  it('al hacer clic en un popup abre el ticket y lo cierra', async () => {
    getNotificaciones.mockResolvedValueOnce({ eventos: [], ultimoId: 5 });
    await montar();
    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(6)], ultimoId: 6 });
    await avanzar(20000);

    fireEvent.click(screen.getByText('Mensaje 6'));

    expect(abrirTicket).toHaveBeenCalledWith(60);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('el popup se cierra solo a los 10 segundos, salvo que el mouse esté encima', async () => {
    getNotificaciones.mockResolvedValueOnce({ eventos: [], ultimoId: 5 });
    await montar();
    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(6)], ultimoId: 6 });
    getNotificaciones.mockResolvedValue({ eventos: [], ultimoId: 6 });
    await avanzar(20000);

    fireEvent.mouseEnter(screen.getByRole('status'));
    await avanzar(12000);
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole('status'));
    await avanzar(10000);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('muestra como máximo 4 popups a la vez', async () => {
    getNotificaciones.mockResolvedValueOnce({ eventos: [], ultimoId: 5 });
    await montar();
    getNotificaciones.mockResolvedValueOnce({
      eventos: [evento(11), evento(10), evento(9), evento(8), evento(7), evento(6)],
      ultimoId: 11,
    });

    await avanzar(20000);

    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.getByText('Aviso 11')).toBeInTheDocument();
    expect(screen.queryByText('Aviso 6')).not.toBeInTheDocument();
  });

  it('si falla la consulta no se rompe y reintenta en la próxima vuelta', async () => {
    getNotificaciones.mockResolvedValueOnce({ eventos: [], ultimoId: 5 });
    await montar();
    getNotificaciones.mockRejectedValueOnce(new Error('sin conexión'));
    await avanzar(20000);

    getNotificaciones.mockResolvedValueOnce({ eventos: [evento(6)], ultimoId: 6 });
    await avanzar(20000);

    expect(getNotificaciones).toHaveBeenLastCalledWith({ despuesDe: 5, limite: 50 });
    expect(screen.getByText('Aviso 6')).toBeInTheDocument();
  });
});

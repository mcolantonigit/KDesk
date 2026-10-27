import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import SinConexion from './SinConexion';
import { apiFetch } from '../utils/api';

const recargarPerfil = vi.fn();
let cargando = false;
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ cargando, recargarPerfil }) }));

const ok = () => new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });

async function cortarConexion() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  await act(async () => {
    await apiFetch('/api/tickets').catch(() => {});
  });
}

async function tocarReintentar() {
  await act(async () => {
    screen.getByRole('button', { name: 'Reintentar ahora' }).click();
  });
}

describe('SinConexion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cargando = false;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('no se ve mientras hay conexión', () => {
    render(<SinConexion />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('aparece cuando un pedido no llega al servidor y se va cuando otro sí llega', async () => {
    render(<SinConexion />);

    await cortarConexion();
    expect(screen.getByRole('alertdialog', { name: 'Sin conexión con el servidor' })).toBeInTheDocument();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok()));
    await act(async () => {
      await apiFetch('/api/notificaciones');
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('reintenta solo cada 10 segundos, y "Reintentar ahora" prueba en el momento', async () => {
    vi.useFakeTimers();
    render(<SinConexion />);
    await cortarConexion();
    expect(screen.getByText(/en 10 segundos/)).toBeInTheDocument();

    for (let i = 0; i < 10; i += 1) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok()));
    await tocarReintentar();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('si se cortó antes de cargar la sesión, la carga cuando vuelve', async () => {
    cargando = true;
    render(<SinConexion />);
    await cortarConexion();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok()));
    await tocarReintentar();

    expect(recargarPerfil).toHaveBeenCalled();
  });
});

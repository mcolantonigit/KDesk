import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import { guardarVolverA } from '../utils/volverA';

let auth;
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

function abrir(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route element={<RutaProtegida />}>
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/tickets/:id" element={<p>Detalle del ticket</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('RutaProtegida', () => {
  beforeEach(() => {
    sessionStorage.clear();
    auth = { usuario: null, cargando: false, sinSesion: 'requerida' };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('entrar a la raíz sin sesión lleva directo al login, sin aviso', () => {
    abrir('/');

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('abrir otra pantalla sin sesión avisa y a los 5 segundos lleva al login', () => {
    vi.useFakeTimers();
    abrir('/tickets/12');

    expect(screen.getByRole('heading', { name: 'Tenés que iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByText(/en 5 segundos/)).toBeInTheDocument();
    expect(sessionStorage.getItem('kdesk.volverA')).toBe('/tickets/12');

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText(/en 4 segundos/)).toBeInTheDocument();

    for (let i = 0; i < 4; i += 1) act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('cuando la sesión vence avisa con otro texto, y el botón lleva al login en el momento', async () => {
    auth = { usuario: null, cargando: false, sinSesion: 'vencida' };
    abrir('/');

    expect(screen.getByRole('heading', { name: 'Tu sesión venció' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión ahora' }));

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('después de iniciar sesión vuelve a la pantalla que se quería abrir', async () => {
    guardarVolverA('/tickets/12');
    auth = { usuario: { id: 1 }, cargando: false, sinSesion: null };

    abrir('/');

    expect(await screen.findByText('Detalle del ticket')).toBeInTheDocument();
    expect(sessionStorage.getItem('kdesk.volverA')).toBeNull();
  });

  it('mientras se carga la sesión no muestra nada', () => {
    auth = { usuario: null, cargando: true, sinSesion: null };
    const { container } = abrir('/tickets/12');

    expect(container).toBeEmptyDOMElement();
  });
});

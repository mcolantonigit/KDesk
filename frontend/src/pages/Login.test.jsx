import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ setUsuario: vi.fn() }) }));
vi.mock('../services/usuarios.service', () => ({ login: vi.fn() }));
vi.mock('../services/auth.service', () => ({
  getConfigLogin: vi.fn(),
  urlLoginMicrosoft: () => 'https://api.kdesk.ar/api/auth/microsoft/login?volver=x',
}));

import { getConfigLogin } from '../services/auth.service';

function abrir(ruta = '/login') {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Login />
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('desde internet: solo el botón de Microsoft, sin contraseña, registro ni recuperación', async () => {
    getConfigLogin.mockResolvedValue({ password: false, microsoft: true });
    abrir();

    expect(await screen.findByRole('button', { name: /Entrar con Microsoft/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
    expect(screen.queryByText('Registrarse')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Olvidaste tu contraseña?')).not.toBeInTheDocument();
  });

  it('el botón lleva al login de Microsoft del backend', async () => {
    getConfigLogin.mockResolvedValue({ password: false, microsoft: true });
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    abrir();

    await userEvent.click(await screen.findByRole('button', { name: /Entrar con Microsoft/ }));

    expect(assign).toHaveBeenCalledWith('https://api.kdesk.ar/api/auth/microsoft/login?volver=x');
    vi.unstubAllGlobals();
  });

  it('en la red local: Microsoft y además el formulario de siempre', async () => {
    getConfigLogin.mockResolvedValue({ password: true, microsoft: true });
    abrir();

    expect(await screen.findByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar con Microsoft/ })).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('sin Microsoft configurado queda como siempre', async () => {
    getConfigLogin.mockResolvedValue({ password: true, microsoft: false });
    abrir();

    expect(await screen.findByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Entrar con Microsoft/ })).not.toBeInTheDocument();
  });

  it('muestra por qué no se pudo entrar con Microsoft', async () => {
    getConfigLogin.mockResolvedValue({ password: false, microsoft: true });
    abrir('/login?error=organizacion');

    expect(await screen.findByText('Solo se puede entrar con una cuenta de Microsoft 365 de Kalop')).toBeInTheDocument();
  });
});

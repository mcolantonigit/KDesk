import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alertas from './Alertas';

let usuarioActual = { id: 7, id_rol: 2 };
const probar = vi.fn();
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ usuario: usuarioActual }) }));
vi.mock('../context/NotificacionesContext', () => ({ useNotificaciones: () => ({ probar }) }));
vi.mock('../utils/voz', () => ({
  vocesDisponibles: vi.fn(),
  hablar: vi.fn().mockResolvedValue(undefined),
  cancelarLectura: vi.fn(),
}));

import { vocesDisponibles, hablar } from '../utils/voz';

const voces = [
  { name: 'Microsoft Helena - Spanish (Spain)', lang: 'es-ES', localService: true },
  { name: 'Microsoft Gonzalo Online (Natural) - Spanish (Colombia)', lang: 'es-CO', localService: false },
  { name: 'Microsoft David - English (United States)', lang: 'en-US', localService: true },
];

const guardadas = () => JSON.parse(window.localStorage.getItem('kdesk:alertas:preferencias') ?? '{}');

async function abrir() {
  render(<Alertas />);
  await screen.findByRole('option', { name: /en línea/ });
}

describe('Alertas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    usuarioActual = { id: 7, id_rol: 2 };
    vocesDisponibles.mockResolvedValue(voces);
  });

  it('muestra las alertas activadas por defecto, con todas las opciones de cada tipo', async () => {
    await abrir();

    expect(screen.getByRole('checkbox', { name: 'Activar las alertas' })).toBeChecked();
    for (const opcion of ['popup', 'sonido', 'voz']) {
      expect(screen.getByRole('checkbox', { name: `${opcion} para Comentario nuevo` })).toBeChecked();
    }
  });

  it('cambiar una opción de un tipo se guarda', async () => {
    await abrir();

    await userEvent.click(screen.getByRole('checkbox', { name: 'voz para Comentario nuevo' }));

    expect(screen.getByRole('checkbox', { name: 'voz para Comentario nuevo' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'popup para Comentario nuevo' })).toBeChecked();
    expect(guardadas().tipos.comentario.voz).toBe(false);
  });

  it('apagar las alertas deshabilita las opciones de los tipos', async () => {
    await abrir();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Activar las alertas' }));

    expect(screen.getByRole('checkbox', { name: 'popup para Asignado a mí' })).toBeDisabled();
    expect(guardadas().activas).toBe(false);
  });

  it('un usuario común no ve "Ticket nuevo", que es solo para técnicos', async () => {
    usuarioActual = { id: 9, id_rol: 1 };
    await abrir();

    expect(screen.queryByText('Ticket nuevo')).not.toBeInTheDocument();
    expect(screen.getByText('Comentario nuevo')).toBeInTheDocument();
  });

  it('el volumen se guarda', async () => {
    await abrir();

    const control = screen.getByRole('slider', { name: 'Volumen' });
    expect(control).toHaveValue('70');
    // user-event no maneja bien los range: se usa el evento de cambio directo
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(control, { target: { value: '30' } });

    expect(guardadas().volumen).toBe(0.3);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('el selector de voz ofrece la recomendada primero y solo voces en español, marcando las "en línea"', async () => {
    await abrir();

    const opciones = within(screen.getByRole('combobox')).getAllByRole('option').map((o) => o.textContent);
    expect(opciones[0]).toMatch(/^Recomendada para .* — Microsoft Gonzalo Online/);
    expect(opciones.slice(1)).toEqual([
      'Microsoft Gonzalo Online (Natural) - Spanish (Colombia) (en línea)',
      'Microsoft Helena - Spanish (Spain)',
    ]);
  });

  it('elegir una voz y escuchar la prueba lee la frase con esa voz y el volumen configurado', async () => {
    await abrir();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Microsoft Helena - Spanish (Spain)');
    await userEvent.click(screen.getByRole('button', { name: 'Escuchar prueba' }));

    expect(guardadas().voz).toBe('Microsoft Helena - Spanish (Spain)');
    expect(hablar).toHaveBeenCalledWith('Así suena la voz de las alertas de KDesk.', {
      nombreVoz: 'Microsoft Helena - Spanish (Spain)',
      volumen: 0.7,
    });
  });

  it('avisa si la voz guardada ya no existe en este navegador', async () => {
    window.localStorage.setItem('kdesk:alertas:preferencias', JSON.stringify({ voz: 'Voz Que Ya No Está' }));
    await abrir();

    expect(screen.getByText(/no está disponible en este navegador/)).toBeInTheDocument();
  });

  it('avisa si el navegador no tiene voces en español', async () => {
    vocesDisponibles.mockResolvedValue([voces[2]]);
    render(<Alertas />);

    expect(await screen.findByText(/No se encontraron voces en español/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('"Probar notificación" lanza una notificación de prueba', async () => {
    await abrir();

    await userEvent.click(screen.getByRole('button', { name: 'Probar notificación' }));

    expect(probar).toHaveBeenCalled();
  });

  it('"Restablecer valores" vuelve a la configuración original', async () => {
    await abrir();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Activar las alertas' }));

    await userEvent.click(screen.getByRole('button', { name: 'Restablecer valores' }));

    expect(screen.getByRole('checkbox', { name: 'Activar las alertas' })).toBeChecked();
    expect(guardadas()).toEqual({});
  });
});

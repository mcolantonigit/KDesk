import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ChatKadi from './ChatKadi';
import { enviarMensajeAKadi } from '../services/kadi.service';
import { crearTicket } from '../services/tickets.service';

const navigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));
vi.mock('../services/kadi.service', () => ({ enviarMensajeAKadi: vi.fn() }));
vi.mock('../services/tickets.service', () => ({ crearTicket: vi.fn() }));

const propuesta = {
  idTipo: 1,
  tipo: 'Hardware',
  idPrioridadSugerida: 2,
  prioridad: 'Alta',
  titulo: 'Impresora de planta no imprime',
  descripcion: 'No imprime desde ayer.',
};

function abrir({ onClose = () => {}, onUsarFormulario = () => {} } = {}) {
  render(
    <MemoryRouter>
      <ChatKadi onClose={onClose} onUsarFormulario={onUsarFormulario} />
    </MemoryRouter>
  );
}

async function escribir(texto) {
  await userEvent.type(screen.getByLabelText('Tu mensaje'), texto);
  await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
}

describe('ChatKadi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saluda, manda la charla completa y muestra la respuesta', async () => {
    enviarMensajeAKadi.mockResolvedValue({ mensaje: '¿Qué impresora es?', ticket: null });
    abrir();

    expect(screen.getByText(/Hola, soy Kadi/)).toBeInTheDocument();
    await escribir('No imprime');

    expect(await screen.findByText('¿Qué impresora es?')).toBeInTheDocument();
    expect(screen.getByText('No imprime')).toBeInTheDocument();
    expect(enviarMensajeAKadi).toHaveBeenCalledWith([
      expect.objectContaining({ rol: 'kadi' }),
      { rol: 'persona', texto: 'No imprime' },
    ]);
  });

  it('cuando Kadi propone el ticket, al confirmar lo crea y va a él', async () => {
    enviarMensajeAKadi.mockResolvedValue({ mensaje: 'Revisá y confirmá.', ticket: propuesta });
    crearTicket.mockResolvedValue({ id: 91 });
    const onClose = vi.fn();
    abrir({ onClose });

    await escribir('No imprime desde ayer');
    expect(await screen.findByText('Impresora de planta no imprime')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Crear ticket' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/tickets/91'));
    expect(crearTicket).toHaveBeenCalledWith({
      idTipo: 1,
      idPrioridadSugerida: 2,
      titulo: 'Impresora de planta no imprime',
      descripcion: 'No imprime desde ayer.',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('"Seguir charlando" descarta la propuesta sin crear nada', async () => {
    enviarMensajeAKadi.mockResolvedValue({ mensaje: 'Revisá y confirmá.', ticket: propuesta });
    abrir();

    await escribir('No imprime');
    await userEvent.click(await screen.findByRole('button', { name: 'Seguir charlando' }));

    expect(screen.queryByText('Impresora de planta no imprime')).not.toBeInTheDocument();
    expect(crearTicket).not.toHaveBeenCalled();
  });

  it('si Kadi falla avisa y deja el mensaje escrito para reintentar', async () => {
    enviarMensajeAKadi.mockRejectedValue(new Error('Kadi no pudo responder'));
    abrir();

    await escribir('No imprime');

    expect(await screen.findByText('Kadi no pudo responder')).toBeInTheDocument();
    expect(screen.getByLabelText('Tu mensaje')).toHaveValue('No imprime');
    expect(screen.queryByText('No imprime', { selector: 'p' })).not.toBeInTheDocument();
  });

  it('si falla al crear el ticket avisa y deja confirmar de nuevo', async () => {
    enviarMensajeAKadi.mockResolvedValue({ mensaje: 'Revisá y confirmá.', ticket: propuesta });
    crearTicket.mockRejectedValue(new Error('No se pudo crear el ticket'));
    abrir();

    await escribir('No imprime');
    await userEvent.click(await screen.findByRole('button', { name: 'Crear ticket' }));

    expect(await screen.findByText('No se pudo crear el ticket')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear ticket' })).toBeEnabled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('al llegar a 10 mensajes se cierra la charla y manda al formulario', async () => {
    enviarMensajeAKadi.mockResolvedValue({ mensaje: 'Seguimos', ticket: null });
    abrir();

    for (let i = 0; i < 10; i += 1) {
      await escribir(`mensaje ${i}`);
      await screen.findAllByText('Seguimos');
    }

    expect(await screen.findByText(/Llegamos al máximo/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Tu mensaje')).not.toBeInTheDocument();
  }, 20000);

  it('"Generar manual" avisa al modal', async () => {
    const onUsarFormulario = vi.fn();
    abrir({ onUsarFormulario });

    await userEvent.click(screen.getByRole('button', { name: 'Generar manual' }));

    expect(onUsarFormulario).toHaveBeenCalled();
  });
});

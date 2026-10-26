import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalCerrarTicket from './ModalCerrarTicket';

vi.mock('../services/tickets.service', () => ({
  cerrarTicket: vi.fn(),
  getComentarios: vi.fn(),
}));
vi.mock('../services/adjuntos.service', () => ({ subirAdjuntoDeComentario: vi.fn() }));

import { cerrarTicket, getComentarios } from '../services/tickets.service';
import { subirAdjuntoDeComentario } from '../services/adjuntos.service';

const ticket = { id: 192, numero: 'TK-000192' };

function abrir({ onClose = () => {}, onCerrado = () => {} } = {}) {
  render(<ModalCerrarTicket ticket={ticket} onClose={onClose} onCerrado={onCerrado} />);
}

describe('ModalCerrarTicket', () => {
  beforeEach(() => vi.clearAllMocks());

  it('se muestra como diálogo con el número del ticket', () => {
    abrir();
    expect(screen.getByRole('dialog', { name: 'Cerrar TK-000192' })).toBeInTheDocument();
  });

  it('el motivo de cierre es obligatorio', () => {
    abrir();
    expect(screen.getByLabelText('Motivo de cierre')).toBeRequired();
  });

  it('cierra el ticket con el motivo escrito y avisa', async () => {
    cerrarTicket.mockResolvedValue({});
    const onCerrado = vi.fn();
    abrir({ onCerrado });

    await userEvent.type(screen.getByLabelText('Motivo de cierre'), 'Se reinstaló el driver');
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cierre' }));

    await waitFor(() => expect(onCerrado).toHaveBeenCalled());
    expect(cerrarTicket).toHaveBeenCalledWith(192, 'Se reinstaló el driver');
    expect(subirAdjuntoDeComentario).not.toHaveBeenCalled();
  });

  it('sube el adjunto al comentario de cierre (el último del ticket)', async () => {
    cerrarTicket.mockResolvedValue({});
    getComentarios.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const archivo = new File(['x'], 'captura.png', { type: 'image/png' });
    abrir();

    await userEvent.type(screen.getByLabelText('Motivo de cierre'), 'Listo');
    await userEvent.upload(screen.getByLabelText('Adjunto (opcional)'), archivo);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cierre' }));

    await waitFor(() => expect(subirAdjuntoDeComentario).toHaveBeenCalledWith(2, archivo));
  });

  it('si falla muestra el error y deja el modal abierto', async () => {
    cerrarTicket.mockRejectedValue(new Error('No se pudo cerrar'));
    const onCerrado = vi.fn();
    abrir({ onCerrado });

    await userEvent.type(screen.getByLabelText('Motivo de cierre'), 'Listo');
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cierre' }));

    expect(await screen.findByText('No se pudo cerrar')).toBeInTheDocument();
    expect(onCerrado).not.toHaveBeenCalled();
  });

  it('Cancelar cierra el modal sin cerrar el ticket', async () => {
    const onClose = vi.fn();
    abrir({ onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(cerrarTicket).not.toHaveBeenCalled();
  });
});

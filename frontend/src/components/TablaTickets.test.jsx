import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TablaTickets from './TablaTickets';

const abrirTicket = vi.fn();
vi.mock('../context/AsideTicketContext', () => ({ useAsideTicket: () => ({ abrirTicket }) }));

const tickets = [
  { id: 1, numero: 'TK-000001', prioridad: 'Alta', titulo: 'No imprime', estado: 'Abierto', fecha_creacion: '2026-10-01T10:00:00' },
  { id: 2, numero: 'TK-000002', prioridad: 'Baja', titulo: 'Mouse roto', estado: 'Abierto', fecha_creacion: '2026-10-02T10:00:00' },
];

describe('TablaTickets', () => {
  it('al hacer clic en una fila abre el panel lateral de ese ticket', async () => {
    render(<TablaTickets tickets={tickets} />);

    await userEvent.click(screen.getByText('Mouse roto'));

    expect(abrirTicket).toHaveBeenCalledWith(2);
  });

  it('avisa si no hay tickets', () => {
    render(<TablaTickets tickets={[]} />);
    expect(screen.getByText('No hay tickets para mostrar')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TablaTickets from './TablaTickets';

const abrirTicket = vi.fn();
let esMovil = false;
vi.mock('../context/AsideTicketContext', () => ({ useAsideTicket: () => ({ abrirTicket }) }));
vi.mock('../hooks/useEsMovil', () => ({ useEsMovil: () => esMovil }));

const tickets = [
  { id: 1, numero: 'TK-000001', prioridad: 'Alta', titulo: 'No imprime', estado: 'Abierto', fecha_creacion: '2026-10-01T10:00:00' },
  { id: 2, numero: 'TK-000002', prioridad: 'Baja', titulo: 'Mouse roto', estado: 'Abierto', fecha_creacion: '2026-10-02T10:00:00' },
];

const encabezados = () => screen.getAllByRole('columnheader').map((th) => th.textContent.replace(/[▲▼\s]+$/, '').trim());
const anchoDe = (etiqueta) => screen.getByRole('separator', { name: `Ajustar el ancho de ${etiqueta}` }).getAttribute('aria-valuenow');

// jsdom no calcula layout ni implementa DragEvent: se simula soltar una columna sobre otra.
function soltarColumna(th, claveOrigen) {
  th.getBoundingClientRect = () => ({ left: 0, width: 100 });
  fireEvent.drop(th, {
    dataTransfer: { types: ['application/x-kdesk-columna'], getData: () => claveOrigen, setData: () => {} },
  });
}

describe('TablaTickets', () => {
  beforeEach(() => {
    window.localStorage.clear();
    abrirTicket.mockClear();
    esMovil = false;
  });

  it('al hacer clic en una fila abre el panel lateral de ese ticket', async () => {
    render(<TablaTickets tickets={tickets} />);

    await userEvent.click(screen.getByText('Mouse roto'));

    expect(abrirTicket).toHaveBeenCalledWith(2);
  });

  it('avisa si no hay tickets', () => {
    render(<TablaTickets tickets={[]} />);
    expect(screen.getByText('No hay tickets para mostrar')).toBeInTheDocument();
  });

  it('se puede cambiar el orden de las columnas y las celdas acompañan al encabezado', () => {
    render(<TablaTickets tickets={tickets} />);
    expect(encabezados()).toEqual(['ID', 'Prioridad', 'Detalle', 'Estado', 'Fecha de creación']);

    // arrastrar "Estado" para dejarlo antes de "ID"
    soltarColumna(screen.getAllByRole('columnheader')[0], 'estado');

    expect(encabezados()).toEqual(['Estado', 'ID', 'Prioridad', 'Detalle', 'Fecha de creación']);
    expect(screen.getAllByRole('row')[1].firstChild).toHaveTextContent('Abierto');
  });

  it('recuerda el orden de las columnas, los anchos y el orden de las filas al recargar la página', async () => {
    const primera = render(<TablaTickets tickets={tickets} />);

    soltarColumna(screen.getAllByRole('columnheader')[0], 'estado');
    fireEvent.keyDown(screen.getByRole('separator', { name: 'Ajustar el ancho de Detalle' }), { key: 'ArrowRight' });
    await userEvent.click(screen.getByText('Prioridad')); // ordena las filas por prioridad
    primera.unmount();

    // "recargar": se vuelve a montar la tabla con lo que quedó guardado
    render(<TablaTickets tickets={tickets} />);

    expect(encabezados()).toEqual(['Estado', 'ID', 'Prioridad', 'Detalle', 'Fecha de creación']);
    expect(anchoDe('Detalle')).toBe('432');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('TK-000001'); // Alta antes que Baja
    expect(screen.getByText('Prioridad').closest('th')).toHaveTextContent('▲');
  });

  describe('en el celular', () => {
    beforeEach(() => {
      esMovil = true;
    });

    it('muestra tarjetas en lugar de la tabla', () => {
      render(<TablaTickets tickets={tickets} />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /No imprime/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Mouse roto/ })).toBeInTheDocument();
    });

    it('al tocar una tarjeta abre el ticket', async () => {
      render(<TablaTickets tickets={tickets} />);

      await userEvent.click(screen.getByRole('button', { name: /Mouse roto/ }));

      expect(abrirTicket).toHaveBeenCalledWith(2);
    });

    it('las tarjetas vienen por fecha de creación, la más nueva primero', () => {
      render(<TablaTickets tickets={tickets} />);

      const titulos = screen.getAllByRole('button', { name: /TK-/ }).map((tarjeta) => tarjeta.textContent);
      expect(titulos[0]).toContain('Mouse roto');
    });

    it('cambiar el orden reordena las tarjetas', async () => {
      render(<TablaTickets tickets={tickets} />);

      // en el celular el selector abre una hoja con las opciones
      await userEvent.click(screen.getByRole('button', { name: /Ordenar por/ }));
      await userEvent.click(screen.getByRole('option', { name: 'ID' }));

      const tarjetas = screen.getAllByRole('button', { name: /TK-/ });
      expect(tarjetas[0]).toHaveTextContent('TK-000001');
    });
  });
});

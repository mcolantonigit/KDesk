import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListaTicketsMovil from './ListaTicketsMovil';

const tickets = [
  { id: 1, numero: 'TK-000001', titulo: 'No imprime', estado: 'Pendiente', prioridad: 'Alta', fecha_creacion: new Date(2026, 9, 23, 16, 22).toISOString() },
  { id: 2, numero: 'TK-000002', titulo: 'Servidor caído', estado: 'En proceso', prioridad: 'Critica', fecha_creacion: new Date(2026, 9, 22, 9, 5).toISOString() },
];

const opcionesOrden = [
  { clave: 'numero', etiqueta: 'ID' },
  { clave: 'fecha_creacion', etiqueta: 'Fecha de creación' },
];

function abrir(props = {}) {
  const onOrdenar = vi.fn();
  const onAbrir = vi.fn();
  render(
    <ListaTicketsMovil
      tickets={tickets}
      ordenPor="fecha_creacion"
      ordenAsc={false}
      opcionesOrden={opcionesOrden}
      onOrdenar={onOrdenar}
      onAbrir={onAbrir}
      {...props}
    />
  );
  return { onOrdenar, onAbrir };
}

describe('ListaTicketsMovil', () => {
  it('muestra una tarjeta por ticket con número, estado, título, prioridad y fecha', () => {
    abrir();

    const tarjeta = screen.getByRole('button', { name: /No imprime/ });
    const interior = within(tarjeta);
    expect(interior.getByText('TK-000001')).toBeInTheDocument();
    expect(interior.getByText('Pendiente')).toBeInTheDocument();
    expect(interior.getByText('Alta')).toBeInTheDocument();
    expect(interior.getByText('23/10/2026 16:22')).toBeInTheDocument();
  });

  it('escribe "Crítica" con tilde aunque el dato venga sin ella', () => {
    abrir();
    expect(screen.getByText('Crítica')).toBeInTheDocument();
  });

  it('al tocar una tarjeta abre ese ticket', async () => {
    const { onAbrir } = abrir();

    await userEvent.click(screen.getByRole('button', { name: /Servidor caído/ }));

    expect(onAbrir).toHaveBeenCalledWith(2);
  });

  it('se puede cambiar por qué columna se ordena y la dirección', async () => {
    const { onOrdenar } = abrir();

    await userEvent.selectOptions(screen.getByLabelText('Ordenar por'), 'numero');
    expect(onOrdenar).toHaveBeenLastCalledWith('numero');

    await userEvent.click(screen.getByRole('button', { name: /Orden descendente/ }));
    expect(onOrdenar).toHaveBeenLastCalledWith('fecha_creacion');
  });

  it('indica la dirección actual del orden', () => {
    abrir({ ordenAsc: true });
    expect(screen.getByRole('button', { name: /Orden ascendente/ })).toHaveTextContent('↑');
  });

  it('avisa si no hay tickets', () => {
    abrir({ tickets: [] });
    expect(screen.getByText('No hay tickets para mostrar')).toBeInTheDocument();
  });
});

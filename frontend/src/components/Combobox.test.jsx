import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from './Combobox';

const opciones = [
  { id: 3, nombre: 'Sucursal Mendoza' },
  { id: 1, nombre: 'Casa Central' },
  { id: 2, nombre: 'Sucursal Córdoba' },
];

// Envoltorio con estado, como se usa en los formularios reales.
function Controlado({ inicial = '', onChange = () => {}, required }) {
  const [valor, setValor] = useState(inicial);
  return (
    <Combobox
      id="sucursal"
      label="Sucursal"
      value={valor}
      onChange={(nuevo) => {
        setValor(nuevo);
        onChange(nuevo);
      }}
      options={opciones}
      required={required}
    />
  );
}

const nombresVisibles = () => screen.getAllByRole('option').map((o) => o.textContent);

describe('Combobox', () => {
  it('al enfocar muestra todo el listado ordenado alfabéticamente', async () => {
    render(<Controlado />);
    await userEvent.click(screen.getByLabelText('Sucursal'));

    expect(nombresVisibles()).toEqual(['Casa Central', 'Sucursal Córdoba', 'Sucursal Mendoza']);
  });

  it('al escribir filtra y deja primera (recomendada) la opción más cercana', async () => {
    render(<Controlado />);
    await userEvent.type(screen.getByLabelText('Sucursal'), 'mend');

    expect(nombresVisibles()).toEqual(['Sucursal Mendoza']);
    expect(screen.getByRole('option', { name: 'Sucursal Mendoza' })).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter elige la opción recomendada', async () => {
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);
    const input = screen.getByLabelText('Sucursal');

    await userEvent.type(input, 'cord{Enter}');

    expect(onChange).toHaveBeenCalledWith(2);
    expect(input).toHaveValue('Sucursal Córdoba');
  });

  it('las flechas mueven la opción resaltada', async () => {
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);
    const input = screen.getByLabelText('Sucursal');

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}');

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('se puede elegir con el mouse', async () => {
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Sucursal'));
    await userEvent.click(screen.getByRole('option', { name: 'Casa Central' }));

    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByLabelText('Sucursal')).toHaveValue('Casa Central');
  });

  it('no deja un texto que no esté en el listado: al salir vuelve a lo elegido', async () => {
    const onChange = vi.fn();
    render(<Controlado inicial={1} onChange={onChange} />);
    const input = screen.getByLabelText('Sucursal');
    expect(input).toHaveValue('Casa Central');

    await userEvent.clear(input);
    await userEvent.type(input, 'cualquier cosa');
    await userEvent.tab();

    expect(input).toHaveValue('Casa Central');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('si lo escrito coincide exacto con una opción, la elige al salir', async () => {
    const onChange = vi.fn();
    render(<Controlado onChange={onChange} />);
    const input = screen.getByLabelText('Sucursal');

    await userEvent.type(input, 'casa central');
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(1);
    expect(input).toHaveValue('Casa Central');
  });

  it('borrar el texto y salir deja el campo vacío', async () => {
    const onChange = vi.fn();
    render(<Controlado inicial={1} onChange={onChange} />);
    const input = screen.getByLabelText('Sucursal');

    await userEvent.clear(input);
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });

  it('avisa cuando nada coincide con lo escrito', async () => {
    render(<Controlado />);
    await userEvent.type(screen.getByLabelText('Sucursal'), 'xyz');

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('es obligatorio mientras no haya una opción elegida', () => {
    render(<Controlado required />);
    expect(screen.getByLabelText('Sucursal')).toBeRequired();
  });
});

import { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Selector from './Selector';

function usarPantalla(movil) {
  window.matchMedia = () => ({ matches: movil, addEventListener: () => {}, removeEventListener: () => {} });
}

afterEach(() => {
  delete window.matchMedia;
});

function Ejemplo({ inicial = '', onCambio = () => {}, opciones = ['Hardware', 'Software', 'Redes'], onClickEnvoltorio }) {
  const [valor, setValor] = useState(inicial);
  return (
    <div onClick={onClickEnvoltorio}>
      <label>
        <span>Tipo</span>
        <Selector
          aria-label="Tipo"
          value={valor}
          onChange={(evento) => {
            setValor(evento.target.value);
            onCambio(evento.target.value);
          }}
        >
          <option value="">Todos</option>
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </Selector>
      </label>
    </div>
  );
}

describe('Selector en pantalla ancha', () => {
  it('es el <select> de siempre', async () => {
    usarPantalla(false);
    const onCambio = vi.fn();
    render(<Ejemplo onCambio={onCambio} />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Tipo' }), 'Software');

    expect(onCambio).toHaveBeenCalledWith('Software');
  });
});

describe('Selector en el celular', () => {
  const abrirHoja = async () => userEvent.click(screen.getByRole('button', { name: /Tipo/ }));
  const hoja = () => within(screen.getByRole('dialog'));

  it('muestra lo elegido y, al tocarlo, una hoja con todas las opciones', async () => {
    usarPantalla(true);
    render(<Ejemplo inicial="Software" />);

    expect(screen.getByRole('button', { name: 'Tipo: Software' })).toBeInTheDocument();
    await abrirHoja();

    expect(screen.getByRole('dialog', { name: 'Tipo' })).toBeInTheDocument();
    expect(hoja().getAllByRole('option').map((opcion) => opcion.textContent)).toEqual(['Todos', 'Hardware', 'Software', 'Redes']);
    expect(hoja().getByRole('option', { name: 'Software' })).toHaveAttribute('aria-selected', 'true');
  });

  it('elegir una opción cambia el valor y cierra la hoja', async () => {
    usarPantalla(true);
    const onCambio = vi.fn();
    render(<Ejemplo onCambio={onCambio} />);
    await abrirHoja();

    await userEvent.click(hoja().getByRole('option', { name: 'Redes' }));

    expect(onCambio).toHaveBeenCalledWith('Redes');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tipo: Redes' })).toBeInTheDocument();
  });

  it('elegir la opción que ya estaba no avisa de ningún cambio', async () => {
    usarPantalla(true);
    const onCambio = vi.fn();
    render(<Ejemplo inicial="Redes" onCambio={onCambio} />);
    await abrirHoja();

    await userEvent.click(hoja().getByRole('option', { name: 'Redes' }));

    expect(onCambio).not.toHaveBeenCalled();
  });

  it('se cierra con Escape o tocando afuera, sin cambiar nada', async () => {
    usarPantalla(true);
    const onCambio = vi.fn();
    render(<Ejemplo onCambio={onCambio} />);

    await abrirHoja();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await abrirHoja();
    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onCambio).not.toHaveBeenCalled();
  });

  it('se abre con el teclado (Enter)', async () => {
    usarPantalla(true);
    render(<Ejemplo />);

    screen.getByRole('button', { name: /Tipo/ }).focus();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('con muchas opciones ofrece un buscador que filtra sin importar acentos', async () => {
    usarPantalla(true);
    render(<Ejemplo opciones={['Córdoba', 'Mendoza', 'Salta', 'Jujuy', 'Tucumán', 'Neuquén', 'Rosario', 'La Plata', 'Posadas']} />);
    await abrirHoja();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar opción' }), 'cordoba');

    expect(hoja().getAllByRole('option').map((opcion) => opcion.textContent)).toEqual(['Córdoba']);
  });

  it('con pocas opciones no hay buscador', async () => {
    usarPantalla(true);
    render(<Ejemplo />);
    await abrirHoja();

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('tocar el selector no activa lo que hay debajo (por ejemplo, una tarjeta que se abre al tocarla)', async () => {
    usarPantalla(true);
    const alTocarTarjeta = vi.fn();
    render(<Ejemplo onClickEnvoltorio={alTocarTarjeta} />);

    await abrirHoja();
    await userEvent.click(hoja().getByRole('option', { name: 'Redes' }));

    // el toque sobre el campo sí llega a la tarjeta salvo que el que lo usa lo frene (como hacen las tarjetas),
    // pero lo que se toca dentro de la hoja nunca debe llegar
    expect(alTocarTarjeta).toHaveBeenCalledTimes(1);
  });

  it('bloquea el scroll de la página mientras la hoja está abierta', async () => {
    usarPantalla(true);
    render(<Ejemplo />);

    await abrirHoja();
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextoExpandible from './TextoExpandible';

// jsdom no calcula layout: se simula un texto que desborda sus líneas.
function simularDesborde(desborda) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => (desborda ? 200 : 40) });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 40 });
}

afterEach(() => {
  delete HTMLElement.prototype.scrollHeight;
  delete HTMLElement.prototype.clientHeight;
});

describe('TextoExpandible', () => {
  it('no muestra el botón si el texto entra completo', () => {
    simularDesborde(false);
    render(<TextoExpandible texto="Texto corto" />);

    expect(screen.getByText('Texto corto')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('si se recorta, ofrece expandir y volver a acotar', async () => {
    simularDesborde(true);
    render(<TextoExpandible texto="Texto muy largo" />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver más' }));
    expect(screen.getByText('Texto muy largo')).toHaveClass('expandido');

    await userEvent.click(screen.getByRole('button', { name: 'Ver menos' }));
    expect(screen.getByText('Texto muy largo')).not.toHaveClass('expandido');
  });
});

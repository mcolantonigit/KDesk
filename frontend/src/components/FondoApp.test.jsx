import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FondoApp from './FondoApp';

describe('FondoApp', () => {
  it('"ninguno" no dibuja nada', () => {
    const { container } = render(<FondoApp tipo="ninguno" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('cada tipo usa su propia clase y queda oculto para lectores de pantalla', () => {
    for (const tipo of ['aurora', 'rejilla', 'luz', 'puntos', 'grilla']) {
      const { container, unmount } = render(<FondoApp tipo={tipo} />);
      const fondo = container.firstChild;

      expect(fondo).toHaveClass('fondo', `fondo-${tipo}`);
      expect(fondo).not.toHaveClass('fondo-contenido');
      expect(fondo).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });

  it('la aurora tiene tres manchas de color', () => {
    const { container } = render(<FondoApp tipo="aurora" />);
    expect(container.querySelectorAll('.fondo-aurora span')).toHaveLength(3);
  });

  it('la aurora en la rejilla tiene cuatro luces que se ven a través de la grilla', () => {
    const { container } = render(<FondoApp tipo="rejilla" />);
    expect(container.querySelectorAll('.fondo-rejilla span')).toHaveLength(4);
  });

  it('en una vista previa se dibuja dentro de su contenedor', () => {
    const { container } = render(<FondoApp tipo="aurora" contenido />);
    expect(container.firstChild).toHaveClass('fondo-contenido');
  });

  it('"Grilla con luz": el brillo sigue al mouse', async () => {
    const { container } = render(<FondoApp tipo="luz" />);
    const fondo = container.firstChild;

    fireEvent(window, Object.assign(new Event('pointermove'), { clientX: 320, clientY: 180 }));

    await waitFor(() => expect(fondo.style.getPropertyValue('--luz-x')).toBe('320px'));
    expect(fondo.style.getPropertyValue('--luz-y')).toBe('180px');
  });

  it('los otros fondos no escuchan el mouse', () => {
    const { container } = render(<FondoApp tipo="aurora" />);

    fireEvent(window, Object.assign(new Event('pointermove'), { clientX: 10, clientY: 10 }));

    expect(container.firstChild.style.getPropertyValue('--luz-x')).toBe('');
  });
});

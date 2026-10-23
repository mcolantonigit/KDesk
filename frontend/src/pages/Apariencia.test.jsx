import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferenciasProvider } from '../context/PreferenciasContext';
import Apariencia from './Apariencia';

function abrir() {
  return render(
    <PreferenciasProvider>
      <Apariencia />
    </PreferenciasProvider>
  );
}

const elegido = () => screen.getAllByRole('radio').find((opcion) => opcion.getAttribute('aria-checked') === 'true');

describe('Apariencia', () => {
  beforeEach(() => window.localStorage.clear());

  it('ofrece los seis fondos y por defecto está elegida la Aurora en la rejilla', () => {
    abrir();

    expect(screen.getAllByRole('radio')).toHaveLength(6);
    expect(elegido()).toHaveTextContent('Aurora en la rejilla');
  });

  it('cada opción muestra su vista previa', () => {
    const { container } = abrir();

    expect(container.querySelectorAll('.apariencia-vista .fondo-contenido')).toHaveLength(5); // "Sin fondo" no dibuja nada
  });

  it('elegir un fondo lo marca y lo guarda en el navegador', async () => {
    abrir();

    await userEvent.click(screen.getByRole('radio', { name: /Puntos/ }));

    expect(elegido()).toHaveTextContent('Puntos');
    expect(JSON.parse(window.localStorage.getItem('kdesk:preferencias:fondo'))).toBe('puntos');
  });

  it('recuerda el fondo elegido al volver', () => {
    window.localStorage.setItem('kdesk:preferencias:fondo', JSON.stringify('luz'));
    abrir();

    expect(elegido()).toHaveTextContent('Grilla con luz');
  });

  it('quien había apagado el "Fondo animado" sigue sin fondo', () => {
    window.localStorage.setItem('kdesk:preferencias:fondoAnimado', 'false');
    abrir();

    expect(elegido()).toHaveTextContent('Sin fondo');
  });
});

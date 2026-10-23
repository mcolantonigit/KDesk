import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import ThRedimensionable from './ThRedimensionable';

function montar(props = {}) {
  const onResize = vi.fn();
  const onReset = vi.fn();
  const onClick = vi.fn();
  render(
    <table>
      <thead>
        <tr>
          <ThRedimensionable etiqueta="Detalle" ancho={200} onResize={onResize} onReset={onReset} onClick={onClick} {...props}>
            Detalle
          </ThRedimensionable>
        </tr>
      </thead>
    </table>
  );
  return { onResize, onReset, onClick, tirador: screen.getByRole('separator', { name: 'Ajustar el ancho de Detalle' }) };
}

describe('ThRedimensionable', () => {
  it('arrastrar el tirador cambia el ancho según lo que se movió el mouse', () => {
    const { onResize, tirador } = montar();

    fireEvent.pointerDown(tirador, { clientX: 500 });
    fireEvent.pointerMove(window, { clientX: 560 });
    expect(onResize).toHaveBeenLastCalledWith(260);

    fireEvent.pointerMove(window, { clientX: 450 });
    expect(onResize).toHaveBeenLastCalledWith(150);
  });

  it('al soltar deja de seguir al mouse', () => {
    const { onResize, tirador } = montar();

    fireEvent.pointerDown(tirador, { clientX: 500 });
    fireEvent.pointerUp(window);
    onResize.mockClear();
    fireEvent.pointerMove(window, { clientX: 700 });

    expect(onResize).not.toHaveBeenCalled();
    expect(document.body).not.toHaveClass('redimensionando-columna');
  });

  it('con el foco, las flechas ajustan el ancho', () => {
    const { onResize, tirador } = montar();

    fireEvent.keyDown(tirador, { key: 'ArrowRight' });
    expect(onResize).toHaveBeenLastCalledWith(212);

    fireEvent.keyDown(tirador, { key: 'ArrowLeft' });
    expect(onResize).toHaveBeenLastCalledWith(188);
  });

  it('doble clic restablece el ancho por defecto', () => {
    const { onReset, tirador } = montar();

    fireEvent.doubleClick(tirador);

    expect(onReset).toHaveBeenCalled();
  });

  it('usar el tirador no dispara el clic del encabezado (ordenar), pero el resto del encabezado sí', () => {
    const { onClick, tirador } = montar();

    fireEvent.click(tirador);
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Detalle'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('ThRedimensionable: reordenar columnas', () => {
  function montarConDestino(onMover = vi.fn()) {
    render(
      <table>
        <thead>
          <tr>
            <ThRedimensionable clave="titulo" etiqueta="Detalle" ancho={200} onResize={() => {}} onReset={() => {}} onMover={onMover}>
              Detalle
            </ThRedimensionable>
          </tr>
        </thead>
      </table>
    );
    return { onMover, th: screen.getByText('Detalle').closest('th') };
  }

  function dataTransfer(clave) {
    const datos = clave ? { 'application/x-kdesk-columna': clave } : {};
    return {
      types: Object.keys(datos),
      setData: vi.fn(),
      getData: (tipo) => datos[tipo] ?? '',
      effectAllowed: '',
      dropEffect: '',
    };
  }

  it('el encabezado se puede arrastrar solo si se pasó onMover', () => {
    const { th } = montarConDestino();
    expect(th).toHaveAttribute('draggable', 'true');
  });

  it('sin onMover el encabezado no se arrastra', () => {
    render(
      <table>
        <thead>
          <tr>
            <ThRedimensionable clave="x" etiqueta="X" ancho={100} onResize={() => {}} onReset={() => {}}>
              X
            </ThRedimensionable>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByText('X').closest('th')).toHaveAttribute('draggable', 'false');
  });

  it('al empezar a arrastrar lleva la clave de la columna', () => {
    const { th } = montarConDestino();
    const dt = dataTransfer();

    fireEvent.dragStart(th, { dataTransfer: dt });

    expect(dt.setData).toHaveBeenCalledWith('application/x-kdesk-columna', 'titulo');
    expect(th).toHaveClass('th-arrastrando');
  });

  // jsdom no implementa DragEvent ni calcula layout: la posición del mouse se
  // agrega a mano y el encabezado se simula de 100px de ancho (mitad = 50).
  function soltar(th, tipo, clave, clientX) {
    th.getBoundingClientRect = () => ({ left: 0, width: 100 });
    const evento = createEvent[tipo](th, { dataTransfer: dataTransfer(clave) });
    Object.defineProperty(evento, 'clientX', { value: clientX });
    fireEvent(th, evento);
  }

  it('soltar otra columna sobre este encabezado avisa dónde (antes o después)', () => {
    const { onMover, th } = montarConDestino();

    soltar(th, 'dragOver', 'estado', 20);
    expect(th).toHaveClass('th-soltar-antes');
    soltar(th, 'drop', 'estado', 20);
    expect(onMover).toHaveBeenLastCalledWith('estado', 'titulo', false);

    soltar(th, 'dragOver', 'estado', 80);
    expect(th).toHaveClass('th-soltar-despues');
    soltar(th, 'drop', 'estado', 80);
    expect(onMover).toHaveBeenLastCalledWith('estado', 'titulo', true);
    expect(th).not.toHaveClass('th-soltar-despues');
  });

  it('ignora arrastres que no son de una columna (por ejemplo, un archivo)', () => {
    const { onMover, th } = montarConDestino();

    fireEvent.dragOver(th, { dataTransfer: dataTransfer(null) });
    fireEvent.drop(th, { dataTransfer: dataTransfer(null) });

    expect(onMover).not.toHaveBeenCalled();
    expect(th).not.toHaveClass('th-soltar-antes');
  });

  it('mientras se ajusta el ancho no se puede arrastrar la columna', () => {
    const { th } = montarConDestino();
    const tirador = screen.getByRole('separator');

    fireEvent.pointerDown(tirador, { clientX: 10 });
    expect(th).toHaveAttribute('draggable', 'false');

    fireEvent.pointerUp(window);
    expect(th).toHaveAttribute('draggable', 'true');
  });
});

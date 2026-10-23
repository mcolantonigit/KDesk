import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  it('muestra el título y el contenido como un diálogo', () => {
    render(
      <Modal titulo="Nuevo ticket" onClose={() => {}}>
        <p>contenido</p>
      </Modal>
    );

    expect(screen.getByRole('dialog', { name: 'Nuevo ticket' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('se cierra con Escape', async () => {
    const onClose = vi.fn();
    render(<Modal titulo="T" onClose={onClose}>x</Modal>);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('se cierra con el botón de cerrar', async () => {
    const onClose = vi.fn();
    render(<Modal titulo="T" onClose={onClose}>x</Modal>);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('se cierra al hacer clic en el fondo pero no al hacer clic adentro', () => {
    const onClose = vi.fn();
    render(<Modal titulo="T" onClose={onClose}>x</Modal>);

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole('dialog').parentElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('bloquea el scroll de la página mientras está abierto y lo devuelve al cerrarse', () => {
    const { unmount } = render(<Modal titulo="T" onClose={() => {}}>x</Modal>);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

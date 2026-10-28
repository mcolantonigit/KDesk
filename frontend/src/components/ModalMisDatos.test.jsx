import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalMisDatos from './ModalMisDatos';

const setUsuario = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ usuario: { id: 1, nombre: 'Ana', apellido: 'Pérez', correo: 'ana@kalop.com.ar' }, setUsuario }),
}));
vi.mock('../services/usuarios.service', () => ({ actualizarPerfil: vi.fn() }));

import { actualizarPerfil } from '../services/usuarios.service';

describe('ModalMisDatos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('arranca con los datos actuales y el correo no se puede editar', () => {
    render(<ModalMisDatos onClose={() => {}} />);

    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
    expect(screen.getByLabelText('Apellido')).toHaveValue('Pérez');
    expect(screen.getByLabelText('Correo')).toBeDisabled();
  });

  it('guarda, actualiza la sesión (el nombre de arriba cambia) y se cierra', async () => {
    const actualizado = { id: 1, nombre: 'Ana María', apellido: 'Pérez', correo: 'ana@kalop.com.ar' };
    actualizarPerfil.mockResolvedValue(actualizado);
    const onClose = vi.fn();
    render(<ModalMisDatos onClose={onClose} />);

    await userEvent.clear(screen.getByLabelText('Nombre'));
    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana María');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(actualizarPerfil).toHaveBeenCalledWith({ nombre: 'Ana María', apellido: 'Pérez' });
    expect(setUsuario).toHaveBeenCalledWith(actualizado);
    expect(onClose).toHaveBeenCalled();
  });

  it('si el backend rechaza, muestra el error y no se cierra', async () => {
    actualizarPerfil.mockRejectedValue(new Error('El nombre y el apellido son obligatorios'));
    const onClose = vi.fn();
    render(<ModalMisDatos onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('El nombre y el apellido son obligatorios')).toBeInTheDocument();
    expect(setUsuario).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

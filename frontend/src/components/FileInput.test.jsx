import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileInput from './FileInput';

const archivo = new File(['hola'], 'informe.pdf', { type: 'application/pdf' });

describe('FileInput', () => {
  it('avisa con el archivo elegido', async () => {
    const onChange = vi.fn();
    render(<FileInput id="adjunto" label="Adjunto" value={null} onChange={onChange} />);

    await userEvent.upload(screen.getByLabelText('Adjunto'), archivo);

    expect(onChange).toHaveBeenCalledWith(archivo);
  });

  it('muestra nombre y tamaño del archivo elegido', () => {
    render(<FileInput id="adjunto" label="Adjunto" value={archivo} onChange={() => {}} />);

    expect(screen.getByText('informe.pdf')).toBeInTheDocument();
    expect(screen.getByText('4 B')).toBeInTheDocument();
  });

  it('permite quitar el archivo elegido', async () => {
    const onChange = vi.fn();
    render(<FileInput id="adjunto" label="Adjunto" value={archivo} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Quitar archivo' }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('acepta un archivo arrastrado y soltado', () => {
    const onChange = vi.fn();
    render(<FileInput id="adjunto" label="Adjunto" value={null} onChange={onChange} />);

    const zona = screen.getByText(/Arrastrá un archivo/).closest('.file-input-zona');
    fireEvent.drop(zona, { dataTransfer: { files: [archivo] } });

    expect(onChange).toHaveBeenCalledWith(archivo);
  });
});

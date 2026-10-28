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

  it('un archivo que no cumple accept se avisa en una ventana y el campo queda vacío', async () => {
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onChange = vi.fn();
    render(<FileInput id="adjunto" label="Adjunto" value={null} onChange={onChange} accept=".pdf" descripcion="PDF" />);
    const zip = new File(['x'], 'fotos.zip', { type: 'application/zip' });

    await userEvent.upload(screen.getByLabelText('Adjunto'), zip, { applyAccept: false });

    expect(alerta).toHaveBeenCalledWith(expect.stringContaining('No se puede adjuntar "fotos.zip"'));
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining('Se permiten: PDF.'));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(onChange).not.toHaveBeenCalledWith(zip);
    alerta.mockRestore();
  });

  it('también avisa si se arrastra un archivo demasiado grande', () => {
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onChange = vi.fn();
    render(<FileInput id="adjunto" label="Adjunto" value={null} onChange={onChange} accept=".pdf" tamanoMaximo={3} />);
    const zona = screen.getByText(/Arrastr/).closest('.file-input-zona');

    fireEvent.drop(zona, { dataTransfer: { files: [archivo] } });

    expect(alerta).toHaveBeenCalledWith(expect.stringContaining('pesa más de'));
    expect(onChange).not.toHaveBeenCalledWith(archivo);
    alerta.mockRestore();
  });
});

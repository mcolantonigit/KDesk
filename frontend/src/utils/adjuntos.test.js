import { describe, it, expect } from 'vitest';
import { ACEPTA_ADJUNTOS, TAMANO_MAXIMO_ADJUNTO, cumpleAccept, problemaConArchivo } from './adjuntos';

const archivo = (nombre, type, size = 10) => ({ name: nombre, type, size });

describe('adjuntos', () => {
  it('acepta lo mismo que el backend y rechaza el resto', () => {
    expect(cumpleAccept(archivo('Informe.PDF', 'application/pdf'), ACEPTA_ADJUNTOS)).toBe(true);
    expect(cumpleAccept(archivo('planilla.xlsx', ''), ACEPTA_ADJUNTOS)).toBe(true);
    expect(cumpleAccept(archivo('fotos.zip', 'application/zip'), ACEPTA_ADJUNTOS)).toBe(false);
    expect(cumpleAccept(archivo('video.mp4', 'video/mp4'), ACEPTA_ADJUNTOS)).toBe(false);
  });

  it('entiende accept con extensiones, tipos y comodines', () => {
    expect(cumpleAccept(archivo('backup.sql', ''), '.sql')).toBe(true);
    expect(cumpleAccept(archivo('foto.heic', 'image/heic'), 'image/*')).toBe(true);
    expect(cumpleAccept(archivo('cualquiera.exe', ''), undefined)).toBe(true);
  });

  it('explica el problema: tipo no permitido o tamaño de más', () => {
    expect(problemaConArchivo(archivo('a.pdf', 'application/pdf'), { accept: ACEPTA_ADJUNTOS })).toBeNull();
    expect(problemaConArchivo(archivo('a.zip', 'application/zip'), { accept: ACEPTA_ADJUNTOS, descripcion: 'PDF' })).toMatch(
      /"a\.zip": ese tipo de archivo no está permitido[\s\S]*Se permiten: PDF\./
    );
    expect(
      problemaConArchivo(archivo('a.pdf', 'application/pdf', TAMANO_MAXIMO_ADJUNTO + 1), {
        tamanoMaximo: TAMANO_MAXIMO_ADJUNTO,
      })
    ).toMatch(/pesa más de 80 MB/);
  });
});

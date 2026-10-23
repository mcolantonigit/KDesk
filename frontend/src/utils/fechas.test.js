import { describe, it, expect } from 'vitest';
import { formatearFechaHora } from './fechas';

describe('formatearFechaHora', () => {
  it('muestra día, mes y año con la hora en formato de 24 horas', () => {
    expect(formatearFechaHora(new Date(2026, 9, 23, 16, 22))).toBe('23/10/2026 16:22');
  });

  it('completa con ceros: día, mes, hora y minutos', () => {
    expect(formatearFechaHora(new Date(2026, 0, 5, 7, 3))).toBe('05/01/2026 07:03');
  });

  it('la medianoche es 00:00, no 24:00 ni 12:00', () => {
    expect(formatearFechaHora(new Date(2026, 11, 31, 0, 0))).toBe('31/12/2026 00:00');
  });

  it('acepta el texto ISO que manda el servidor', () => {
    const iso = new Date(2026, 9, 23, 16, 22).toISOString();
    expect(formatearFechaHora(iso)).toBe('23/10/2026 16:22');
  });

  it('sin fecha, o con una fecha inválida, muestra un guion', () => {
    expect(formatearFechaHora(null)).toBe('—');
    expect(formatearFechaHora(undefined)).toBe('—');
    expect(formatearFechaHora('no es una fecha')).toBe('—');
  });
});

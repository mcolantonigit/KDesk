import { describe, it, expect } from 'vitest';
import { filasACSV } from './exportar';

const columnas = [
  { key: 'id', label: 'ID' },
  { key: 'titulo', label: 'Título' },
];

describe('filasACSV', () => {
  it('genera encabezado y una línea por fila', () => {
    const csv = filasACSV(columnas, [{ id: 1, titulo: 'Impresora' }]);
    expect(csv).toBe('ID,Título\n1,Impresora');
  });

  it('escapa comas, comillas y saltos de línea', () => {
    const csv = filasACSV(columnas, [{ id: 2, titulo: 'Dijo "hola", y se fue' }]);
    expect(csv).toBe('ID,Título\n2,"Dijo ""hola"", y se fue"');
  });

  it('deja vacío un valor null o undefined', () => {
    const csv = filasACSV(columnas, [{ id: 3, titulo: null }]);
    expect(csv).toBe('ID,Título\n3,');
  });
});

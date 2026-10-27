import { describe, it, expect } from 'vitest';
import { normalizar, elegibles, ordenarAlfabeticamente, filtrarOpciones, buscarExacta } from './opciones';

const opciones = [
  { id: 1, nombre: 'Sucursal Córdoba' },
  { id: 2, nombre: 'Casa Central' },
  { id: 3, nombre: 'Álvarez' },
  { id: 4, nombre: 'Sucursal Mendoza' },
  { id: 5, nombre: 'Zárate' },
];

const nombres = (lista) => lista.map((o) => o.nombre);

describe('normalizar', () => {
  it('pasa a minúsculas y saca acentos y espacios de los costados', () => {
    expect(normalizar('  CÓRDOBA ñandú ')).toBe('cordoba nandu');
  });
});

describe('ordenarAlfabeticamente', () => {
  it('ordena sin tener en cuenta acentos ni mayúsculas y no modifica el original', () => {
    const resultado = ordenarAlfabeticamente(opciones);
    expect(nombres(resultado)).toEqual(['Álvarez', 'Casa Central', 'Sucursal Córdoba', 'Sucursal Mendoza', 'Zárate']);
    expect(opciones[0].nombre).toBe('Sucursal Córdoba');
  });
});

describe('filtrarOpciones', () => {
  it('sin texto devuelve todo ordenado alfabéticamente', () => {
    expect(nombres(filtrarOpciones(opciones, ''))).toEqual(nombres(ordenarAlfabeticamente(opciones)));
  });

  it('encuentra sin importar acentos ni mayúsculas', () => {
    expect(nombres(filtrarOpciones(opciones, 'cordoba'))).toEqual(['Sucursal Córdoba']);
  });

  it('prioriza lo que empieza igual, después palabras, después contenido', () => {
    const lista = [
      { id: 1, nombre: 'Impresora láser' },
      { id: 2, nombre: 'Red y comunicaciones' },
      { id: 3, nombre: 'Acceso a internet' },
      { id: 4, nombre: 'Soporte de impresión' },
    ];
    expect(nombres(filtrarOpciones(lista, 'imp'))).toEqual(['Impresora láser', 'Soporte de impresión']);
    expect(nombres(filtrarOpciones(lista, 'com'))).toEqual(['Red y comunicaciones']);
    expect(nombres(filtrarOpciones(lista, 'ern'))).toEqual(['Acceso a internet']);
  });

  it('si nada contiene el texto, sugiere las que tienen las letras en orden', () => {
    expect(nombres(filtrarOpciones(opciones, 'zrt'))).toEqual(['Zárate']);
  });

  it('devuelve vacío si nada se parece', () => {
    expect(filtrarOpciones(opciones, 'xyz')).toEqual([]);
  });
});

describe('buscarExacta', () => {
  it('encuentra el nombre exacto ignorando acentos y mayúsculas', () => {
    expect(buscarExacta(opciones, 'alvarez')?.id).toBe(3);
  });

  it('no devuelve nada si el texto es solo parte del nombre', () => {
    expect(buscarExacta(opciones, 'Casa')).toBeUndefined();
  });
});

describe('elegibles', () => {
  it('deja las activas y la actual aunque esté deshabilitada', () => {
    const tipos = [
      { id: 1, nombre: 'Hardware', activo: true },
      { id: 2, nombre: 'Viejo', activo: false },
      { id: 3, nombre: 'Otro viejo', activo: false },
      { id: 4, nombre: 'Sin flag' },
    ];
    expect(elegibles(tipos, 2).map((t) => t.id)).toEqual([1, 2, 4]);
  });
});

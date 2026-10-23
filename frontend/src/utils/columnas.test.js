import { describe, it, expect } from 'vitest';
import { reconciliarOrden, moverClave } from './columnas';

describe('reconciliarOrden', () => {
  it('sin nada guardado usa el orden original', () => {
    expect(reconciliarOrden(undefined, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(reconciliarOrden([], ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('respeta el orden guardado', () => {
    expect(reconciliarOrden(['c', 'a', 'b'], ['a', 'b', 'c'])).toEqual(['c', 'a', 'b']);
  });

  it('descarta columnas que ya no existen y repetidas', () => {
    expect(reconciliarOrden(['x', 'b', 'b', 'a'], ['a', 'b'])).toEqual(['b', 'a']);
  });

  it('agrega al final las columnas nuevas', () => {
    expect(reconciliarOrden(['b', 'a'], ['a', 'b', 'c'])).toEqual(['b', 'a', 'c']);
  });
});

describe('moverClave', () => {
  const orden = ['a', 'b', 'c', 'd'];

  it('mueve antes de otra columna', () => {
    expect(moverClave(orden, 'd', 'b', false)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('mueve después de otra columna', () => {
    expect(moverClave(orden, 'a', 'c', true)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('mover al final y al principio', () => {
    expect(moverClave(orden, 'a', 'd', true)).toEqual(['b', 'c', 'd', 'a']);
    expect(moverClave(orden, 'd', 'a', false)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('no cambia nada si se suelta sobre sí misma o sobre una columna desconocida', () => {
    expect(moverClave(orden, 'b', 'b', true)).toEqual(orden);
    expect(moverClave(orden, 'b', 'z', true)).toEqual(orden);
  });

  it('no modifica el orden original', () => {
    moverClave(orden, 'a', 'd', true);
    expect(orden).toEqual(['a', 'b', 'c', 'd']);
  });
});

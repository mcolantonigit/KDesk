import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnasOrden } from './useColumnasOrden';

const claves = ['a', 'b', 'c'];

describe('useColumnasOrden', () => {
  beforeEach(() => window.localStorage.clear());

  it('empieza con el orden original', () => {
    const { result } = renderHook(() => useColumnasOrden('tickets', claves));
    expect(result.current.orden).toEqual(claves);
  });

  it('mueve una columna y lo recuerda al volver a abrir la tabla', () => {
    const primera = renderHook(() => useColumnasOrden('tickets', claves));
    act(() => primera.result.current.moverColumna('c', 'a', false));
    expect(primera.result.current.orden).toEqual(['c', 'a', 'b']);
    primera.unmount();

    const segunda = renderHook(() => useColumnasOrden('tickets', claves));

    expect(segunda.result.current.orden).toEqual(['c', 'a', 'b']);
  });

  it('cada tabla recuerda su propio orden', () => {
    const a = renderHook(() => useColumnasOrden('tickets', claves));
    act(() => a.result.current.moverColumna('c', 'a', false));

    const b = renderHook(() => useColumnasOrden('tablero', claves));

    expect(b.result.current.orden).toEqual(claves);
  });

  it('restablece el orden original', () => {
    const { result } = renderHook(() => useColumnasOrden('tickets', claves));
    act(() => result.current.moverColumna('c', 'a', false));

    act(() => result.current.restablecerOrden());

    expect(result.current.orden).toEqual(claves);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnasAnchos, ANCHO_MINIMO_COLUMNA } from './useColumnasAnchos';

const porDefecto = { numero: 100, titulo: 300 };

describe('useColumnasAnchos', () => {
  beforeEach(() => window.localStorage.clear());

  it('empieza con los anchos por defecto', () => {
    const { result } = renderHook(() => useColumnasAnchos('tickets', porDefecto));
    expect(result.current.anchos).toEqual(porDefecto);
  });

  it('cambia el ancho de una columna sin tocar las demás', () => {
    const { result } = renderHook(() => useColumnasAnchos('tickets', porDefecto));

    act(() => result.current.cambiarAncho('titulo', 420.4));

    expect(result.current.anchos).toEqual({ numero: 100, titulo: 420 });
  });

  it('no deja achicar una columna por debajo del mínimo', () => {
    const { result } = renderHook(() => useColumnasAnchos('tickets', porDefecto));

    act(() => result.current.cambiarAncho('numero', 5));

    expect(result.current.anchos.numero).toBe(ANCHO_MINIMO_COLUMNA);
  });

  it('recuerda los anchos al volver a abrir la tabla', () => {
    const primera = renderHook(() => useColumnasAnchos('tickets', porDefecto));
    act(() => primera.result.current.cambiarAncho('titulo', 500));
    primera.unmount();

    const segunda = renderHook(() => useColumnasAnchos('tickets', porDefecto));

    expect(segunda.result.current.anchos.titulo).toBe(500);
  });

  it('cada tabla guarda sus propios anchos', () => {
    const a = renderHook(() => useColumnasAnchos('tickets', porDefecto));
    act(() => a.result.current.cambiarAncho('titulo', 500));

    const b = renderHook(() => useColumnasAnchos('tablero', porDefecto));

    expect(b.result.current.anchos.titulo).toBe(300);
  });

  it('vuelve al ancho por defecto de una columna', () => {
    const { result } = renderHook(() => useColumnasAnchos('tickets', porDefecto));
    act(() => result.current.cambiarAncho('titulo', 500));

    act(() => result.current.resetearAncho('titulo'));

    expect(result.current.anchos.titulo).toBe(300);
  });

  it('una columna nueva toma su ancho por defecto aunque lo guardado no la tenga', () => {
    window.localStorage.setItem('kdesk:tabla:tickets:anchos', JSON.stringify({ titulo: 450 }));

    const { result } = renderHook(() => useColumnasAnchos('tickets', { ...porDefecto, estado: 120 }));

    expect(result.current.anchos).toEqual({ numero: 100, titulo: 450, estado: 120 });
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEsMovil } from './useEsMovil';

function instalarMatchMedia(inicial) {
  const oyentes = new Set();
  const consulta = {
    matches: inicial,
    addEventListener: (_tipo, oyente) => oyentes.add(oyente),
    removeEventListener: (_tipo, oyente) => oyentes.delete(oyente),
  };
  window.matchMedia = () => consulta;
  return (matches) => {
    consulta.matches = matches;
    oyentes.forEach((oyente) => oyente({ matches }));
  };
}

afterEach(() => {
  delete window.matchMedia;
});

describe('useEsMovil', () => {
  it('es verdadero en una pantalla angosta y falso en una ancha', () => {
    instalarMatchMedia(true);
    expect(renderHook(() => useEsMovil()).result.current).toBe(true);

    instalarMatchMedia(false);
    expect(renderHook(() => useEsMovil()).result.current).toBe(false);
  });

  it('acompaña los cambios de tamaño de la ventana (por ejemplo, al girar el celular)', () => {
    const cambiar = instalarMatchMedia(false);
    const { result } = renderHook(() => useEsMovil());

    act(() => cambiar(true));
    expect(result.current).toBe(true);

    act(() => cambiar(false));
    expect(result.current).toBe(false);
  });

  it('sin soporte de matchMedia asume pantalla ancha', () => {
    expect(renderHook(() => useEsMovil()).result.current).toBe(false);
  });
});

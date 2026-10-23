import { describe, it, expect } from 'vitest';
import { FONDOS, FONDO_POR_DEFECTO, resolverFondo } from './fondos';

describe('resolverFondo', () => {
  it('usa el fondo elegido si es válido', () => {
    for (const fondo of FONDOS) {
      expect(resolverFondo(fondo.clave, null)).toBe(fondo.clave);
    }
  });

  it('si nunca eligió, usa el de por defecto', () => {
    expect(resolverFondo('', null)).toBe(FONDO_POR_DEFECTO);
    expect(resolverFondo(undefined, true)).toBe(FONDO_POR_DEFECTO);
  });

  it('respeta que antes hubiera apagado el fondo animado', () => {
    expect(resolverFondo('', false)).toBe('ninguno');
  });

  it('lo elegido gana sobre la preferencia vieja', () => {
    expect(resolverFondo('puntos', false)).toBe('puntos');
  });

  it('ignora un valor guardado que ya no existe', () => {
    expect(resolverFondo('arcoiris', null)).toBe(FONDO_POR_DEFECTO);
  });
});

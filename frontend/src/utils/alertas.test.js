import { describe, it, expect } from 'vitest';
import { combinarPreferencias, PREFERENCIAS_POR_DEFECTO, TIPOS_NOTIFICACION } from './alertas';

describe('combinarPreferencias', () => {
  it('sin nada guardado devuelve los valores por defecto: todo activado', () => {
    const prefs = combinarPreferencias({});

    expect(prefs.activas).toBe(true);
    expect(prefs.voz).toBe('');
    for (const tipo of TIPOS_NOTIFICACION) {
      expect(prefs.tipos[tipo.clave]).toEqual({ popup: true, sonido: true, voz: true });
    }
  });

  it('respeta lo guardado y completa el resto', () => {
    const prefs = combinarPreferencias({ volumen: 0.3, tipos: { comentario: { sonido: false } } });

    expect(prefs.volumen).toBe(0.3);
    expect(prefs.tipos.comentario).toEqual({ popup: true, sonido: false, voz: true });
    expect(prefs.tipos.asignado).toEqual({ popup: true, sonido: true, voz: true });
  });

  it('no modifica los valores por defecto', () => {
    combinarPreferencias({ tipos: { comentario: { popup: false } } });

    expect(PREFERENCIAS_POR_DEFECTO.tipos.comentario.popup).toBe(true);
  });
});

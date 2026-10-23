import { describe, it, expect } from 'vitest';
import { detectarNavegador, elegirVozPorDefecto, resolverVoz, vocesEnEspanol } from './voces';

const voz = (name, lang) => ({ name, lang });

const vocesEdge = [
  voz('Microsoft David - English (United States)', 'en-US'),
  voz('Microsoft Helena - Spanish (Spain)', 'es-ES'),
  voz('Microsoft Dalia Online (Natural) - Spanish (Mexico)', 'es-MX'),
  voz('Microsoft Gonzalo Online (Natural) - Spanish (Colombia)', 'es-CO'),
];

const vocesChrome = [
  voz('Google US English', 'en-US'),
  voz('Google español', 'es-ES'),
  voz('Google español de Estados Unidos', 'es-US'),
  voz('Google español de Estados Unidos 4 (Natural)', 'es-US'),
];

describe('detectarNavegador', () => {
  it('distingue Edge de Chrome', () => {
    const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
    expect(detectarNavegador(chrome)).toBe('chrome');
    expect(detectarNavegador(`${chrome} Edg/130.0.0.0`)).toBe('edge');
    expect(detectarNavegador('Mozilla/5.0 Firefox/130.0')).toBe('otro');
  });
});

describe('vocesEnEspanol', () => {
  it('deja solo las de español, con las naturales primero', () => {
    const nombres = vocesEnEspanol(vocesEdge).map((v) => v.name);

    expect(nombres).toEqual([
      'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
      'Microsoft Gonzalo Online (Natural) - Spanish (Colombia)',
      'Microsoft Helena - Spanish (Spain)',
    ]);
  });
});

describe('elegirVozPorDefecto', () => {
  it('en Edge elige Gonzalo (Natural)', () => {
    expect(elegirVozPorDefecto(vocesEdge, 'edge').name).toBe('Microsoft Gonzalo Online (Natural) - Spanish (Colombia)');
  });

  it('en Chrome elige "Google español" (la voz en línea)', () => {
    expect(elegirVozPorDefecto(vocesChrome, 'chrome').name).toBe('Google español');
  });

  it('en Chrome, si no está "Google español", usa la de Estados Unidos (la Natural si hay varias)', () => {
    const sinGoogleEspanol = vocesChrome.filter((v) => v.name !== 'Google español');
    expect(elegirVozPorDefecto(sinGoogleEspanol, 'chrome').name).toBe('Google español de Estados Unidos 4 (Natural)');
    expect(elegirVozPorDefecto(sinGoogleEspanol.slice(0, 2), 'chrome').name).toBe('Google español de Estados Unidos');
  });

  it('si la recomendada no está instalada, usa una natural en español y después cualquiera en español', () => {
    const sinGonzalo = vocesEdge.filter((v) => !v.name.includes('Gonzalo'));
    expect(elegirVozPorDefecto(sinGonzalo, 'edge').name).toBe('Microsoft Dalia Online (Natural) - Spanish (Mexico)');

    const soloHelena = [voz('Microsoft Helena - Spanish (Spain)', 'es-ES'), voz('Microsoft David', 'en-US')];
    expect(elegirVozPorDefecto(soloHelena, 'edge').name).toBe('Microsoft Helena - Spanish (Spain)');
  });

  it('sin voces en español devuelve null', () => {
    expect(elegirVozPorDefecto([voz('Microsoft David', 'en-US')], 'edge')).toBeNull();
    expect(elegirVozPorDefecto([], 'chrome')).toBeNull();
  });
});

describe('resolverVoz', () => {
  it('usa la voz elegida si existe', () => {
    expect(resolverVoz(vocesEdge, 'Microsoft Helena - Spanish (Spain)', 'edge').lang).toBe('es-ES');
  });

  it('si la elegida ya no existe, vuelve a la recomendada', () => {
    expect(resolverVoz(vocesEdge, 'Voz Que Ya No Está', 'edge').name).toContain('Gonzalo');
    expect(resolverVoz(vocesEdge, '', 'edge').name).toContain('Gonzalo');
  });
});

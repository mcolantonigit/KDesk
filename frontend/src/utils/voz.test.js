import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hablar } from './voz';

const vozLocal = { name: 'Microsoft Helena - Spanish (Spain)', lang: 'es-ES', localService: true };
const vozDeRed = { name: 'Google español de Estados Unidos', lang: 'es-US', localService: false };

class LecturaFalsa {
  constructor(texto) {
    this.text = texto;
  }
}

let sintetizador;
let lecturas;

// El sintetizador falso decide qué hace cada voz: hablar normalmente, o quedarse callada.
function instalarSintetizador(voces, { callar = [] } = {}) {
  lecturas = [];
  sintetizador = {
    getVoices: () => voces,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    speak: vi.fn((lectura) => {
      lecturas.push(lectura);
      if (callar.includes(lectura.voice?.name)) return;
      setTimeout(() => {
        lectura.onstart?.();
        lectura.onend?.();
      }, 10);
    }),
  };
  window.speechSynthesis = sintetizador;
}

beforeEach(() => {
  vi.useFakeTimers();
  window.SpeechSynthesisUtterance = LecturaFalsa;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('hablar', () => {
  it('lee el texto con la voz elegida, al volumen indicado', async () => {
    instalarSintetizador([vozLocal, vozDeRed]);

    const lectura = hablar('Hola', { nombreVoz: vozLocal.name, volumen: 0.4 });
    await vi.advanceTimersByTimeAsync(50);
    await lectura;

    expect(lecturas).toHaveLength(1);
    expect(lecturas[0]).toMatchObject({ text: 'Hola', volume: 0.4, lang: 'es-ES' });
    expect(lecturas[0].voice).toBe(vozLocal);
  });

  it('una voz de red que no empieza a hablar se reemplaza por una voz local', async () => {
    instalarSintetizador([vozDeRed, vozLocal], { callar: [vozDeRed.name] });

    const lectura = hablar('Hola', { nombreVoz: vozDeRed.name });
    await vi.advanceTimersByTimeAsync(3500);
    await lectura;

    expect(sintetizador.cancel).toHaveBeenCalled();
    expect(lecturas.map((l) => l.voice.name)).toEqual([vozDeRed.name, vozLocal.name]);
  });

  it('una voz de red que sí habla no se reemplaza', async () => {
    instalarSintetizador([vozDeRed, vozLocal]);

    const lectura = hablar('Hola', { nombreVoz: vozDeRed.name });
    await vi.advanceTimersByTimeAsync(4000);
    await lectura;

    expect(lecturas).toHaveLength(1);
    expect(sintetizador.cancel).not.toHaveBeenCalled();
  });

  it('si no hay ninguna voz local para reemplazarla, no insiste', async () => {
    instalarSintetizador([vozDeRed], { callar: [vozDeRed.name] });

    const lectura = hablar('Hola', { nombreVoz: vozDeRed.name });
    await vi.advanceTimersByTimeAsync(3500);
    await lectura;

    expect(lecturas).toHaveLength(1);
  });

  it('sin texto o sin soporte de voz en el navegador no hace nada', async () => {
    instalarSintetizador([vozLocal]);
    await hablar('');
    expect(lecturas).toHaveLength(0);

    delete window.speechSynthesis;
    await expect(hablar('Hola')).resolves.toBeUndefined();
  });
});

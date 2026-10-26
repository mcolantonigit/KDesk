import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const contextos = [];

class AudioContextFalso {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
    this.osciladores = [];
    this.resume = vi.fn(async () => {
      this.state = 'running';
    });
    contextos.push(this);
  }

  createGain() {
    return {
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }

  createOscillator() {
    const oscilador = { type: '', frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    this.osciladores.push(oscilador);
    return oscilador;
  }
}

let sonido;

beforeAll(async () => {
  window.AudioContext = AudioContextFalso;
  sonido = await import('./sonido');
});

beforeEach(() => {
  vi.useFakeTimers();
});

describe('reproducirSonidoNotificacion', () => {
  it('toca dos notas ascendentes, cada una con su octava más suave', async () => {
    const fin = sonido.reproducirSonidoNotificacion(0.5);
    await vi.advanceTimersByTimeAsync(1000);
    await fin;

    const ctx = contextos[0];
    const senoidales = ctx.osciladores.filter((o) => o.type === 'sine').map((o) => o.frequency.value);
    const armonicos = ctx.osciladores.filter((o) => o.type === 'triangle').map((o) => o.frequency.value);
    expect(senoidales).toEqual([659.25, 987.77]);
    expect(armonicos).toEqual([1318.5, 1975.54]);
    ctx.osciladores.forEach((o) => expect(o.start).toHaveBeenCalled());
  });

  it('termina cuando acaba el sonido, para que la voz entre justo después', async () => {
    let termino = false;
    sonido.reproducirSonidoNotificacion().then(() => {
      termino = true;
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(termino).toBe(false);
    await vi.advanceTimersByTimeAsync(500);
    expect(termino).toBe(true);
  });

  it('si el navegador todavía no dejó sonar, no suena y no se cuelga', async () => {
    const ctx = contextos[0];
    ctx.state = 'suspended';
    ctx.resume = vi.fn(async () => {});
    const antes = ctx.osciladores.length;

    await sonido.reproducirSonidoNotificacion();

    expect(ctx.osciladores.length).toBe(antes);
  });
});

describe('instalarDesbloqueoDeAudio', () => {
  it('con el primer clic reactiva el audio y deja de escuchar', () => {
    const ctx = contextos[0];
    ctx.resume = vi.fn(async () => {});
    const quitar = sonido.instalarDesbloqueoDeAudio();

    window.dispatchEvent(new Event('pointerdown'));
    window.dispatchEvent(new Event('pointerdown'));

    expect(ctx.resume).toHaveBeenCalledTimes(1);
    quitar();
  });
});

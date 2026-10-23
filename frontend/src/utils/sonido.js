// Sonido de las notificaciones: dos notas suaves y ascendentes generadas con
// Web Audio (no hace falta ningún archivo de audio).
const NOTAS = [
  { frecuencia: 659.25, inicio: 0 }, // Mi
  { frecuencia: 987.77, inicio: 0.14 }, // Si
];
const DURACION_NOTA = 0.7;
const DURACION_TOTAL_MS = 900;
const PICO_BASE = 0.22;

let contexto = null;

function obtenerContexto() {
  if (contexto) return contexto;
  const AudioContextNavegador = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextNavegador) return null;
  contexto = new AudioContextNavegador();
  return contexto;
}

function programarNota(ctx, { frecuencia, inicio }, volumen) {
  const t0 = ctx.currentTime + inicio;
  const pico = PICO_BASE * volumen;

  const ganancia = ctx.createGain();
  ganancia.gain.setValueAtTime(0.0001, t0);
  ganancia.gain.linearRampToValueAtTime(pico, t0 + 0.02);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + DURACION_NOTA);
  ganancia.connect(ctx.destination);

  // La nota y su octava, un poco más baja, para que suene más redondo.
  [
    { tipo: 'sine', frecuencia, factor: 1 },
    { tipo: 'triangle', frecuencia: frecuencia * 2, factor: 0.25 },
  ].forEach(({ tipo, frecuencia: f, factor }) => {
    const oscilador = ctx.createOscillator();
    const parcial = ctx.createGain();
    parcial.gain.value = factor;
    oscilador.type = tipo;
    oscilador.frequency.value = f;
    oscilador.connect(parcial);
    parcial.connect(ganancia);
    oscilador.start(t0);
    oscilador.stop(t0 + DURACION_NOTA + 0.05);
  });
}

// Los navegadores no dejan sonar hasta que el usuario interactúa con la página:
// con el primer clic o tecla se "desbloquea" el audio para el resto de la sesión.
export function instalarDesbloqueoDeAudio() {
  function desbloquear() {
    obtenerContexto()?.resume?.();
    quitar();
  }
  function quitar() {
    window.removeEventListener('pointerdown', desbloquear);
    window.removeEventListener('keydown', desbloquear);
  }
  window.addEventListener('pointerdown', desbloquear);
  window.addEventListener('keydown', desbloquear);
  return quitar;
}

// Reproduce el sonido y devuelve una promesa que se cumple cuando termina
// (así la voz puede empezar justo después). Si el navegador todavía no dejó
// sonar, no hace nada y se cumple enseguida.
export async function reproducirSonidoNotificacion(volumen = 0.7) {
  const ctx = obtenerContexto();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }
  if (ctx.state !== 'running') return;

  NOTAS.forEach((nota) => programarNota(ctx, nota, volumen));
  await new Promise((resolver) => setTimeout(resolver, DURACION_TOTAL_MS));
}

import { resolverVoz, vocesEnEspanol } from './voces';

const ESPERA_MAXIMA_VOCES_MS = 1500;
const ESPERA_MAXIMA_LECTURA_MS = 20000;
// Las voces "de red" (por ejemplo las de Google en Chrome) pasan por internet: si en una red
// con restricciones no responden, no avisan de ningún error. Si no empiezan a hablar en este
// tiempo se prueba con una voz instalada en la PC.
const ESPERA_INICIO_VOZ_DE_RED_MS = 3000;

// Las voces del navegador se cargan de forma asíncrona: si todavía no están, se espera el aviso.
export function vocesDisponibles() {
  const sintetizador = window.speechSynthesis;
  if (!sintetizador) return Promise.resolve([]);

  const ya = sintetizador.getVoices();
  if (ya.length > 0) return Promise.resolve(ya);

  return new Promise((resolver) => {
    function terminar() {
      sintetizador.removeEventListener('voiceschanged', terminar);
      clearTimeout(limite);
      resolver(sintetizador.getVoices());
    }
    const limite = setTimeout(terminar, ESPERA_MAXIMA_VOCES_MS);
    sintetizador.addEventListener('voiceschanged', terminar);
  });
}

// Una lectura con una voz. Devuelve 'ok' cuando termina o 'sin-inicio' si la voz
// nunca empezó a hablar dentro del tiempo permitido (`esperaInicioMs`).
function leer(texto, voz, volumen, esperaInicioMs) {
  const sintetizador = window.speechSynthesis;
  const lectura = new SpeechSynthesisUtterance(texto);
  lectura.voice = voz;
  lectura.lang = voz?.lang ?? 'es-ES';
  lectura.volume = volumen;

  return new Promise((resolver) => {
    let empezo = false;
    let esperaInicio = null;
    const respaldo = setTimeout(() => resolver('ok'), ESPERA_MAXIMA_LECTURA_MS);
    const terminar = (resultado) => {
      clearTimeout(respaldo);
      clearTimeout(esperaInicio);
      resolver(resultado);
    };

    lectura.onstart = () => {
      empezo = true;
      clearTimeout(esperaInicio);
    };
    lectura.onend = () => terminar('ok');
    lectura.onerror = (evento) => {
      console.warn('KDesk: el navegador no pudo leer la notificación en voz alta:', evento.error);
      terminar('ok');
    };

    if (esperaInicioMs) {
      esperaInicio = setTimeout(() => {
        if (!empezo) {
          sintetizador.cancel();
          terminar('sin-inicio');
        }
      }, esperaInicioMs);
    }

    // Por si el navegador dejó la síntesis en pausa (pasa a veces en pestañas inactivas).
    sintetizador.resume();
    sintetizador.speak(lectura);
  });
}

// Lee un texto en voz alta con la voz elegida (o la recomendada). La promesa
// se cumple cuando termina de hablar.
export async function hablar(texto, { nombreVoz = '', volumen = 0.7 } = {}) {
  if (!window.speechSynthesis || !texto) return;

  const voces = await vocesDisponibles();
  const voz = resolverVoz(voces, nombreVoz);
  const esDeRed = voz && voz.localService === false;

  const resultado = await leer(texto, voz, volumen, esDeRed ? ESPERA_INICIO_VOZ_DE_RED_MS : null);
  if (resultado !== 'sin-inicio') return;

  const local = vocesEnEspanol(voces).find((candidata) => candidata.localService);
  if (local) {
    console.warn(`KDesk: la voz "${voz.name}" no respondió; se lee con "${local.name}".`);
    await leer(texto, local, volumen, null);
  }
}

export function cancelarLectura() {
  window.speechSynthesis?.cancel();
}

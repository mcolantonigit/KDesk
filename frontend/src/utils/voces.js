export function detectarNavegador(userAgent = navigator.userAgent) {
  if (/Edg\//.test(userAgent)) return 'edge';
  if (/Chrome\//.test(userAgent)) return 'chrome';
  return 'otro';
}

const sinAcentos = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esEspanol = (voz) => /^es([-_]|$)/i.test(voz.lang);
const esNatural = (voz) => /natural|neural/i.test(voz.name);

// Voces en español para el selector: primero las neuronales ("Natural"), después el resto, por nombre.
export function vocesEnEspanol(voces) {
  return voces
    .filter(esEspanol)
    .sort((a, b) => Number(esNatural(b)) - Number(esNatural(a)) || a.name.localeCompare(b.name, 'es'));
}

// La voz que se usa mientras el usuario no elija otra:
//  - Edge: "Microsoft Gonzalo Online (Natural)".
//  - Chrome: "Google español de Estados Unidos" (la versión "Natural" si hay varias).
// Si no está instalada, cae en la mejor voz en español disponible.
export function elegirVozPorDefecto(voces, navegador = detectarNavegador()) {
  const espanolas = vocesEnEspanol(voces);
  const nombre = (voz) => sinAcentos(voz.name);

  const preferida =
    navegador === 'edge'
      ? espanolas.find((voz) => nombre(voz).includes('gonzalo'))
      : navegador === 'chrome'
        ? espanolas.find((voz) => /google.*espanol.*(estados unidos|united states)/.test(nombre(voz)) && esNatural(voz)) ??
          espanolas.find((voz) => /google.*espanol.*(estados unidos|united states)/.test(nombre(voz)))
        : null;

  return preferida ?? espanolas.find((voz) => /^es-us/i.test(voz.lang) && esNatural(voz)) ?? espanolas[0] ?? null;
}

// La voz elegida por nombre o, si no existe (otro navegador, voz desinstalada), la recomendada.
export function resolverVoz(voces, nombreElegido, navegador = detectarNavegador()) {
  return (nombreElegido && voces.find((voz) => voz.name === nombreElegido)) || elegirVozPorDefecto(voces, navegador);
}

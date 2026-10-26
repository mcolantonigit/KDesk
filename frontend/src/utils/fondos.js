// Fondos que el usuario puede elegir en Configuración → Apariencia.
export const FONDOS = [
  { clave: 'aurora', etiqueta: 'Aurora', descripcion: 'Manchas de color que se mueven muy despacio' },
  { clave: 'rejilla', etiqueta: 'Aurora en la rejilla', descripcion: 'Las luces de la aurora se escapan solo por las líneas de la grilla' },
  { clave: 'luz', etiqueta: 'Grilla con luz', descripcion: 'Grilla quieta y un brillo que sigue al mouse' },
  { clave: 'puntos', etiqueta: 'Puntos', descripcion: 'Malla de puntos con un brillo que respira' },
  { clave: 'grilla', etiqueta: 'Grilla en movimiento', descripcion: 'La grilla animada de siempre' },
  { clave: 'ninguno', etiqueta: 'Sin fondo', descripcion: 'Color liso, sin animación' },
];

export const FONDO_POR_DEFECTO = 'rejilla';

// El fondo a usar: el elegido si es válido; si nunca se eligió ninguno, respeta la
// preferencia vieja (casillero "Fondo animado" apagado = sin fondo); si no, el de por defecto.
export function resolverFondo(guardado, animadoAnterior) {
  if (FONDOS.some((fondo) => fondo.clave === guardado)) return guardado;
  if (animadoAnterior === false) return 'ninguno';
  return FONDO_POR_DEFECTO;
}

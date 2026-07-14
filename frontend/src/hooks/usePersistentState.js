import { useState } from 'react';

function leerValorGuardado(key, valorInicial) {
  try {
    const guardado = window.localStorage.getItem(key);
    return guardado !== null ? JSON.parse(guardado) : valorInicial;
  } catch {
    return valorInicial;
  }
}

export function usePersistentState(key, valorInicial) {
  const [valor, setValor] = useState(() => leerValorGuardado(key, valorInicial));

  function actualizar(nuevoValor) {
    setValor((anterior) => {
      const siguiente = typeof nuevoValor === 'function' ? nuevoValor(anterior) : nuevoValor;
      try {
        window.localStorage.setItem(key, JSON.stringify(siguiente));
      } catch {
        // localStorage no disponible (modo privado, cuota llena, etc.): seguimos solo en memoria
      }
      return siguiente;
    });
  }

  return [valor, actualizar];
}

import { usePersistentState } from './usePersistentState';
import { combinarPreferencias } from '../utils/alertas';

// Preferencias de las alertas (popup, sonido y voz por tipo de notificación),
// guardadas en el navegador: las voces dependen del navegador y de la PC.
export function usePreferenciasAlertas() {
  const [guardadas, setGuardadas] = usePersistentState('kdesk:alertas:preferencias', {});

  const preferencias = combinarPreferencias(guardadas);

  function cambiar(cambios) {
    setGuardadas((anteriores) => ({ ...anteriores, ...cambios }));
  }

  function cambiarOpcionDeTipo(tipo, opcion, valor) {
    setGuardadas((anteriores) => ({
      ...anteriores,
      tipos: {
        ...anteriores.tipos,
        [tipo]: { ...anteriores.tipos?.[tipo], [opcion]: valor },
      },
    }));
  }

  return {
    preferencias,
    setActivas: (activas) => cambiar({ activas }),
    setVolumen: (volumen) => cambiar({ volumen }),
    setVoz: (voz) => cambiar({ voz }),
    cambiarOpcionDeTipo,
    restablecer: () => setGuardadas({}),
  };
}

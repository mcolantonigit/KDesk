import { useEffect, useRef } from 'react';
import '../styles/FondoApp.css';

// Fondo de la aplicación. Con `contenido` se dibuja dentro de su contenedor (las
// vistas previas de Apariencia); sin él, ocupa toda la pantalla detrás de todo.
function FondoApp({ tipo, contenido = false }) {
  const ref = useRef(null);

  // "Grilla con luz": el brillo sigue al mouse (limitado a un cuadro por vez).
  useEffect(() => {
    const fondo = ref.current;
    if (tipo !== 'luz' || !fondo) return undefined;

    const escuchado = contenido ? fondo.parentElement : window;
    let cuadro = null;

    function mover(evento) {
      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = null;
        const { left, top } = contenido ? fondo.getBoundingClientRect() : { left: 0, top: 0 };
        fondo.style.setProperty('--luz-x', `${evento.clientX - left}px`);
        fondo.style.setProperty('--luz-y', `${evento.clientY - top}px`);
      });
    }

    escuchado.addEventListener('pointermove', mover);
    return () => {
      escuchado.removeEventListener('pointermove', mover);
      if (cuadro) cancelAnimationFrame(cuadro);
    };
  }, [tipo, contenido]);

  if (tipo === 'ninguno') return null;

  return (
    <div ref={ref} className={`fondo fondo-${tipo}${contenido ? ' fondo-contenido' : ''}`} aria-hidden="true">
      {tipo === 'aurora' && (
        <>
          <span />
          <span />
          <span />
        </>
      )}
      {tipo === 'rejilla' && (
        <>
          <span />
          <span />
          <span />
          <span />
        </>
      )}
      {(tipo === 'luz' || tipo === 'puntos') && <span />}
    </div>
  );
}

export default FondoApp;

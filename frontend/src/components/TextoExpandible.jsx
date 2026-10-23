import { useLayoutEffect, useRef, useState } from 'react';
import '../styles/TextoExpandible.css';

// Muestra un texto largo recortado a unas pocas líneas (con "…") y, solo si
// realmente se recorta, un botón para expandirlo o volver a acotarlo.
function TextoExpandible({ texto, lineas = 4 }) {
  const ref = useRef(null);
  const [expandido, setExpandido] = useState(false);
  const [seRecorta, setSeRecorta] = useState(false);

  useLayoutEffect(() => {
    const elemento = ref.current;
    if (elemento && !expandido) {
      setSeRecorta(elemento.scrollHeight > elemento.clientHeight + 1);
    }
  }, [texto, expandido]);

  return (
    <div className="texto-expandible">
      <p
        ref={ref}
        className={expandido ? 'expandido' : ''}
        style={expandido ? undefined : { WebkitLineClamp: lineas }}
      >
        {texto}
      </p>
      {(seRecorta || expandido) && (
        <button type="button" className="texto-expandible-boton" onClick={() => setExpandido(!expandido)}>
          {expandido ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}

export default TextoExpandible;

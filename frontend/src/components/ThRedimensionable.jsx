import { useRef, useState } from 'react';
import '../styles/ThRedimensionable.css';

const PASO_TECLADO = 12;
const TIPO_ARRASTRE = 'application/x-kdesk-columna';

// Encabezado de tabla con dos gestos sobre la columna:
//  - Tirador en el borde derecho para ajustar el ancho: arrastrando con el
//    mouse, con las flechas (cuando tiene el foco) o con doble clic para
//    volver al ancho por defecto.
//  - Arrastrar el encabezado sobre otro para cambiar el orden de las columnas
//    (`onMover(claveOrigen, claveDestino, despues)`; si no se pasa, no se arrastra).
// El clic sobre el encabezado (`onClick`) sigue sirviendo, por ejemplo, para ordenar.
function ThRedimensionable({ clave, etiqueta, ancho, onResize, onReset, onMover, onClick, className, children }) {
  const thRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [soltarEn, setSoltarEn] = useState(null);

  function handlePointerDown(event) {
    event.preventDefault();
    event.stopPropagation();

    // Mientras se ajusta el ancho, el encabezado no debe iniciar el arrastre de la columna.
    const th = thRef.current;
    if (th) th.draggable = false;

    const inicioX = event.clientX;
    const anchoInicial = ancho;

    function mover(evento) {
      onResize(anchoInicial + evento.clientX - inicioX);
    }

    function soltar() {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      document.body.classList.remove('redimensionando-columna');
      if (th) th.draggable = Boolean(onMover);
    }

    document.body.classList.add('redimensionando-columna');
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onResize(ancho - PASO_TECLADO);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onResize(ancho + PASO_TECLADO);
    }
  }

  function esArrastreDeColumna(event) {
    return Array.from(event.dataTransfer?.types ?? []).includes(TIPO_ARRASTRE);
  }

  function handleDragStart(event) {
    event.dataTransfer.setData(TIPO_ARRASTRE, clave);
    event.dataTransfer.effectAllowed = 'move';
    setArrastrando(true);
  }

  function handleDragEnd() {
    setArrastrando(false);
    setSoltarEn(null);
  }

  function handleDragOver(event) {
    if (!onMover || !esArrastreDeColumna(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const { left, width } = event.currentTarget.getBoundingClientRect();
    setSoltarEn(event.clientX > left + width / 2 ? 'despues' : 'antes');
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setSoltarEn(null);
  }

  function handleDrop(event) {
    if (!onMover || !esArrastreDeColumna(event)) return;
    event.preventDefault();
    const desde = event.dataTransfer.getData(TIPO_ARRASTRE);
    if (desde) onMover(desde, clave, soltarEn === 'despues');
    setSoltarEn(null);
  }

  const clases = [className, arrastrando && 'th-arrastrando', soltarEn && `th-soltar-${soltarEn}`]
    .filter(Boolean)
    .join(' ');

  return (
    <th
      ref={thRef}
      className={clases || undefined}
      draggable={Boolean(onMover)}
      onClick={onClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      <span
        className="th-redimensionar"
        role="separator"
        aria-orientation="vertical"
        aria-label={`Ajustar el ancho de ${etiqueta}`}
        aria-valuenow={ancho}
        tabIndex={0}
        title="Arrastrá para ajustar el ancho (doble clic: restablecer)"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onReset();
        }}
        onClick={(event) => event.stopPropagation()}
      />
    </th>
  );
}

export default ThRedimensionable;

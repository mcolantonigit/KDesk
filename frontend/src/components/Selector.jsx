import { Children, isValidElement, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEsMovil } from '../hooks/useEsMovil';
import { normalizar } from '../utils/opciones';
import '../styles/Selector.css';

const OPCIONES_PARA_BUSCAR = 9;

// Lo que dicen los <option> hijos, como texto (pueden venir partidos en varios pedazos).
function leerOpciones(hijos) {
  return Children.toArray(hijos)
    .filter(isValidElement)
    .map((opcion) => ({
      valor: String(opcion.props.value ?? ''),
      texto: Children.toArray(opcion.props.children).join(''),
      deshabilitada: Boolean(opcion.props.disabled),
    }));
}

// Reemplazo de <select>: en pantallas anchas es el <select> de siempre. En el celular el
// navegador dibuja la lista de opciones a su manera (y en tamaño enorme); acá, en cambio,
// se abre una hoja desde abajo con filas de un tamaño cómodo y, si son muchas, un buscador.
// Se usa igual que un <select> con sus <option>: onChange recibe { target: { value } }.
function Selector({ children, value, onChange, onClick, className, enLinea = false, ...resto }) {
  const esMovil = useEsMovil();
  // Título de la hoja: se calcula al abrirla, mirando la etiqueta que rodea al campo.
  const [tituloHoja, setTituloHoja] = useState(null);

  if (!esMovil) {
    return (
      <select value={value} onChange={onChange} onClick={onClick} className={className} {...resto}>
        {children}
      </select>
    );
  }

  const opciones = leerOpciones(children);
  const textoActual = opciones.find((opcion) => opcion.valor === String(value ?? ''))?.texto ?? '';

  function abrir(evento) {
    // Dentro de un <label>, el toque se reenvía al <select> y se procesaría dos veces.
    evento.preventDefault();
    onClick?.(evento);
    if (resto.disabled) return;
    const etiqueta = evento.currentTarget.closest('label')?.querySelector('span')?.textContent;
    setTituloHoja(resto['aria-label'] || etiqueta || 'Elegí una opción');
  }

  function alTeclear(evento) {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      abrir(evento);
    }
  }

  function elegir(opcion) {
    if (opcion.deshabilitada) return;
    setTituloHoja(null);
    if (opcion.valor !== String(value ?? '')) onChange?.({ target: { value: opcion.valor } });
  }

  // El <select> sigue ahí para conservar su aspecto y su valor, pero no recibe toques:
  // el toque lo recibe el envoltorio, que abre la hoja en lugar de la lista del navegador.
  return (
    <span
      className={`selector-envoltorio${enLinea ? ' selector-en-linea' : ''}`}
      onClick={abrir}
      onKeyDown={alTeclear}
      role="button"
      tabIndex={resto.disabled ? -1 : 0}
      aria-haspopup="listbox"
      aria-label={`${resto['aria-label'] || 'Elegí una opción'}: ${textoActual}`}
    >
      <select value={value} onChange={() => {}} className={className} {...resto} tabIndex={-1} aria-hidden="true">
        {children}
      </select>
      <span className="selector-capa" aria-hidden="true" />
      {tituloHoja !== null && (
        <HojaDeOpciones
          titulo={tituloHoja}
          opciones={opciones}
          valor={String(value ?? '')}
          onElegir={elegir}
          onCerrar={() => setTituloHoja(null)}
        />
      )}
    </span>
  );
}

function HojaDeOpciones({ titulo, opciones, valor, onElegir, onCerrar }) {
  const [busqueda, setBusqueda] = useState('');
  const conBuscador = opciones.length >= OPCIONES_PARA_BUSCAR;
  const visibles = conBuscador && busqueda ? opciones.filter((opcion) => normalizar(opcion.texto).includes(normalizar(busqueda))) : opciones;

  useEffect(() => {
    function alTeclear(evento) {
      if (evento.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', alTeclear);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onCerrar]);

  // Se dibuja en <body> para no quedar dentro de tarjetas o formularios; igual los toques
  // "suben" por el árbol de React, así que se frenan acá para no abrir la tarjeta de abajo.
  return createPortal(
    <div
      className="selector-fondo"
      onClick={(evento) => {
        evento.stopPropagation();
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="selector-hoja" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="selector-agarre" aria-hidden="true" />
        <p className="selector-titulo">{titulo}</p>

        {conBuscador && (
          <input
            type="search"
            className="selector-buscador"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            aria-label="Buscar opción"
          />
        )}

        <ul role="listbox" aria-label={titulo}>
          {visibles.map((opcion) => (
            <li key={opcion.valor + opcion.texto} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={opcion.valor === valor}
                disabled={opcion.deshabilitada}
                className={opcion.valor === valor ? 'elegida' : ''}
                onClick={() => onElegir(opcion)}
              >
                <span>{opcion.texto}</span>
                {opcion.valor === valor && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
          {visibles.length === 0 && <li className="selector-vacio">Sin resultados</li>}
        </ul>
      </div>
    </div>,
    document.body
  );
}

export default Selector;

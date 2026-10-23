import { useId, useState } from 'react';
import { buscarExacta, filtrarOpciones } from '../utils/opciones';
import '../styles/Combobox.css';

// Reemplaza al <select>: se puede escribir para filtrar, la primera opción
// es la más cercana a lo escrito (resaltada) y solo se puede dejar un valor
// que exista en `options`. `value` es el id elegido ('' si no hay) y
// `onChange` recibe el id nuevo.
function Combobox({ id, label, value, onChange, options, required, placeholder = 'Seleccionar...' }) {
  const idLista = useId();
  const elegida = options.find((opcion) => String(opcion.id) === String(value));
  const nombreElegido = elegida?.nombre ?? '';

  // `texto` es null mientras el usuario no está editando: ahí se muestra el nombre elegido.
  const [texto, setTexto] = useState(null);
  const [abierta, setAbierta] = useState(false);
  const [resaltada, setResaltada] = useState(0);

  const mostrado = texto ?? nombreElegido;
  // Al abrir sin haber escrito nada se ofrece todo el listado, no solo lo que coincide con la selección.
  const visibles = filtrarOpciones(options, texto ?? '');

  function elegir(opcion) {
    onChange(opcion.id);
    setTexto(null);
    setAbierta(false);
  }

  function handleChange(event) {
    setTexto(event.target.value);
    setResaltada(0);
    setAbierta(true);
  }

  function handleBlur() {
    setAbierta(false);
    if (texto === null) return;

    const exacta = buscarExacta(options, texto);
    if (exacta) {
      if (String(exacta.id) !== String(value)) onChange(exacta.id);
    } else if (texto.trim() === '') {
      if (value !== '') onChange('');
    }
    // Si no coincide con nada, se descarta lo escrito y vuelve a mostrarse lo elegido.
    setTexto(null);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setAbierta(true);
      setResaltada((actual) => Math.min(actual + 1, visibles.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setResaltada((actual) => Math.max(actual - 1, 0));
    } else if (event.key === 'Enter' && abierta && visibles[resaltada]) {
      event.preventDefault();
      elegir(visibles[resaltada]);
    } else if (event.key === 'Escape') {
      setAbierta(false);
      setTexto(null);
    }
  }

  return (
    <div className="form-field combobox">
      <label htmlFor={id}>{label}</label>
      <div className="combobox-control">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={abierta}
          aria-controls={idLista}
          aria-autocomplete="list"
          autoComplete="off"
          value={mostrado}
          placeholder={placeholder}
          required={required && !value}
          onChange={handleChange}
          onFocus={() => setAbierta(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <svg className="combobox-flecha" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>

        {abierta && (
          <ul id={idLista} role="listbox" className="combobox-lista">
            {visibles.length === 0 ? (
              <li className="combobox-vacio">Sin resultados</li>
            ) : (
              visibles.map((opcion, indice) => (
                <li
                  key={opcion.id}
                  role="option"
                  aria-selected={indice === resaltada}
                  className={[
                    'combobox-opcion',
                    indice === resaltada && 'resaltada',
                    String(opcion.id) === String(value) && 'elegida',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  // mouseDown (y no click) para elegir antes de que el input pierda el foco.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    elegir(opcion);
                  }}
                  onMouseEnter={() => setResaltada(indice)}
                >
                  {opcion.nombre}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Combobox;

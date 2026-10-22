import { useState } from 'react';
import '../styles/FileInput.css';

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function IconoSubir() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}

function IconoArchivo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

// Campo para elegir un archivo: zona para arrastrar y soltar (o hacer clic).
// `value` es el File elegido (o null) y `onChange` recibe el File o null.
function FileInput({ id, label, value, onChange, accept, hint }) {
  const [arrastrando, setArrastrando] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setArrastrando(false);
    const archivo = event.dataTransfer.files[0];
    if (archivo) onChange(archivo);
  }

  return (
    <div className="form-field file-input">
      <label htmlFor={id}>{label}</label>

      {value ? (
        <div className="file-input-elegido">
          <IconoArchivo />
          <div className="file-input-datos">
            <span className="file-input-nombre">{value.name}</span>
            <span className="file-input-tamano">{formatearTamano(value.size)}</span>
          </div>
          <button type="button" className="file-input-quitar" onClick={() => onChange(null)} aria-label="Quitar archivo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`file-input-zona ${arrastrando ? 'arrastrando' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
        >
          <IconoSubir />
          <span className="file-input-texto">
            Arrastrá un archivo o <span className="file-input-enlace">elegilo desde tu PC</span>
          </span>
          {hint && <span className="file-input-hint">{hint}</span>}
          <input
            id={id}
            type="file"
            accept={accept}
            onChange={(event) => onChange(event.target.files[0] ?? null)}
          />
        </div>
      )}
    </div>
  );
}

export default FileInput;

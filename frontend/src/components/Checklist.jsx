import { useEffect, useRef, useState } from 'react';
import {
  getTareas,
  crearTarea,
  editarTarea,
  completarTarea,
  eliminarTarea,
} from '../services/tareasTecnicas.service';
import '../styles/Checklist.css';

const DESCRIPCION_INICIAL = 'Nueva tarea';

function Checklist({ idTicket }) {
  const [tareas, setTareas] = useState([]);
  const [sinEditar, setSinEditar] = useState(new Set());
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [focoPendiente, setFocoPendiente] = useState(null);
  const inputsRef = useRef({});

  useEffect(() => {
    if (focoPendiente == null) return;
    const input = inputsRef.current[focoPendiente];
    if (input) {
      input.focus();
      setFocoPendiente(null);
    }
  }, [focoPendiente, tareas]);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getTareas(idTicket);
        setTareas(data);
        if (data.length > 0) setMostrar(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [idTicket]);

  async function handleAgregarItem({ enfocar = false } = {}) {
    try {
      const tarea = await crearTarea(idTicket, DESCRIPCION_INICIAL);
      setTareas((anteriores) => [...anteriores, tarea]);
      setSinEditar((anteriores) => new Set(anteriores).add(tarea.id));
      if (enfocar) setFocoPendiente(tarea.id);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleKeyDownTexto(event, tarea) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleGuardarTexto(tarea);
    handleAgregarItem({ enfocar: true });
  }

  function handleTextoLocal(id, descripcion) {
    setTareas((anteriores) => anteriores.map((tarea) => (tarea.id === id ? { ...tarea, descripcion } : tarea)));
    setSinEditar((anteriores) => {
      if (!anteriores.has(id)) return anteriores;
      const siguiente = new Set(anteriores);
      siguiente.delete(id);
      return siguiente;
    });
  }

  async function handleGuardarTexto(tarea) {
    if (!tarea.descripcion.trim()) return;
    try {
      await editarTarea(tarea.id, tarea.descripcion);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCompletar(tarea) {
    try {
      const tareaActualizada = await completarTarea(tarea.id);
      setTareas((anteriores) => anteriores.map((item) => (item.id === tarea.id ? tareaActualizada : item)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminarItem(tarea) {
    try {
      await eliminarTarea(tarea.id);
      setTareas((anteriores) => anteriores.filter((item) => item.id !== tarea.id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminarChecklist() {
    try {
      await Promise.all(tareas.map((tarea) => eliminarTarea(tarea.id)));
      setTareas([]);
      setMostrar(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) return null;

  return (
    <div className="checklist">
      {!mostrar && (
        <button type="button" className="checklist-boton-agregar" onClick={() => setMostrar(true)}>
          Agregar checklist
        </button>
      )}

      {mostrar && (
        <div className="checklist-panel">
          <span className="checklist-titulo">Checklist</span>

          <ul className="checklist-items">
            {tareas.map((tarea) => (
              <li key={tarea.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={tarea.completada}
                  onChange={() => handleCompletar(tarea)}
                />
                <input
                  ref={(el) => {
                    inputsRef.current[tarea.id] = el;
                  }}
                  type="text"
                  className={`checklist-item-texto ${tarea.completada ? 'completada' : ''}`}
                  value={sinEditar.has(tarea.id) ? '' : tarea.descripcion}
                  placeholder={DESCRIPCION_INICIAL}
                  disabled={tarea.completada}
                  onChange={(event) => handleTextoLocal(tarea.id, event.target.value)}
                  onBlur={() => handleGuardarTexto(tarea)}
                  onKeyDown={(event) => handleKeyDownTexto(event, tarea)}
                />
                <button
                  type="button"
                  className="checklist-item-eliminar"
                  onClick={() => handleEliminarItem(tarea)}
                  aria-label="Eliminar item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="checklist-boton-item" onClick={handleAgregarItem}>
            +
          </button>

          {tareas.length > 0 && (
            <button type="button" className="checklist-boton-eliminar-todo" onClick={handleEliminarChecklist}>
              Eliminar checklist
            </button>
          )}

          {error && <p className="checklist-error">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default Checklist;

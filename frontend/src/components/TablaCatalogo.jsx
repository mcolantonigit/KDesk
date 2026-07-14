import { useState } from 'react';
import Button from './Button';
import '../styles/TablaTickets.css';

function TablaCatalogo({ items, onCrear, onEditarNombre, onEditarActivo }) {
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [creando, setCreando] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  async function handleCrear(event) {
    event.preventDefault();
    if (!nombreNuevo.trim()) return;
    setCreando(true);
    try {
      await onCrear(nombreNuevo);
      setNombreNuevo('');
    } finally {
      setCreando(false);
    }
  }

  function handleCambiarActivo(item, activo) {
    if (!activo) {
      const confirmado = window.confirm(
        `¿Desactivar "${item.nombre}"? No se borra de la base de datos (no rompe los tickets ` +
          'que ya lo tengan cargado), pero deja de aparecer como opción en el sistema. Sigue ' +
          'contando en Estadísticas. Podés reactivarlo cuando quieras desde "Mostrar inactivos".'
      );
      if (!confirmado) return;
    }
    onEditarActivo(item.id, activo);
  }

  const itemsVisibles = mostrarInactivos ? items : items.filter((item) => item.activo);

  return (
    <div className="tabla-tickets-contenedor">
      <label className="tabla-catalogo-mostrar-inactivos">
        <input
          type="checkbox"
          checked={mostrarInactivos}
          onChange={(event) => setMostrarInactivos(event.target.checked)}
        />
        Mostrar inactivos
      </label>

      <div className="tabla-tickets-scroll">
        <table className="tabla-tickets tabla-catalogo">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {itemsVisibles.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <input
                    type="text"
                    defaultValue={item.nombre}
                    onBlur={(event) => {
                      if (event.target.value.trim() && event.target.value !== item.nombre) {
                        onEditarNombre(item.id, event.target.value);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={item.activo}
                    onChange={(event) => handleCambiarActivo(item, event.target.checked)}
                  />
                </td>
              </tr>
            ))}
            {itemsVisibles.length === 0 && (
              <tr>
                <td colSpan={3} className="tabla-tickets-vacio">
                  {items.length === 0 ? 'No hay elementos cargados' : 'No hay elementos activos'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form className="tablero-toolbar-fila" onSubmit={handleCrear}>
        <input
          className="tablero-busqueda"
          type="text"
          placeholder="Nombre del nuevo elemento..."
          value={nombreNuevo}
          onChange={(event) => setNombreNuevo(event.target.value)}
        />
        <Button type="submit" disabled={creando}>
          {creando ? 'Agregando...' : 'Agregar'}
        </Button>
      </form>
    </div>
  );
}

export default TablaCatalogo;

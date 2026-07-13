import { useState } from 'react';
import Button from './Button';
import '../styles/TablaTickets.css';

function TablaCatalogo({ items, onCrear, onEditarNombre, onEditarActivo }) {
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [creando, setCreando] = useState(false);

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

  return (
    <div className="tabla-tickets-contenedor">
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
            {items.map((item) => (
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
                    onChange={(event) => onEditarActivo(item.id, event.target.checked)}
                  />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="tabla-tickets-vacio">
                  No hay elementos cargados
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

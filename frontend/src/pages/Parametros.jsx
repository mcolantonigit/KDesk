import { useEffect, useState } from 'react';
import { getSucursales, crearSucursal, editarSucursal } from '../services/sucursales.service';
import { getSectores, crearSector, editarSector } from '../services/sectores.service';
import { getTiposTicket, crearTipoTicket, editarTipoTicket } from '../services/tiposTicket.service';
import { getPrioridades, crearPrioridad, editarPrioridad } from '../services/prioridades.service';
import { getEstados, crearEstado, editarEstado } from '../services/estados.service';
import { usePreferencias } from '../context/PreferenciasContext';
import TablaCatalogo from '../components/TablaCatalogo';
import Button from '../components/Button';
import '../styles/Tablero.css';
import '../styles/Parametros.css';

const CATALOGOS = {
  sucursales: { label: 'Sucursales', getAll: getSucursales, crear: crearSucursal, editar: editarSucursal },
  sectores: { label: 'Sectores', getAll: getSectores, crear: crearSector, editar: editarSector },
  tipos: { label: 'Tipos de ticket', getAll: getTiposTicket, crear: crearTipoTicket, editar: editarTipoTicket },
  prioridades: { label: 'Prioridades', getAll: getPrioridades, crear: crearPrioridad, editar: editarPrioridad },
  estados: { label: 'Estados', getAll: getEstados, crear: crearEstado, editar: editarEstado },
};

function Parametros() {
  const { fondoAnimado, setFondoAnimado } = usePreferencias();
  const [catalogoActivo, setCatalogoActivo] = useState('sucursales');
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const data = await CATALOGOS[catalogoActivo].getAll();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogoActivo]);

  async function handleCrear(nombre) {
    try {
      await CATALOGOS[catalogoActivo].crear(nombre);
      await cargar();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleEditarNombre(id, nombre) {
    try {
      await CATALOGOS[catalogoActivo].editar(id, { nombre });
      await cargar();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleEditarActivo(id, activo) {
    try {
      await CATALOGOS[catalogoActivo].editar(id, { activo });
      await cargar();
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <div className="tablero">
      <h1>Parámetros</h1>

      <label className="parametros-preferencia">
        <input
          type="checkbox"
          checked={fondoAnimado}
          onChange={(event) => setFondoAnimado(event.target.checked)}
        />
        Fondo animado
      </label>

      <div className="tablero-toolbar">
        <div className="tablero-toolbar-fila">
          {Object.entries(CATALOGOS).map(([key, catalogo]) => (
            <Button
              key={key}
              variant={catalogoActivo === key ? 'primary' : 'secondary'}
              type="button"
              onClick={() => setCatalogoActivo(key)}
            >
              {catalogo.label}
            </Button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="ticket-form-error">{error}</p>
      ) : (
        <TablaCatalogo
          items={items}
          onCrear={handleCrear}
          onEditarNombre={handleEditarNombre}
          onEditarActivo={handleEditarActivo}
        />
      )}
    </div>
  );
}

export default Parametros;

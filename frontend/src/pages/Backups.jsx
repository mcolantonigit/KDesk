import { useEffect, useState } from 'react';
import {
  getBackups,
  generarBackupManual,
  urlDescargaBackup,
  restaurarBackup,
  restaurarDesdeArchivo,
  getConfiguracionBackup,
  actualizarConfiguracionBackup,
} from '../services/backups.service';
import FormField from '../components/FormField';
import Button from '../components/Button';
import FileInput from '../components/FileInput';
import '../styles/Tablero.css';
import '../styles/TablaTickets.css';
import '../styles/Backups.css';

const DIAS_SEMANA = [
  { valor: 1, etiqueta: 'Lun' },
  { valor: 2, etiqueta: 'Mar' },
  { valor: 3, etiqueta: 'Mié' },
  { valor: 4, etiqueta: 'Jue' },
  { valor: 5, etiqueta: 'Vie' },
  { valor: 6, etiqueta: 'Sáb' },
  { valor: 0, etiqueta: 'Dom' },
];

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TEXTO_CONFIRMACION_RESTAURAR =
  'Esto reemplaza TODOS los datos actuales por los del backup. Antes de restaurar se genera ' +
  'automáticamente un backup de seguridad del estado actual, por si hay que volver atrás. ' +
  'Esta acción no se puede deshacer directamente.';

function Backups() {
  const [backups, setBackups] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [generandoManual, setGenerandoManual] = useState(false);
  const [restaurandoNombre, setRestaurandoNombre] = useState(null);

  const [automaticoActivo, setAutomaticoActivo] = useState(false);
  const [diasActivos, setDiasActivos] = useState(new Set());
  const [horaAutomatica, setHoraAutomatica] = useState('00:00');
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  const [archivoRestaurar, setArchivoRestaurar] = useState(null);
  const [restaurandoArchivo, setRestaurandoArchivo] = useState(false);

  async function cargarBackups() {
    const data = await getBackups();
    setBackups(data);
  }

  useEffect(() => {
    async function cargar() {
      try {
        const [backupsData, configuracion] = await Promise.all([getBackups(), getConfiguracionBackup()]);
        setBackups(backupsData);
        setAutomaticoActivo(configuracion.backupAutomaticoActivo);
        setDiasActivos(
          new Set(
            configuracion.backupDias
              .split(',')
              .filter((valor) => valor !== '')
              .map(Number)
          )
        );
        setHoraAutomatica(configuracion.backupHora.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  async function handleGenerarManual() {
    setGenerandoManual(true);
    try {
      await generarBackupManual();
      await cargarBackups();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGenerandoManual(false);
    }
  }

  function toggleDia(valor) {
    setDiasActivos((anteriores) => {
      const siguiente = new Set(anteriores);
      if (siguiente.has(valor)) {
        siguiente.delete(valor);
      } else {
        siguiente.add(valor);
      }
      return siguiente;
    });
  }

  async function handleGuardarConfig(event) {
    event.preventDefault();
    setGuardandoConfig(true);
    try {
      await actualizarConfiguracionBackup({
        activo: automaticoActivo,
        dias: [...diasActivos].sort().join(','),
        hora: horaAutomatica,
      });
      window.alert('Configuración guardada');
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardandoConfig(false);
    }
  }

  async function handleRestaurarExistente(backup) {
    const confirmado = window.confirm(`¿Restaurar el sistema desde "${backup.nombreArchivo}"? ${TEXTO_CONFIRMACION_RESTAURAR}`);
    if (!confirmado) return;

    setRestaurandoNombre(backup.nombreArchivo);
    try {
      await restaurarBackup(backup.nombreArchivo);
      await cargarBackups();
      window.alert('Restauración completada');
    } catch (err) {
      window.alert(err.message);
    } finally {
      setRestaurandoNombre(null);
    }
  }

  async function handleRestaurarDesdeArchivo(event) {
    event.preventDefault();
    if (!archivoRestaurar) return;

    const confirmado = window.confirm(
      `¿Restaurar el sistema desde el archivo "${archivoRestaurar.name}"? ${TEXTO_CONFIRMACION_RESTAURAR}`
    );
    if (!confirmado) return;

    setRestaurandoArchivo(true);
    try {
      await restaurarDesdeArchivo(archivoRestaurar);
      await cargarBackups();
      setArchivoRestaurar(null);
      window.alert('Restauración completada');
    } catch (err) {
      window.alert(err.message);
    } finally {
      setRestaurandoArchivo(false);
    }
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;

  return (
    <div className="tablero">
      <h1>Backups</h1>

      <div className="backups-contenido">
        <div className="backups-seccion">
          <h2>Backup manual</h2>
          <p>Genera un backup completo de la base de datos ahora mismo.</p>
          <Button
            type="button"
            className="backups-boton-accion"
            onClick={handleGenerarManual}
            disabled={generandoManual}
          >
            {generandoManual ? 'Generando...' : 'Generar backup'}
          </Button>
        </div>

        <div className="backups-seccion">
          <h2>Backup automático</h2>
          <form onSubmit={handleGuardarConfig} className="backups-config">
            <label className="backups-checkbox">
              <input
                type="checkbox"
                checked={automaticoActivo}
                onChange={(event) => setAutomaticoActivo(event.target.checked)}
              />
              Activar backup automático
            </label>

            <div className="backups-dias">
              {DIAS_SEMANA.map((dia) => (
                <label key={dia.valor} className="backups-dia">
                  <input
                    type="checkbox"
                    checked={diasActivos.has(dia.valor)}
                    onChange={() => toggleDia(dia.valor)}
                  />
                  {dia.etiqueta}
                </label>
              ))}
            </div>

            <FormField
              id="horaAutomatica"
              label="Hora"
              type="time"
              value={horaAutomatica}
              onChange={(event) => setHoraAutomatica(event.target.value)}
            />

            <Button type="submit" className="backups-boton-accion" disabled={guardandoConfig}>
              {guardandoConfig ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </form>
          <p className="backups-nota">
            Los backups automáticos se guardan en el servidor, en la carpeta <code>backend/backups</code>.
          </p>
        </div>

        <div className="backups-seccion">
          <h2>Restaurar desde un archivo</h2>
          <form onSubmit={handleRestaurarDesdeArchivo} className="backups-config">
            <FileInput
              id="archivoRestaurar"
              label="Archivo de backup (.sql)"
              accept=".sql"
              value={archivoRestaurar}
              onChange={setArchivoRestaurar}
            />
            <Button type="submit" variant="secondary" disabled={!archivoRestaurar || restaurandoArchivo}>
              {restaurandoArchivo ? 'Restaurando...' : 'Restaurar desde este archivo'}
            </Button>
          </form>
        </div>

        <div className="backups-seccion">
          <h2>Backups existentes</h2>
          <div className="tabla-tickets-scroll">
            <table className="tabla-tickets">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Tamaño</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.nombreArchivo}>
                    <td>{backup.nombreArchivo}</td>
                    <td>{new Date(backup.fecha).toLocaleString()}</td>
                    <td>{formatearTamano(backup.tamanoBytes)}</td>
                    <td className="backups-acciones">
                      <a href={urlDescargaBackup(backup.nombreArchivo)}>
                        <Button type="button" variant="secondary">
                          Descargar
                        </Button>
                      </a>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleRestaurarExistente(backup)}
                        disabled={restaurandoNombre === backup.nombreArchivo}
                      >
                        {restaurandoNombre === backup.nombreArchivo ? 'Restaurando...' : 'Restaurar'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {backups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="tabla-tickets-vacio">
                      No hay backups todavía
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Backups;

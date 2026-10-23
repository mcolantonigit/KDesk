import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotificaciones } from '../context/NotificacionesContext';
import { usePreferenciasAlertas } from '../hooks/usePreferenciasAlertas';
import { TIPOS_NOTIFICACION } from '../utils/alertas';
import { elegirVozPorDefecto, vocesEnEspanol, detectarNavegador } from '../utils/voces';
import { hablar, vocesDisponibles, cancelarLectura } from '../utils/voz';
import Button from '../components/Button';
import '../styles/Alertas.css';

const ROLES_TECNICOS = [2, 3];
const FRASE_DE_PRUEBA = 'Así suena la voz de las alertas de KDesk.';
const NOMBRES_NAVEGADOR = { edge: 'Edge', chrome: 'Chrome', otro: 'este navegador' };

function nombreConOrigen(voz) {
  return voz.localService === false ? `${voz.name} (en línea)` : voz.name;
}

function Alertas() {
  const { usuario } = useAuth();
  const { probar } = useNotificaciones();
  const { preferencias, setActivas, setVolumen, setVoz, cambiarOpcionDeTipo, restablecer } = usePreferenciasAlertas();
  const [voces, setVoces] = useState([]);
  const [hablando, setHablando] = useState(false);

  const esTecnico = ROLES_TECNICOS.includes(usuario?.id_rol);
  const tipos = TIPOS_NOTIFICACION.filter((tipo) => esTecnico || tipo.clave !== 'ticket_nuevo');
  const navegador = detectarNavegador();

  // Las voces se cargan de forma asíncrona y pueden ir apareciendo de a poco.
  useEffect(() => {
    let activo = true;
    function cargar() {
      vocesDisponibles().then((lista) => activo && setVoces(vocesEnEspanol(lista)));
    }
    cargar();
    window.speechSynthesis?.addEventListener('voiceschanged', cargar);
    return () => {
      activo = false;
      window.speechSynthesis?.removeEventListener('voiceschanged', cargar);
    };
  }, []);

  const recomendada = elegirVozPorDefecto(voces, navegador);
  const eligioUnaQueNoExiste = preferencias.voz && !voces.some((voz) => voz.name === preferencias.voz);

  async function handleEscuchar() {
    cancelarLectura();
    setHablando(true);
    await hablar(FRASE_DE_PRUEBA, { nombreVoz: preferencias.voz, volumen: preferencias.volumen });
    setHablando(false);
  }

  return (
    <div className="alertas">
      <h1>Alertas</h1>
      <p className="alertas-intro">
        Elegí cómo querés enterarte de lo que pasa con tus tickets: un popup abajo a la derecha, un sonido y/o la lectura
        en voz alta. Estas opciones se guardan en este navegador.
      </p>

      <section className="alertas-card">
        <div className="alertas-fila">
          <label className="alertas-interruptor">
            <input type="checkbox" checked={preferencias.activas} onChange={(event) => setActivas(event.target.checked)} />
            <span>Activar las alertas</span>
          </label>
          <Button type="button" variant="secondary" size="sm" onClick={probar}>
            Probar notificación
          </Button>
        </div>

        <label className="alertas-volumen">
          <span>Volumen</span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(preferencias.volumen * 100)}
            onChange={(event) => setVolumen(Number(event.target.value) / 100)}
            aria-label="Volumen"
          />
          <span className="alertas-volumen-valor">{Math.round(preferencias.volumen * 100)}%</span>
        </label>
      </section>

      <section className="alertas-card">
        <h2>Qué notificaciones querés recibir</h2>
        <table className="alertas-tabla">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Popup</th>
              <th>Sonido</th>
              <th>Voz</th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((tipo) => (
              <tr key={tipo.clave}>
                <td>
                  <strong>{tipo.etiqueta}</strong>
                  <span className="alertas-descripcion">{tipo.descripcion}</span>
                </td>
                {['popup', 'sonido', 'voz'].map((opcion) => (
                  <td key={opcion}>
                    <input
                      type="checkbox"
                      checked={preferencias.tipos[tipo.clave][opcion]}
                      disabled={!preferencias.activas}
                      onChange={(event) => cambiarOpcionDeTipo(tipo.clave, opcion, event.target.checked)}
                      aria-label={`${opcion} para ${tipo.etiqueta}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="alertas-card">
        <h2>Voz</h2>
        {voces.length === 0 ? (
          <p className="alertas-aviso">
            No se encontraron voces en español en {NOMBRES_NAVEGADOR[navegador]}. Las alertas siguen mostrando el popup y
            el sonido, pero no se podrán leer en voz alta.
          </p>
        ) : (
          <>
            <div className="alertas-fila">
              <label className="alertas-voz">
                <span>Voz que lee las alertas</span>
                <select value={preferencias.voz} onChange={(event) => setVoz(event.target.value)}>
                  <option value="">
                    Recomendada para {NOMBRES_NAVEGADOR[navegador]}
                    {recomendada ? ` — ${recomendada.name}` : ''}
                  </option>
                  {voces.map((voz) => (
                    <option key={voz.name} value={voz.name}>
                      {nombreConOrigen(voz)}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={handleEscuchar} disabled={hablando}>
                {hablando ? 'Leyendo...' : 'Escuchar prueba'}
              </Button>
            </div>
            {eligioUnaQueNoExiste && (
              <p className="alertas-aviso">
                La voz que elegiste ("{preferencias.voz}") no está disponible en este navegador; se usa la recomendada.
              </p>
            )}
            <p className="alertas-nota">
              Las voces "Natural" suenan mejor. Las "en línea" necesitan internet; si no responden, se usa una voz instalada
              en la PC.
            </p>
          </>
        )}
      </section>

      <div className="alertas-pie">
        <Button type="button" variant="secondary" size="sm" onClick={restablecer}>
          Restablecer valores
        </Button>
      </div>
    </div>
  );
}

export default Alertas;

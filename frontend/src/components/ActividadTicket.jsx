import { useState } from 'react';
import FormField from './FormField';
import AdjuntoInput from './AdjuntoInput';
import Button from './Button';
import '../styles/DetalleTicket.css';
import { formatearFechaHora } from '../utils/fechas';
import { API } from '../utils/api';

// Panel con pestañas Comentarios / Historial de un ticket. Es el mismo en la
// página de detalle y en el panel lateral. `conHistorial` en false oculta la
// pestaña Historial (el panel lateral solo muestra comentarios).
function ActividadTicket({
  comentarios,
  historial = [],
  conHistorial = true,
  usuario,
  esTecnico,
  yaCerrado,
  onAgregarComentario,
  onEliminarComentario,
}) {
  const [pestana, setPestana] = useState('comentarios');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [adjuntoComentario, setAdjuntoComentario] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [historialVisibles, setHistorialVisibles] = useState(10);

  const historialOrdenado = [...historial].reverse();
  const historialMostrado = historialOrdenado.slice(0, historialVisibles);

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);
    const publicado = await onAgregarComentario(nuevoComentario, adjuntoComentario);
    if (publicado !== false) {
      setNuevoComentario('');
      setAdjuntoComentario(null);
    }
    setEnviando(false);
  }

  return (
    <div className="detalle-ticket-actividad">
      {/* Con una sola sección (sin historial) un encabezado de pestañas no aporta nada. */}
      {conHistorial && (
        <div className="detalle-ticket-pestanas" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={pestana === 'comentarios'}
            className={pestana === 'comentarios' ? 'activa' : ''}
            onClick={() => setPestana('comentarios')}
          >
            Comentarios ({comentarios.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pestana === 'historial'}
            className={pestana === 'historial' ? 'activa' : ''}
            onClick={() => setPestana('historial')}
          >
            Historial
          </button>
        </div>
      )}

      {pestana === 'comentarios' || !conHistorial ? (
        <div className="detalle-ticket-comentarios" role="tabpanel">
          <ul className="detalle-ticket-comentarios-lista">
            {comentarios.map((comentario) => (
              <li key={comentario.id}>
                <div className="detalle-ticket-comentario-cabecera">
                  <strong>
                    {comentario.autor_nombre} {comentario.autor_apellido}
                  </strong>
                  <span>{formatearFechaHora(comentario.fecha_creacion)}</span>
                  {!comentario.eliminado && (comentario.id_autor === usuario?.id || esTecnico) && (
                    <button
                      type="button"
                      className="detalle-ticket-comentario-eliminar"
                      onClick={() => onEliminarComentario(comentario)}
                      aria-label="Eliminar comentario"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p>{comentario.eliminado ? 'Comentario eliminado' : comentario.contenido}</p>
                {comentario.adjuntos?.length > 0 && (
                  <ul className="detalle-ticket-adjuntos-lista">
                    {comentario.adjuntos.map((adjunto) => (
                      <li key={adjunto.id}>
                        <a href={`${API}/api/adjuntos/${adjunto.id}/descargar`}>{adjunto.nombre_archivo}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {comentarios.length === 0 && <li className="detalle-ticket-comentarios-vacio">Sin comentarios todavía</li>}
          </ul>

          {!yaCerrado && (
            <form className="detalle-ticket-nuevo-comentario" onSubmit={handleSubmit}>
              <FormField
                id="nuevoComentario"
                label="Agregar comentario"
                type="textarea"
                placeholder="Escribí un comentario…"
                rows={2}
                value={nuevoComentario}
                onChange={(event) => setNuevoComentario(event.target.value)}
                required
              />
              <AdjuntoInput
                id="adjuntoComentario"
                label="Adjunto (opcional)"
                compacto
                value={adjuntoComentario}
                onChange={setAdjuntoComentario}
              />
              <Button type="submit" size="sm" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Comentar'}
              </Button>
            </form>
          )}
        </div>
      ) : (
        <div className="detalle-ticket-historial" role="tabpanel">
          <ul className="detalle-ticket-historial-lista">
            {historialMostrado.map((evento) => (
              <li key={evento.id}>
                <span className="detalle-ticket-historial-detalle">{evento.detalle}</span>
                <span className="detalle-ticket-historial-fecha">{formatearFechaHora(evento.fecha)}</span>
              </li>
            ))}
            {historial.length === 0 && <li className="detalle-ticket-comentarios-vacio">Sin eventos registrados</li>}
          </ul>
          {historialVisibles < historialOrdenado.length && (
            <button
              type="button"
              className="detalle-ticket-historial-cargar-mas"
              onClick={() => setHistorialVisibles((anteriores) => anteriores + 10)}
            >
              Cargar 10 más
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ActividadTicket;

import { useEffect, useMemo, useState } from 'react';
import { getAuditoria } from '../services/auditoria.service';
import { getUsuarios } from '../services/usuarios.service';
import '../styles/TablaTickets.css';

function Auditoria() {
  const [eventos, setEventos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const [eventosData, usuariosData] = await Promise.all([getAuditoria(), getUsuarios()]);
        setEventos(eventosData);
        setUsuarios(usuariosData);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  const usuariosPorId = useMemo(() => Object.fromEntries(usuarios.map((usuario) => [usuario.id, usuario])), [usuarios]);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="ticket-form-error">{error}</p>;

  return (
    <div className="tablero">
      <h1>Auditoría</h1>

      <div className="tabla-tickets-scroll">
        <table className="tabla-tickets tabla-catalogo">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => {
              const usuario = usuariosPorId[evento.id_usuario];
              return (
                <tr key={evento.id}>
                  <td>{new Date(evento.fecha).toLocaleString()}</td>
                  <td>{usuario ? `${usuario.nombre} ${usuario.apellido}` : `#${evento.id_usuario}`}</td>
                  <td>{evento.accion}</td>
                  <td>{evento.detalle}</td>
                </tr>
              );
            })}
            {eventos.length === 0 && (
              <tr>
                <td colSpan={4} className="tabla-tickets-vacio">
                  Sin eventos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Auditoria;

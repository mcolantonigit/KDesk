import { pool } from '../config/db.js';

// Eventos del historial que generan una notificación, y a quién le llegan:
//  - CREACION: a técnicos y administradores.
//  - CAMBIO_RESPONSABLE: al técnico que quedó como responsable.
//  - COMENTARIO, CAMBIO_ESTADO y CIERRE: al creador y al responsable del ticket.
// Nunca se le notifica a alguien una acción que hizo él mismo.
export async function findParaUsuario({ idUsuario, esTecnico, despuesDe, limite }) {
  const result = await pool.query(
    `SELECT h.id, h.evento, h.detalle, h.fecha, h.id_ticket,
            t.numero, t.titulo,
            u.nombre AS actor_nombre, u.apellido AS actor_apellido
     FROM historial_ticket h
     JOIN tickets t ON t.id = h.id_ticket
     LEFT JOIN usuarios u ON u.id = h.id_usuario
     WHERE h.id > $1
       AND h.id_usuario IS DISTINCT FROM $2
       AND (
         (h.evento = 'CREACION' AND $3::boolean)
         OR (h.evento = 'CAMBIO_RESPONSABLE' AND t.id_tecnico_responsable = $2)
         OR (h.evento IN ('COMENTARIO', 'CAMBIO_ESTADO', 'CIERRE')
             AND (t.id_usuario_creador = $2 OR t.id_tecnico_responsable = $2))
       )
     ORDER BY h.id DESC
     LIMIT $4`,
    [despuesDe, idUsuario, esTecnico, limite]
  );
  return result.rows;
}

export async function findUltimoId() {
  const result = await pool.query('SELECT COALESCE(MAX(id), 0)::int AS ultimo FROM historial_ticket');
  return result.rows[0].ultimo;
}

export async function getTickets() {
  const response = await fetch('/api/tickets', { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los tickets');
  }

  return data;
}

export async function getTicketById(id) {
  const response = await fetch(`/api/tickets/${id}`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener el ticket');
  }

  return data;
}

export async function crearTicket({ idTipo, idPrioridadSugerida, titulo, descripcion }) {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idTipo, idPrioridadSugerida, titulo, descripcion }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear el ticket');
  }

  return data;
}

export async function cerrarTicket(id, comentario) {
  const response = await fetch(`/api/tickets/${id}/cerrar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ comentario }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cerrar el ticket');
  }

  return data;
}

export async function cambiarEstado(id, idEstado) {
  const response = await fetch(`/api/tickets/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idEstado }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar el estado');
  }

  return data;
}

export async function cambiarPrioridad(id, idPrioridad) {
  const response = await fetch(`/api/tickets/${id}/prioridad`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idPrioridad }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar la prioridad');
  }

  return data;
}

export async function asignarResponsable(id, idTecnicoResponsable) {
  const response = await fetch(`/api/tickets/${id}/responsable`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idTecnicoResponsable }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo asignar el responsable');
  }

  return data;
}

export async function getComentarios(idTicket) {
  const response = await fetch(`/api/tickets/${idTicket}/comentarios`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los comentarios');
  }

  return data;
}

export async function eliminarComentario(idComentario) {
  const response = await fetch(`/api/comentarios/${idComentario}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar el comentario');
  }

  return data;
}

export async function crearComentario(idTicket, contenido) {
  const response = await fetch(`/api/tickets/${idTicket}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ contenido }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo agregar el comentario');
  }

  return data;
}

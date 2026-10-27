import { API } from '../utils/api';

async function subirAdjunto(url, archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo subir el adjunto');
  }

  return data;
}

export async function subirAdjuntoDeTicket(idTicket, archivo) {
  return subirAdjunto(`${API}/api/tickets/${idTicket}/adjuntos`, archivo);
}

export async function subirAdjuntoDeComentario(idComentario, archivo) {
  return subirAdjunto(`${API}/api/comentarios/${idComentario}/adjuntos`, archivo);
}

export async function getAdjuntosDeTicket(idTicket) {
  const response = await fetch(`${API}/api/tickets/${idTicket}/adjuntos`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los adjuntos');
  }

  return data;
}

export async function getAdjuntosDeComentario(idComentario) {
  const response = await fetch(`${API}/api/comentarios/${idComentario}/adjuntos`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los adjuntos del comentario');
  }

  return data;
}

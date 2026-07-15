export async function login({ correo, password }) {
  const response = await fetch('/api/usuarios/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ correo, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo iniciar sesión');
  }

  return data.usuario;
}

export async function register({ nombre, apellido, correo, password, idRol, idSucursal, idSector }) {
  const response = await fetch('/api/usuarios/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, correo, password, idRol, idSucursal, idSector }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo registrar el usuario');
  }

  return data;
}

export async function activarCuenta(token) {
  const response = await fetch('/api/usuarios/activar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo activar la cuenta');
  }

  return data;
}

export async function solicitarResetPassword(correo) {
  const response = await fetch('/api/usuarios/recuperar-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo procesar la solicitud');
  }

  return data;
}

export async function resetearPassword({ token, passwordNueva, confirmacion }) {
  const response = await fetch('/api/usuarios/resetear-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, passwordNueva, confirmacion }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo restablecer la contraseña');
  }

  return data;
}

export async function getPerfil() {
  const response = await fetch('/api/usuarios/perfil', { credentials: 'include' });

  if (response.status === 401) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener el perfil');
  }

  return data;
}

export async function getUsuarios() {
  const response = await fetch('/api/usuarios', { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los usuarios');
  }

  return data;
}

export async function cambiarRolUsuario(id, idRol) {
  const response = await fetch(`/api/usuarios/${id}/rol`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idRol }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar el rol');
  }

  return data;
}

export async function cambiarPassword({ passwordActual, passwordNueva, confirmacion }) {
  const response = await fetch('/api/usuarios/perfil/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ passwordActual, passwordNueva, confirmacion }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar la contraseña');
  }

  return data;
}

export async function cambiarEstadoActivo(id, activo) {
  const response = await fetch(`/api/usuarios/${id}/activo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ activo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar el estado del usuario');
  }

  return data;
}

export async function blanquearPassword(id, passwordNueva) {
  const response = await fetch(`/api/usuarios/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ passwordNueva }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo blanquear la contraseña');
  }

  return data;
}

export async function logout() {
  const response = await fetch('/api/usuarios/logout', {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cerrar sesión');
  }

  return data;
}

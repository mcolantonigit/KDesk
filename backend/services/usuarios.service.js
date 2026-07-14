import * as usuariosModel from '../models/usuarios.model.js';
import * as auditoriaService from './auditoria.service.js';
import { hashPassword, compararPassword } from '../utils/password.util.js';
import { generarToken } from '../utils/jwt.util.js';

const DOMINIOS_CORREO_PERMITIDOS = ['@kalop.com.ar', '@ergoscables.com.ar', '@kalop.cl'];

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function getUsuarios() {
  return usuariosModel.findAll();
}

export async function getUsuarioById(id) {
  return usuariosModel.findById(id);
}

export async function registrarUsuario({ nombre, apellido, correo, password, idRol, idSucursal, idSector }) {
  if (!DOMINIOS_CORREO_PERMITIDOS.some((dominio) => correo.endsWith(dominio))) {
    throw crearError(`El correo debe pertenecer a alguno de estos dominios: ${DOMINIOS_CORREO_PERMITIDOS.join(', ')}`, 400);
  }

  const usuarioExistente = await usuariosModel.findByCorreo(correo);
  if (usuarioExistente) {
    throw crearError('Ya existe un usuario registrado con ese correo', 409);
  }

  const passwordHash = await hashPassword(password);

  const usuario = await usuariosModel.create({ nombre, apellido, correo, passwordHash, idRol, idSucursal, idSector });

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'REGISTRO',
    detalle: `Alta de usuario (${usuario.correo})`,
  });

  return usuario;
}

export async function autenticarUsuario({ correo, password }) {
  const usuario = await usuariosModel.findByCorreo(correo);
  if (!usuario) {
    throw crearError('Correo o contraseña incorrectos', 401);
  }

  const passwordValida = await compararPassword(password, usuario.password_hash);
  if (!passwordValida) {
    throw crearError('Correo o contraseña incorrectos', 401);
  }

  const { password_hash, ...usuarioSinPassword } = usuario;

  const token = generarToken({ id: usuario.id, correo: usuario.correo, idRol: usuario.id_rol });

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'LOGIN',
    detalle: `Inicio de sesión (${usuario.correo})`,
  });

  return { token, usuario: usuarioSinPassword };
}

export async function cambiarPassword({ id, correo, passwordActual, passwordNueva, confirmacion }) {
  if (passwordNueva !== confirmacion) {
    throw crearError('La nueva contraseña y su confirmación no coinciden', 400);
  }

  const passwordHashActual = await usuariosModel.findPasswordHashById(id);
  if (!passwordHashActual) {
    throw crearError('Usuario no encontrado', 404);
  }

  const passwordActualValida = await compararPassword(passwordActual, passwordHashActual);
  if (!passwordActualValida) {
    throw crearError('La contraseña actual es incorrecta', 401);
  }

  const passwordHashNuevo = await hashPassword(passwordNueva);
  await usuariosModel.updatePassword(id, passwordHashNuevo);

  await auditoriaService.registrarEvento({
    idUsuario: id,
    accion: 'CAMBIO_PASSWORD',
    detalle: `Cambio de contraseña (${correo})`,
  });
}

const ROLES_ASIGNABLES = [1, 2];

export async function cambiarRolUsuario({ id, idRol, idUsuarioQueCambia }) {
  if (!ROLES_ASIGNABLES.includes(Number(idRol))) {
    throw crearError('El rol debe ser usuario o técnico', 400);
  }

  const usuario = await usuariosModel.findById(id);
  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }

  const usuarioActualizado = await usuariosModel.updateRol(id, idRol);

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioQueCambia,
    accion: 'CAMBIO_ROL',
    detalle: `Cambio de rol de ${usuario.correo} -> id_rol ${idRol}`,
  });

  return usuarioActualizado;
}

export async function blanquearPassword({ id, passwordNueva, idUsuarioQueBlanquea }) {
  const usuario = await usuariosModel.findById(id);
  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }
  if (!passwordNueva || passwordNueva.length < 8) {
    throw crearError('La nueva contraseña debe tener al menos 8 caracteres', 400);
  }

  const passwordHash = await hashPassword(passwordNueva);
  await usuariosModel.updatePassword(id, passwordHash);

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioQueBlanquea,
    accion: 'BLANQUEO_PASSWORD',
    detalle: `Blanqueo de contraseña de ${usuario.correo}`,
  });
}

export async function cerrarSesion({ id, correo }) {
  await auditoriaService.registrarEvento({
    idUsuario: id,
    accion: 'LOGOUT',
    detalle: `Cierre de sesión (${correo})`,
  });
}

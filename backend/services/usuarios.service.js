import * as usuariosModel from '../models/usuarios.model.js';
import * as auditoriaService from './auditoria.service.js';
import { hashPassword, compararPassword } from '../utils/password.util.js';
import { generarToken } from '../utils/jwt.util.js';

const DOMINIO_CORREO_PERMITIDO = '@kalop.com.ar';

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
  if (!correo.endsWith(DOMINIO_CORREO_PERMITIDO)) {
    throw crearError(`El correo debe pertenecer al dominio ${DOMINIO_CORREO_PERMITIDO}`, 400);
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

export async function cerrarSesion({ id, correo }) {
  await auditoriaService.registrarEvento({
    idUsuario: id,
    accion: 'LOGOUT',
    detalle: `Cierre de sesión (${correo})`,
  });
}

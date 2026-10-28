import * as usuariosModel from '../models/usuarios.model.js';
import * as tokensVerificacionModel from '../models/tokensVerificacion.model.js';
import * as auditoriaService from './auditoria.service.js';
import { hashPassword, compararPassword } from '../utils/password.util.js';
import { generarToken as generarTokenJWT } from '../utils/jwt.util.js';
import { generarToken as generarTokenAleatorio, hashearToken } from '../utils/tokens.util.js';
import { enviarMailActivacion, enviarMailResetPassword } from '../utils/mailer.util.js';

const DOMINIOS_CORREO_PERMITIDOS = (process.env.ALLOWED_EMAIL_DOMAINS ?? '')
  .split(',')
  .map((dominio) => dominio.trim())
  .filter(Boolean)
  .map((dominio) => `@${dominio}`);
const HORAS_EXPIRACION_ACTIVACION = 24;
const HORAS_EXPIRACION_RESET = 1;

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function horasDesdeAhora(horas) {
  return new Date(Date.now() + horas * 60 * 60 * 1000);
}

export async function getUsuarios() {
  return usuariosModel.findAll();
}

export async function getUsuarioById(id) {
  return usuariosModel.findById(id);
}

const ROL_USUARIO = 1;
const { SIN_PASSWORD } = usuariosModel;

export async function registrarUsuario({ nombre, apellido, correo, password, idSucursal, idSector }) {
  const idRol = ROL_USUARIO;
  if (!DOMINIOS_CORREO_PERMITIDOS.some((dominio) => correo.endsWith(dominio))) {
    throw crearError(`El correo debe pertenecer a alguno de estos dominios: ${DOMINIOS_CORREO_PERMITIDOS.join(', ')}`, 400);
  }

  const usuarioExistente = await usuariosModel.findByCorreo(correo);
  if (usuarioExistente) {
    throw crearError('Ya existe un usuario registrado con ese correo', 409);
  }

  const passwordHash = await hashPassword(password);

  const usuario = await usuariosModel.create({ nombre, apellido, correo, passwordHash, idRol, idSucursal, idSector });

  try {
    await crearYEnviarTokenActivacion(usuario);
  } catch (error) {
    await usuariosModel.deleteById(usuario.id);
    throw crearError('No se pudo enviar el mail de activación. Intentá registrarte de nuevo en unos minutos.', 500);
  }

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'REGISTRO',
    detalle: `Alta de usuario (${usuario.correo})`,
  });

  return usuario;
}

async function crearYEnviarTokenActivacion(usuario) {
  const tokenActivacion = generarTokenAleatorio();
  await tokensVerificacionModel.create({
    idUsuario: usuario.id,
    tokenHash: hashearToken(tokenActivacion),
    tipo: 'ACTIVACION',
    fechaExpiracion: horasDesdeAhora(HORAS_EXPIRACION_ACTIVACION),
  });
  await enviarMailActivacion({ correo: usuario.correo, nombre: usuario.nombre, token: tokenActivacion });
}

export async function reenviarActivacion(correo) {
  const usuario = await usuariosModel.findByCorreo(correo);
  if (!usuario) {
    throw crearError('No existe una cuenta registrada con ese correo', 404);
  }
  if (usuario.email_verificado) {
    throw crearError('Esta cuenta ya está activada', 400);
  }
  if (usuario.activacion_reenviada) {
    throw crearError('El correo de activación ya fue reenviado. Contactá a un administrador si seguís sin poder activar la cuenta.', 400);
  }

  await tokensVerificacionModel.invalidarPendientes(usuario.id, 'ACTIVACION');

  try {
    await crearYEnviarTokenActivacion(usuario);
  } catch (error) {
    throw crearError('No se pudo reenviar el mail de activación. Intentá de nuevo en unos minutos.', 500);
  }

  await usuariosModel.marcarReenvioActivacion(usuario.id);

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'REENVIO_ACTIVACION',
    detalle: `Reenvío de mail de activación (${usuario.correo})`,
  });
}

export async function activarCuenta(token) {
  const registro = await tokensVerificacionModel.findByTokenHash(hashearToken(token), 'ACTIVACION');
  if (!registro) {
    throw crearError('El link de activación no es válido', 400);
  }
  if (registro.usado) {
    throw crearError('Este link de activación ya fue usado', 400);
  }
  if (new Date(registro.fecha_expiracion) < new Date()) {
    throw crearError('El link de activación venció. Contactá a un administrador para que te reenvíe uno', 400);
  }

  const usuario = await usuariosModel.marcarEmailVerificado(registro.id_usuario);
  await tokensVerificacionModel.marcarUsado(registro.id);

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'ACTIVACION_CUENTA',
    detalle: `Cuenta activada (${usuario.correo})`,
  });

  return usuario;
}

export async function solicitarResetPassword(correo) {
  const usuario = await usuariosModel.findByCorreo(correo);
  // Igual que con un correo que no existe: no se avisa nada. Las cuentas de
  // Microsoft 365 no tienen contraseña que recuperar.
  if (!usuario || !usuario.con_password) {
    return;
  }

  const tokenReset = generarTokenAleatorio();
  await tokensVerificacionModel.create({
    idUsuario: usuario.id,
    tokenHash: hashearToken(tokenReset),
    tipo: 'RESET_PASSWORD',
    fechaExpiracion: horasDesdeAhora(HORAS_EXPIRACION_RESET),
  });

  try {
    await enviarMailResetPassword({ correo: usuario.correo, nombre: usuario.nombre, token: tokenReset });
  } catch (error) {
    console.error('No se pudo enviar el mail de recuperación de contraseña:', error.message);
  }
}

export async function resetearPassword({ token, passwordNueva, confirmacion }) {
  if (passwordNueva !== confirmacion) {
    throw crearError('La nueva contraseña y su confirmación no coinciden', 400);
  }
  if (!passwordNueva || passwordNueva.length < 8) {
    throw crearError('La contraseña debe tener al menos 8 caracteres', 400);
  }

  const registro = await tokensVerificacionModel.findByTokenHash(hashearToken(token), 'RESET_PASSWORD');
  if (!registro) {
    throw crearError('El link de recuperación no es válido', 400);
  }
  if (registro.usado) {
    throw crearError('Este link de recuperación ya fue usado', 400);
  }
  if (new Date(registro.fecha_expiracion) < new Date()) {
    throw crearError('El link de recuperación venció, pedí uno nuevo', 400);
  }

  const passwordHash = await hashPassword(passwordNueva);
  await usuariosModel.updatePassword(registro.id_usuario, passwordHash);
  await tokensVerificacionModel.marcarUsado(registro.id);

  const usuario = await usuariosModel.findById(registro.id_usuario);

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'RESET_PASSWORD',
    detalle: `Contraseña restablecida vía recuperación (${usuario.correo})`,
  });
}

export async function autenticarUsuario({ correo, password }) {
  const usuario = await usuariosModel.findByCorreo(correo);
  if (!usuario) {
    throw crearError('Correo o contraseña incorrectos', 401);
  }

  if (usuario.password_hash === SIN_PASSWORD) {
    throw crearError('Esta cuenta entra con Microsoft 365: usá el botón "Entrar con Microsoft"', 401);
  }

  const passwordValida = await compararPassword(password ?? '', usuario.password_hash);
  if (!passwordValida) {
    throw crearError('Correo o contraseña incorrectos', 401);
  }

  if (!usuario.email_verificado) {
    throw crearError('Tenés que activar tu cuenta antes de iniciar sesión. Revisá el mail que te enviamos al registrarte', 403);
  }

  if (!usuario.activo) {
    throw crearError('Tu cuenta está deshabilitada. Contactá a un administrador', 403);
  }

  return iniciarSesion(usuario, `Inicio de sesión (${usuario.correo})`);
}

// Genera el token de sesión y deja el login en la auditoría.
export async function iniciarSesion(usuario, detalleAuditoria) {
  const { password_hash, ...usuarioSinPassword } = usuario;

  const token = generarTokenJWT({ id: usuario.id, correo: usuario.correo, idRol: usuario.id_rol });

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'LOGIN',
    detalle: detalleAuditoria,
  });

  return { token, usuario: usuarioSinPassword };
}

export async function buscarPorCorreo(correo) {
  return usuariosModel.findByCorreo(correo);
}

export async function marcarEmailVerificado(id) {
  return usuariosModel.marcarEmailVerificado(id);
}

// Alta de alguien que entró por primera vez con Microsoft 365: la cuenta ya
// está verificada (Microsoft garantiza el correo) y no tiene contraseña.
export async function crearUsuarioMicrosoft({ nombre, apellido, correo, idSucursal, idSector }) {
  const usuario = await usuariosModel.create({
    nombre,
    apellido,
    correo,
    passwordHash: SIN_PASSWORD,
    idRol: ROL_USUARIO,
    idSucursal,
    idSector,
  });
  const verificado = await usuariosModel.marcarEmailVerificado(usuario.id);

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'REGISTRO',
    detalle: `Alta de usuario con Microsoft 365 (${usuario.correo})`,
  });

  return verificado;
}

const NOMBRE_LONGITUD_MAXIMA = 100;

export async function actualizarPerfil({ id, nombre, apellido }) {
  const nombreLimpio = (nombre ?? '').trim();
  const apellidoLimpio = (apellido ?? '').trim();
  if (!nombreLimpio || !apellidoLimpio) {
    throw crearError('El nombre y el apellido son obligatorios', 400);
  }
  if (nombreLimpio.length > NOMBRE_LONGITUD_MAXIMA || apellidoLimpio.length > NOMBRE_LONGITUD_MAXIMA) {
    throw crearError(`El nombre y el apellido pueden tener hasta ${NOMBRE_LONGITUD_MAXIMA} caracteres`, 400);
  }

  const anterior = await usuariosModel.findById(id);
  if (!anterior) {
    throw crearError('Usuario no encontrado', 404);
  }

  const usuario = await usuariosModel.updateNombreApellido(id, { nombre: nombreLimpio, apellido: apellidoLimpio });

  await auditoriaService.registrarEvento({
    idUsuario: id,
    accion: 'CAMBIO_DATOS_PERFIL',
    detalle: `Nombre: ${anterior.nombre} ${anterior.apellido} -> ${usuario.nombre} ${usuario.apellido} (${usuario.correo})`,
  });

  return usuario;
}

export async function cambiarPassword({ id, correo, passwordActual, passwordNueva, confirmacion }) {
  if (passwordNueva !== confirmacion) {
    throw crearError('La nueva contraseña y su confirmación no coinciden', 400);
  }

  const passwordHashActual = await usuariosModel.findPasswordHashById(id);
  if (!passwordHashActual) {
    throw crearError('Usuario no encontrado', 404);
  }
  if (passwordHashActual === SIN_PASSWORD) {
    throw crearError('Tu cuenta entra con Microsoft 365 y no tiene contraseña', 400);
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

const ROL_ADMINISTRADOR = 3;
const ROLES_ASIGNABLES = [ROL_USUARIO, 2, ROL_ADMINISTRADOR];
const NOMBRES_ROL = { [ROL_USUARIO]: 'usuario', 2: 'técnico', [ROL_ADMINISTRADOR]: 'administrador' };

export async function cambiarRolUsuario({ id, idRol, idUsuarioQueCambia }) {
  const rolNuevo = Number(idRol);
  if (!ROLES_ASIGNABLES.includes(rolNuevo)) {
    throw crearError('El rol debe ser usuario, técnico o administrador', 400);
  }
  if (Number(id) === Number(idUsuarioQueCambia)) {
    throw crearError('No podés cambiar tu propio rol', 400);
  }

  const usuario = await usuariosModel.findById(id);
  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }

  if (usuario.id_rol === ROL_ADMINISTRADOR && rolNuevo !== ROL_ADMINISTRADOR) {
    const otros = await usuariosModel.countOtrosAdministradoresActivos(usuario.id);
    if (otros === 0) {
      throw crearError('Es el único administrador activo: primero dale el rol de administrador a otra persona', 400);
    }
  }

  const usuarioActualizado = await usuariosModel.updateRol(id, rolNuevo);

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioQueCambia,
    accion: 'CAMBIO_ROL',
    detalle: `Cambio de rol de ${usuario.correo} -> ${NOMBRES_ROL[rolNuevo]}`,
  });

  return usuarioActualizado;
}

export async function cambiarEstadoActivo({ id, activo, idUsuarioQueCambia }) {
  const usuario = await usuariosModel.findById(id);
  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }
  if (!activo && Number(id) === Number(idUsuarioQueCambia)) {
    throw crearError('No podés deshabilitar tu propia cuenta', 400);
  }
  if (!activo && usuario.id_rol === ROL_ADMINISTRADOR && (await usuariosModel.countOtrosAdministradoresActivos(usuario.id)) === 0) {
    throw crearError('Es el único administrador activo: no se puede deshabilitar', 400);
  }

  const usuarioActualizado = await usuariosModel.updateActivo(id, activo);

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioQueCambia,
    accion: activo ? 'HABILITAR_USUARIO' : 'DESHABILITAR_USUARIO',
    detalle: `${activo ? 'Habilitación' : 'Deshabilitación'} de usuario (${usuario.correo})`,
  });

  return usuarioActualizado;
}

export async function blanquearPassword({ id, passwordNueva, idUsuarioQueBlanquea }) {
  const usuario = await usuariosModel.findById(id);
  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }
  if (!usuario.con_password) {
    throw crearError('Esta cuenta entra con Microsoft 365 y no tiene contraseña', 400);
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

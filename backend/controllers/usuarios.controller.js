import * as usuariosService from '../services/usuarios.service.js';
import { ponerCookieSesion } from '../utils/sesion.util.js';

export async function getUsuarios(req, res) {
  try {
    const usuarios = await usuariosService.getUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los usuarios' });
  }
}

export async function getUsuarioById(req, res) {
  try {
    const usuario = await usuariosService.getUsuarioById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el usuario' });
  }
}

export async function register(req, res) {
  try {
    // El rol no se toma del pedido: quien se registra solo puede ser "usuario"
    // (los técnicos y administradores los asigna un administrador).
    const { nombre, apellido, correo, password, idSucursal, idSector } = req.body;
    const usuario = await usuariosService.registrarUsuario({
      nombre,
      apellido,
      correo,
      password,
      idSucursal,
      idSector,
    });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo registrar el usuario' });
  }
}

export async function reenviarActivacion(req, res) {
  try {
    const { correo } = req.body;
    await usuariosService.reenviarActivacion(correo);
    res.json({ message: 'Te reenviamos el correo de activación' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo reenviar el correo de activación' });
  }
}

export async function getPerfil(req, res) {
  try {
    const usuario = await usuariosService.getUsuarioById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el perfil' });
  }
}

export async function actualizarPerfil(req, res) {
  try {
    const { nombre, apellido } = req.body;
    const usuario = await usuariosService.actualizarPerfil({ id: req.usuario.id, nombre, apellido });
    res.json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudieron guardar los datos' });
  }
}

export async function cambiarPassword(req, res) {
  try {
    const { passwordActual, passwordNueva, confirmacion } = req.body;
    await usuariosService.cambiarPassword({
      id: req.usuario.id,
      correo: req.usuario.correo,
      passwordActual,
      passwordNueva,
      confirmacion,
    });
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo cambiar la contraseña' });
  }
}

export async function cambiarRol(req, res) {
  try {
    const { idRol } = req.body;
    const usuario = await usuariosService.cambiarRolUsuario({
      id: req.params.id,
      idRol,
      idUsuarioQueCambia: req.usuario.id,
    });
    res.json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo cambiar el rol' });
  }
}

export async function cambiarActivo(req, res) {
  try {
    const { activo } = req.body;
    const usuario = await usuariosService.cambiarEstadoActivo({
      id: req.params.id,
      activo,
      idUsuarioQueCambia: req.usuario.id,
    });
    res.json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo cambiar el estado del usuario' });
  }
}

export async function blanquearPassword(req, res) {
  try {
    const { passwordNueva } = req.body;
    await usuariosService.blanquearPassword({
      id: req.params.id,
      passwordNueva,
      idUsuarioQueBlanquea: req.usuario.id,
    });
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo blanquear la contraseña' });
  }
}

export async function activarCuenta(req, res) {
  try {
    const { token } = req.body;
    const usuario = await usuariosService.activarCuenta(token);
    res.json({ message: 'Cuenta activada', usuario });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo activar la cuenta' });
  }
}

export async function solicitarResetPassword(req, res) {
  try {
    const { correo } = req.body;
    await usuariosService.solicitarResetPassword(correo);
  } catch (error) {
    console.error('Error al solicitar reset de contraseña:', error.message);
  } finally {
    // Siempre la misma respuesta, exista o no el correo, para no filtrar qué cuentas están registradas
    res.json({ message: 'Si el correo existe, te enviamos un mail con instrucciones' });
  }
}

export async function resetearPassword(req, res) {
  try {
    const { token, passwordNueva, confirmacion } = req.body;
    await usuariosService.resetearPassword({ token, passwordNueva, confirmacion });
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo restablecer la contraseña' });
  }
}

export async function login(req, res) {
  try {
    const { correo, password } = req.body;
    const { token, usuario } = await usuariosService.autenticarUsuario({ correo, password });

    ponerCookieSesion(res, token);

    res.json({ usuario });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo iniciar sesión' });
  }
}

export async function logout(req, res) {
  await usuariosService.cerrarSesion(req.usuario);
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada' });
}

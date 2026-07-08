import * as usuariosService from '../services/usuarios.service.js';

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
    const { nombre, apellido, correo, password, idRol, idSucursal, idSector } = req.body;
    const usuario = await usuariosService.registrarUsuario({
      nombre,
      apellido,
      correo,
      password,
      idRol,
      idSucursal,
      idSector,
    });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo registrar el usuario' });
  }
}

export async function login(req, res) {
  try {
    const { correo, password } = req.body;
    const { token, usuario } = await usuariosService.autenticarUsuario({ correo, password });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ usuario });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo iniciar sesión' });
  }
}

export function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada' });
}

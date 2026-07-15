import * as backupsService from '../services/backups.service.js';

export async function getBackups(req, res) {
  try {
    const backups = await backupsService.listarBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los backups' });
  }
}

export async function postBackupManual(req, res) {
  try {
    const resultado = await backupsService.generarBackupManual(req.usuario.id);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo generar el backup' });
  }
}

export async function getDescargarBackup(req, res) {
  try {
    const rutaCompleta = backupsService.obtenerRutaParaDescarga(req.params.nombreArchivo);
    res.download(rutaCompleta, req.params.nombreArchivo);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo descargar el backup' });
  }
}

export async function postRestaurar(req, res) {
  try {
    await backupsService.restaurarDesdeBackupExistente({
      nombreArchivo: req.body.nombreArchivo,
      idUsuario: req.usuario.id,
    });
    res.json({ message: 'Restauración completada' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo restaurar el backup' });
  }
}

export async function postRestaurarDesdeArchivo(req, res) {
  try {
    await backupsService.restaurarDesdeArchivoSubido({
      rutaTemporal: req.file.path,
      nombreOriginal: req.file.originalname,
      idUsuario: req.usuario.id,
    });
    res.json({ message: 'Restauración completada' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo restaurar el backup' });
  }
}

export async function getConfiguracionBackup(req, res) {
  try {
    const configuracion = await backupsService.getConfiguracionBackup();
    res.json(configuracion);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener la configuración de backups' });
  }
}

export async function putConfiguracionBackup(req, res) {
  try {
    const { activo, dias, hora } = req.body;
    const configuracion = await backupsService.actualizarConfiguracionBackup({ activo, dias, hora });
    res.json(configuracion);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.status ? error.message : 'No se pudo actualizar la configuración de backups' });
  }
}

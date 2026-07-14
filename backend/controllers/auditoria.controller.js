import * as auditoriaService from '../services/auditoria.service.js';
import * as configuracionService from '../services/configuracion.service.js';

export async function getAuditoria(req, res) {
  try {
    const auditoria = await auditoriaService.listarAuditoria();
    res.json(auditoria);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener la auditoría' });
  }
}

export async function getConfiguracionRetencion(req, res) {
  try {
    const configuracion = await configuracionService.getConfiguracion();
    res.json(configuracion);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener la configuración de retención' });
  }
}

export async function actualizarConfiguracionRetencion(req, res) {
  try {
    const { diasRetencionLogs } = req.body;
    const configuracion = await configuracionService.actualizarDiasRetencion(diasRetencionLogs);
    res.json(configuracion);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.status ? error.message : 'No se pudo actualizar la configuración de retención',
    });
  }
}

export async function limpiarLogs(req, res) {
  try {
    const { diasPreservar } = req.body;
    const resultado = await auditoriaService.limpiarLogs({
      diasPreservar,
      idUsuarioQueLimpia: req.usuario.id,
    });
    res.json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo limpiar los logs' });
  }
}

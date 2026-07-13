import * as auditoriaService from '../services/auditoria.service.js';

export async function getAuditoria(req, res) {
  try {
    const auditoria = await auditoriaService.listarAuditoria();
    res.json(auditoria);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener la auditoría' });
  }
}

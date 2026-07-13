import * as auditoriaModel from '../models/auditoria.model.js';

export async function registrarEvento({ idUsuario, accion, detalle }) {
  try {
    await auditoriaModel.create({ idUsuario, accion, detalle });
  } catch (error) {
    console.error('No se pudo registrar el evento de auditoría:', error.message);
  }
}

export async function listarAuditoria() {
  return auditoriaModel.findAll();
}

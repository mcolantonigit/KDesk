import * as tiposTicketModel from '../models/tiposTicket.model.js';

export async function getTiposTicket() {
  return tiposTicketModel.findAll();
}

export async function getTipoTicketById(id) {
  return tiposTicketModel.findById(id);
}

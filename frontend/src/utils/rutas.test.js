import { describe, it, expect } from 'vitest';
import { tituloDeRuta } from './rutas';

describe('tituloDeRuta', () => {
  it('devuelve el título de cada pantalla', () => {
    expect(tituloDeRuta('/')).toBe('Inicio');
    expect(tituloDeRuta('/dashboard/novedades')).toBe('Novedades');
    expect(tituloDeRuta('/tickets/activos')).toBe('Tickets activos');
    expect(tituloDeRuta('/configuracion/alertas')).toBe('Alertas');
    expect(tituloDeRuta('/administrar/auditoria')).toBe('Auditoría');
  });

  it('el detalle de un ticket se llama "Ticket", sea cual sea el número', () => {
    expect(tituloDeRuta('/tickets/5')).toBe('Ticket');
    expect(tituloDeRuta('/tickets/192')).toBe('Ticket');
  });

  it('una ruta desconocida usa el nombre de la aplicación', () => {
    expect(tituloDeRuta('/algo/que/no/existe')).toBe('KDesk');
  });
});

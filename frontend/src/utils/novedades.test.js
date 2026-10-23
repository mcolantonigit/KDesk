import { describe, it, expect } from 'vitest';
import { calcularNovedades, diasDesde, textoHace, DIAS_ESTANCADO } from './novedades';

const ahora = new Date('2026-10-23T12:00:00');
const hace = (dias) => new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000).toISOString();

const estados = [
  { id: 1, nombre: 'Pendiente' },
  { id: 2, nombre: 'Asignado' },
  { id: 3, nombre: 'En proceso' },
  { id: 4, nombre: 'En espera del usuario' },
  { id: 6, nombre: 'Cerrado' },
  { id: 7, nombre: 'Cancelado' },
];
const prioridades = [
  { id: 1, nombre: 'Baja' },
  { id: 2, nombre: 'Media' },
  { id: 3, nombre: 'Alta' },
  { id: 4, nombre: 'Critica' },
];

const ticket = (id, extra = {}) => ({
  id,
  numero: `TK-${id}`,
  id_estado: 1,
  id_prioridad: null,
  id_prioridad_sugerida: 2,
  id_tecnico_responsable: null,
  fecha_creacion: hace(1),
  fecha_actualizacion: hace(1),
  ...extra,
});

const calcular = (tickets, usuarioId = 10) => calcularNovedades({ tickets, estados, prioridades, usuarioId, ahora });
const ids = (lista) => lista.map((t) => t.id);

describe('diasDesde y textoHace', () => {
  it('cuenta días completos', () => {
    expect(diasDesde(hace(0), ahora)).toBe(0);
    expect(diasDesde(hace(1.5), ahora)).toBe(1);
    expect(diasDesde(hace(5), ahora)).toBe(5);
  });

  it('redacta cuánto hace', () => {
    expect(textoHace(0)).toBe('hoy');
    expect(textoHace(1)).toBe('hace 1 día');
    expect(textoHace(4)).toBe('hace 4 días');
  });
});

describe('calcularNovedades', () => {
  it('ignora los tickets cerrados y cancelados', () => {
    const r = calcular([ticket(1, { id_estado: 6 }), ticket(2, { id_estado: 7 }), ticket(3)]);

    expect(r.kpis.abiertos).toBe(1);
    expect(ids(r.sinAsignar)).toEqual([3]);
  });

  it('mi cola son mis tickets abiertos, primero los más prioritarios y, a igual prioridad, los más antiguos', () => {
    const r = calcular([
      ticket(1, { id_tecnico_responsable: 10, id_prioridad_sugerida: 1, fecha_creacion: hace(9) }),
      ticket(2, { id_tecnico_responsable: 10, id_prioridad: 4 }),
      ticket(3, { id_tecnico_responsable: 10, id_prioridad_sugerida: 2, fecha_creacion: hace(5) }),
      ticket(4, { id_tecnico_responsable: 10, id_prioridad_sugerida: 2, fecha_creacion: hace(8) }),
      ticket(5, { id_tecnico_responsable: 99 }),
    ]);

    expect(ids(r.miCola)).toEqual([2, 4, 3, 1]);
    expect(r.kpis.miCola).toBe(4);
  });

  it('la prioridad asignada manda sobre la sugerida', () => {
    const r = calcular([ticket(1, { id_prioridad: 1, id_prioridad_sugerida: 4, id_tecnico_responsable: 10 })]);

    expect(r.miCola[0].prioridad).toBe('Baja');
  });

  it('sin asignar: primero lo urgente y después lo más viejo', () => {
    const r = calcular([
      ticket(1, { fecha_creacion: hace(10) }),
      ticket(2, { id_prioridad_sugerida: 3, fecha_creacion: hace(2) }),
      ticket(3, { fecha_creacion: hace(6) }),
      ticket(4, { id_tecnico_responsable: 10 }),
    ]);

    expect(ids(r.sinAsignar)).toEqual([2, 1, 3]);
    expect(r.kpis.sinAsignar).toBe(3);
  });

  it(`estancado: abierto y sin actualizaciones hace ${DIAS_ESTANCADO} días o más`, () => {
    const r = calcular([
      ticket(1, { fecha_actualizacion: hace(2) }),
      ticket(2, { fecha_actualizacion: hace(3) }),
      ticket(3, { fecha_actualizacion: hace(8) }),
    ]);

    expect(ids(r.atencion)).toEqual([3, 2]);
    expect(r.atencion[0].motivos).toEqual([{ tipo: 'estancado', dias: 8 }]);
    expect(r.kpis.estancados).toBe(2);
  });

  it('un ticket en espera del usuario no se considera estancado (la pelota no está del lado del técnico)', () => {
    const r = calcular([ticket(1, { id_estado: 4, fecha_actualizacion: hace(20) })]);

    expect(r.atencion).toEqual([]);
    expect(r.kpis.estancados).toBe(0);
  });

  it('requieren atención los de prioridad alta o crítica, con sus motivos, críticos primero', () => {
    const r = calcular([
      ticket(1, { id_prioridad_sugerida: 3 }),
      ticket(2, { id_prioridad_sugerida: 4, fecha_actualizacion: hace(6) }),
      ticket(3, { id_prioridad_sugerida: 1, fecha_actualizacion: hace(4) }),
      ticket(4),
    ]);

    expect(ids(r.atencion)).toEqual([2, 1, 3]);
    expect(r.atencion[0].motivos).toEqual([
      { tipo: 'prioridad', texto: 'Critica' },
      { tipo: 'estancado', dias: 6 },
    ]);
    expect(r.atencion[1].motivos).toEqual([{ tipo: 'prioridad', texto: 'Alta' }]);
    expect(r.kpis.altaCritica).toBe(2);
  });

  it('cada ticket trae sus días desde la última actualización', () => {
    const r = calcular([ticket(1, { fecha_actualizacion: hace(4) })]);

    expect(r.sinAsignar[0].diasSinActividad).toBe(4);
  });
});

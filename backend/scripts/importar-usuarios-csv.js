// Alta masiva de usuarios desde docs/Kdesk-usuarios-iniciales.csv.
//
// A diferencia del registro público (RF-002), estos usuarios se crean ya
// activos y con el mail verificado (mismo criterio que el usuario maestro
// de RF-021: alta directa en base, sin pasar por el circuito de mail).
//
// Uso: node scripts/importar-usuarios-csv.js   (parado en backend/)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as usuariosModel from '../models/usuarios.model.js';
import * as sucursalesModel from '../models/sucursales.model.js';
import * as sectoresModel from '../models/sectores.model.js';
import * as auditoriaService from '../services/auditoria.service.js';
import { hashPassword } from '../utils/password.util.js';

dotenv.config({ quiet: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_CSV = path.join(__dirname, '../../docs/Kdesk-usuarios-iniciales.csv');
const ROL_USUARIO = 1;

// El CSV usa nombres sin tilde para dos sectores que en el catálogo ya
// existen acentuados; se mapean al mismo sector en vez de crear uno nuevo.
const ALIAS_SECTORES = {
  Direccion: 'Dirección',
  Tesoreria: 'Tesorería',
};

// Sectores que no existían en el catálogo al momento del alta inicial
// (2026-07-22). Si se vuelve a correr el script para una tanda nueva de
// usuarios con sectores ya creados, quitar de esta lista los que ya
// existan para no duplicarlos.
const SECTORES_NUEVOS = [
  'Armado interno', 'Auditoría', 'Consultorio', 'Expedicion', 'Gerencia',
  'Legales', 'Logistica', 'Matriceria', 'Pañol', 'Planta', 'Programacion',
  'Recepcion de materiales', 'Retail', 'Seguridad', 'Vendedores',
];

function parsearCsv(contenido) {
  const [encabezado, ...lineas] = contenido.split(/\r?\n/).filter((l) => l.trim() !== '');
  const columnas = encabezado.split(';');
  return lineas.map((linea) => {
    const valores = linea.split(';');
    const fila = {};
    columnas.forEach((col, i) => { fila[col.trim()] = (valores[i] ?? '').trim(); });
    return fila;
  });
}

async function main() {
  const buffer = fs.readFileSync(RUTA_CSV);
  const contenido = new TextDecoder('windows-1252').decode(buffer);
  const filas = parsearCsv(contenido);

  const sectoresActuales = new Set((await sectoresModel.findAll()).map((s) => s.nombre));
  for (const nombreSector of SECTORES_NUEVOS) {
    if (sectoresActuales.has(nombreSector)) {
      console.log(`Sector ya existía, no se recrea: ${nombreSector}`);
      continue;
    }
    await sectoresModel.create({ nombre: nombreSector });
    console.log(`Sector creado: ${nombreSector}`);
  }

  const sucursales = await sucursalesModel.findAll();
  const sectores = await sectoresModel.findAll();
  const idSucursalPorNombre = new Map(sucursales.map((s) => [s.nombre, s.id]));
  const idSectorPorNombre = new Map(sectores.map((s) => [s.nombre, s.id]));

  const usuariosExistentes = await usuariosModel.findAll();
  const correosExistentes = new Set(usuariosExistentes.map((u) => u.correo.toLowerCase()));

  let creados = 0;
  let omitidos = 0;

  for (const fila of filas) {
    const correo = fila['Email'];
    if (!correo) continue;

    if (correosExistentes.has(correo.toLowerCase())) {
      console.log(`Omitido (ya existe): ${correo}`);
      omitidos++;
      continue;
    }

    const nombreSector = ALIAS_SECTORES[fila['Sector']] ?? fila['Sector'];
    const idSucursal = idSucursalPorNombre.get(fila['Sucursal']);
    const idSector = idSectorPorNombre.get(nombreSector);

    if (!idSucursal || !idSector) {
      console.log(`SALTEADO por catálogo faltante: ${correo} (sucursal="${fila['Sucursal']}" sector="${fila['Sector']}")`);
      omitidos++;
      continue;
    }

    const passwordHash = await hashPassword(fila['Clave inicial']);
    const usuario = await usuariosModel.create({
      nombre: fila['Nombre'],
      apellido: fila['Apellido'],
      correo,
      passwordHash,
      idRol: ROL_USUARIO,
      idSucursal,
      idSector,
    });
    await usuariosModel.marcarEmailVerificado(usuario.id);

    await auditoriaService.registrarEvento({
      idUsuario: usuario.id,
      accion: 'ALTA_MASIVA',
      detalle: `Alta masiva desde CSV inicial (${correo})`,
    });

    console.log(`Creado: ${correo}`);
    creados++;
  }

  console.log(`\nListo. Creados: ${creados}. Omitidos: ${omitidos}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error('Error en la importación:', error);
  process.exit(1);
});

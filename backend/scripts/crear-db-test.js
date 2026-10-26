// Recrea la base "kdesk_test" desde cero con database/schema.sql. Es la base
// que usan los tests del backend (npm test): se puede borrar y rehacer
// cuando se quiera, nunca toca "kdesk" ni "kdesk_dev".
//
//   npm run test:db
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

dotenv.config({ quiet: true });

const NOMBRE_DB = 'kdesk_test';
const schema = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../../database/schema.sql'),
  'utf8'
);

function cliente(database) {
  return new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

const admin = cliente('postgres');
await admin.connect();
await admin.query(`DROP DATABASE IF EXISTS ${NOMBRE_DB} WITH (FORCE)`);
await admin.query(`CREATE DATABASE ${NOMBRE_DB}`);
await admin.end();

const db = cliente(NOMBRE_DB);
await db.connect();
await db.query(schema);
await db.end();

console.log(`Base '${NOMBRE_DB}' recreada en ${process.env.DB_HOST}.`);

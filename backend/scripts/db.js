// Ejecuta SQL contra la base del .env (por defecto kdesk_dev) y muestra el
// resultado. Pensado para el entorno de desarrollo y los tests.
//
//   node scripts/db.js "SELECT count(*) FROM tickets"
//   node scripts/db.js --db postgres "CREATE DATABASE kdesk_test"
//
// Por seguridad se NIEGA a correr contra la base de producción ("kdesk").
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ quiet: true });

const args = process.argv.slice(2);
const i = args.indexOf('--db');
const base = i >= 0 ? args.splice(i, 2)[1] : process.env.DB_NAME;
const sql = args.join(' ');

if (!sql) {
  console.error('Uso: node scripts/db.js [--db nombre] "SQL"');
  process.exit(1);
}
if (base === 'kdesk') {
  console.error('Rechazado: scripts/db.js no corre contra la base de producción "kdesk".');
  process.exit(1);
}

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: base,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

try {
  await client.connect();
  const res = await client.query(sql);
  if (res.rows?.length) console.table(res.rows);
  else console.log(`OK (${res.command}${res.rowCount != null ? `, ${res.rowCount} filas` : ''})`);
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}

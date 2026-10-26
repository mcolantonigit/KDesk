import { afterAll } from 'vitest';
import { pool } from '../config/db.js';

// Red de seguridad: si por algún motivo la config cambia, abortar antes
// de escribir en una base que no sea la de tests.
if (process.env.DB_NAME !== 'kdesk_test') {
  throw new Error(`Los tests solo pueden correr contra kdesk_test (DB_NAME=${process.env.DB_NAME})`);
}

afterAll(() => pool.end());

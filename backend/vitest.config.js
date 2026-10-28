import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    // Antes de que cualquier módulo lea el .env: dotenv no pisa variables
    // que ya existen, así que los tests siempre usan kdesk_test.
    env: { DB_NAME: 'kdesk_test', ALLOWED_EMAIL_DOMAINS: 'tuempresa.com' },
    setupFiles: ['./tests/setup.js'],
    // Todos los archivos comparten la misma base: se corren de a uno.
    fileParallelism: false,
  },
});

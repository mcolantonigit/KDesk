import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import fs from 'fs';
import app from './app.js';
import { programarLimpiezaNocturna } from './jobs/limpiezaLogs.job.js';
import { programarBackupAutomatico } from './jobs/backups.job.js';

dotenv.config({ quiet: true });

const PORT_HTTPS = process.env.PORT || 443;
const PORT_HTTP = 80;

const opcionesTls = {
  pfx: fs.readFileSync(process.env.TLS_PFX_PATH),
  passphrase: process.env.TLS_PFX_PASSWORD,
};

https.createServer(opcionesTls, app).listen(PORT_HTTPS, () => {
  console.log(`KDesk backend escuchando en https://localhost:${PORT_HTTPS}`);
  programarLimpiezaNocturna();
  programarBackupAutomatico();
});

// Cualquier pedido por HTTP (puerto 80) rebota a HTTPS, mismo host y path,
// para que un link viejo con "http://" no se rompa.
http
  .createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  })
  .listen(PORT_HTTP);

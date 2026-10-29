import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import healthRoutes from './routes/health.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import sucursalesRoutes from './routes/sucursales.routes.js';
import sectoresRoutes from './routes/sectores.routes.js';
import tiposTicketRoutes from './routes/tiposTicket.routes.js';
import estadosRoutes from './routes/estados.routes.js';
import prioridadesRoutes from './routes/prioridades.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import comentariosRoutes from './routes/comentarios.routes.js';
import tareasTecnicasRoutes from './routes/tareasTecnicas.routes.js';
import historialRoutes from './routes/historial.routes.js';
import adjuntosRoutes from './routes/adjuntos.routes.js';
import auditoriaRoutes from './routes/auditoria.routes.js';
import backupsRoutes from './routes/backups.routes.js';
import notificacionesRoutes from './routes/notificaciones.routes.js';
import authRoutes from './routes/auth.routes.js';
import kadiRoutes from './routes/kadi.routes.js';
import { cors } from './middleware/cors.middleware.js';

const app = express();

app.use(cors);
app.use(express.json());
app.use(cookieParser());

app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', rolesRoutes);
app.use('/api', sucursalesRoutes);
app.use('/api', sectoresRoutes);
app.use('/api', tiposTicketRoutes);
app.use('/api', estadosRoutes);
app.use('/api', prioridadesRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', ticketsRoutes);
app.use('/api', kadiRoutes);
app.use('/api', comentariosRoutes);
app.use('/api', tareasTecnicasRoutes);
app.use('/api', historialRoutes);
app.use('/api', adjuntosRoutes);
app.use('/api', auditoriaRoutes);
app.use('/api', backupsRoutes);
app.use('/api', notificacionesRoutes);

// Producción: Express sirve el build del frontend (npm run build en
// frontend/). En desarrollo esta carpeta no existe (se usa el servidor
// de Vite en :5173 en su lugar), por eso queda condicionado a que exista.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const carpetaFrontend = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(carpetaFrontend)) {
  app.use(express.static(carpetaFrontend));
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(carpetaFrontend, 'index.html'));
  });
}

export default app;

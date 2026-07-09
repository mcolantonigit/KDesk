import express from 'express';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import sucursalesRoutes from './routes/sucursales.routes.js';
import sectoresRoutes from './routes/sectores.routes.js';
import tiposTicketRoutes from './routes/tiposTicket.routes.js';
import estadosRoutes from './routes/estados.routes.js';
import prioridadesRoutes from './routes/prioridades.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api', healthRoutes);
app.use('/api', rolesRoutes);
app.use('/api', sucursalesRoutes);
app.use('/api', sectoresRoutes);
app.use('/api', tiposTicketRoutes);
app.use('/api', estadosRoutes);
app.use('/api', prioridadesRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', ticketsRoutes);

export default app;

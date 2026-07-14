import dotenv from 'dotenv';
import app from './app.js';
import { programarLimpiezaNocturna } from './jobs/limpiezaLogs.job.js';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`KDesk backend escuchando en http://localhost:${PORT}`);
  programarLimpiezaNocturna();
});

import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`KDesk backend escuchando en http://localhost:${PORT}`);
});

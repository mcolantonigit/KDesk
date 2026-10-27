// Dirección del backend. En la red local (build del server y `npm run dev`)
// queda vacía y se usa "/api" en el mismo origen, como siempre. En Cloudflare
// Pages se define VITE_API_URL al compilar (ej. https://api.kdesk.ar) y el
// navegador le pide directo a la API por el Tunnel.
export const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

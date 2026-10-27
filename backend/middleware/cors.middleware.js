// CORS para el frontend publicado en Cloudflare Pages (kdesk.ar), que le pide
// a la API por otra dirección (api.kdesk.ar, por el Tunnel). Solo se activa si
// CORS_ORIGINS está definido en el .env; sin esa variable el backend responde
// exactamente igual que siempre (el frontend local usa el mismo origen).
//
//   CORS_ORIGINS=https://kdesk.ar,https://dev.kdesk.ar
function origenesPermitidos() {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origen) => origen.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

export function cors(req, res, next) {
  const permitidos = origenesPermitidos();
  const origen = req.headers.origin;

  if (permitidos.length === 0 || !origen || !permitidos.includes(origen)) {
    return next();
  }

  res.set('Access-Control-Allow-Origin', origen);
  res.set('Access-Control-Allow-Credentials', 'true');
  res.append('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '600');
    return res.sendStatus(204);
  }

  next();
}

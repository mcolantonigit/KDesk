import crypto from 'crypto';

export function generarToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashearToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

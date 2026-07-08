import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(passwordPlano) {
  return bcrypt.hash(passwordPlano, SALT_ROUNDS);
}

export function compararPassword(passwordPlano, passwordHash) {
  return bcrypt.compare(passwordPlano, passwordHash);
}

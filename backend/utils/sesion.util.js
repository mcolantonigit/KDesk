const DURACION_SESION_MS = 8 * 60 * 60 * 1000;

// La cookie de sesión, igual para el login con contraseña y el de Microsoft 365.
export function ponerCookieSesion(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: DURACION_SESION_MS,
  });
}

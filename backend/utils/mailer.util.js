import nodemailer from 'nodemailer';

let transportador;

function construirUrl(path) {
  const base = process.env.FRONTEND_URL.replace(/\/+$/, '');
  return `${base}${path}`;
}

function obtenerTransportador() {
  if (!transportador) {
    transportador = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transportador;
}

async function enviarMail({ para, asunto, html }) {
  await obtenerTransportador().sendMail({
    from: process.env.SMTP_FROM,
    to: para,
    subject: asunto,
    html,
  });
}

function plantillaBase({ titulo, mensaje, textoBoton, url }) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${titulo}</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #444;">${mensaje}</p>
      <p style="margin: 32px 0;">
        <a href="${url}" style="background:#f26522; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          ${textoBoton}
        </a>
      </p>
      <p style="font-size: 12px; color: #888;">
        Si el botón no funciona, copiá y pegá este link en el navegador:<br />
        <a href="${url}" style="color:#888;">${url}</a>
      </p>
      <p style="font-size: 12px; color: #888; margin-top: 24px;">— KDesk</p>
    </div>
  `;
}

export async function enviarMailActivacion({ correo, nombre, token }) {
  const url = construirUrl(`/activar-cuenta?token=${token}`);
  await enviarMail({
    para: correo,
    asunto: 'Activá tu cuenta de KDesk',
    html: plantillaBase({
      titulo: `Hola, ${nombre}`,
      mensaje:
        'Creaste una cuenta en KDesk. Para poder iniciar sesión, primero necesitamos que confirmes ' +
        'que este correo es tuyo. El link vence en 24 horas.',
      textoBoton: 'Activar mi cuenta',
      url,
    }),
  });
}

export async function enviarMailResetPassword({ correo, nombre, token }) {
  const url = construirUrl(`/resetear-contrasena?token=${token}`);
  await enviarMail({
    para: correo,
    asunto: 'Recuperar tu contraseña de KDesk',
    html: plantillaBase({
      titulo: `Hola, ${nombre}`,
      mensaje:
        'Pediste restablecer tu contraseña de KDesk. Si no fuiste vos, podés ignorar este correo. ' +
        'El link vence en 1 hora.',
      textoBoton: 'Elegir nueva contraseña',
      url,
    }),
  });
}

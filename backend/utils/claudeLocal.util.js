import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

const TIEMPO_MAXIMO_MS = 90000;

// Si el backend corre con otra cuenta de Windows que la de quien inició sesión
// en Claude (por ejemplo la tarea programada como SYSTEM), KADI_CLAUDE_HOME es
// la carpeta de usuario de esa persona (C:/Users/NOMBRE): Claude busca ahí su
// sesión en lugar de en el perfil de la cuenta del backend.
export function entornoDeClaude(env = process.env) {
  const casa = env.KADI_CLAUDE_HOME;
  if (!casa) return env;
  return { ...env, USERPROFILE: casa, HOME: casa, CLAUDE_CONFIG_DIR: path.join(casa, '.claude') };
}

// Corre `claude -p` (Claude Code) con la sesión de quien lo instaló y devuelve
// el texto de la respuesta. Uso personal en desarrollo: Kadi con Claude solo
// la habilita KADI_USUARIOS (ver kadi.service.js). Sin herramientas y sin
// guardar sesión; desde la carpeta temporal para no leer el CLAUDE.md del repo.
export function ejecutarClaude({ sistema, conversacion }) {
  const binario = process.env.KADI_CLAUDE_BIN || 'claude';
  const args = [
    '-p',
    '--output-format', 'json',
    '--no-session-persistence',
    '--tools', '',
    '--system-prompt', sistema,
  ];
  if (process.env.KADI_MODELO) args.push('--model', process.env.KADI_MODELO);

  return new Promise((resolve, reject) => {
    const proceso = spawn(binario, args, { cwd: os.tmpdir(), windowsHide: true, env: entornoDeClaude() });
    let salida = '';
    let errores = '';
    const reloj = setTimeout(() => {
      proceso.kill();
      reject(new Error('Claude tardó demasiado en responder'));
    }, TIEMPO_MAXIMO_MS);

    proceso.stdout.on('data', (trozo) => (salida += trozo));
    proceso.stderr.on('data', (trozo) => (errores += trozo));
    proceso.on('error', (error) => {
      clearTimeout(reloj);
      reject(new Error(`No se pudo ejecutar Claude (${error.message})`));
    });
    proceso.on('close', (codigo) => {
      clearTimeout(reloj);
      if (codigo !== 0) {
        return reject(new Error(`Claude terminó con error ${codigo}: ${errores.trim().slice(0, 200)}`));
      }
      try {
        const resultado = JSON.parse(salida);
        if (resultado.is_error) return reject(new Error(String(resultado.result).slice(0, 200)));
        resolve(String(resultado.result ?? ''));
      } catch {
        reject(new Error('Claude devolvió una respuesta ilegible'));
      }
    });

    // Si Claude se cierra antes de leer la charla (sin sesión, mal instalado),
    // escribirle falla con EPIPE: sin este manejador el error tira abajo todo el
    // backend. El motivo real lo da el código de salida en 'close'.
    proceso.stdin.on('error', () => {});
    proceso.stdin.end(conversacion);
  });
}

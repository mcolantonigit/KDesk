import path from 'path';
import { describe, it, expect, afterEach } from 'vitest';
import { ejecutarClaude, entornoDeClaude } from '../utils/claudeLocal.util.js';

describe('ejecutarClaude', () => {
  afterEach(() => {
    delete process.env.KADI_CLAUDE_BIN;
  });

  it('si el programa no existe, falla con un error normal', async () => {
    process.env.KADI_CLAUDE_BIN = 'C:/no-existe/claude.exe';

    await expect(ejecutarClaude({ sistema: 'x', conversacion: 'y' })).rejects.toThrow('No se pudo ejecutar Claude');
  });

  it('si el programa se cierra sin leer la charla, falla con un error normal y no tira el proceso', async () => {
    // Node con estos argumentos termina enseguida sin leer la entrada.
    process.env.KADI_CLAUDE_BIN = process.execPath;

    await expect(ejecutarClaude({ sistema: 'x', conversacion: 'y'.repeat(500000) })).rejects.toThrow(/Claude terminó con error/);
  });
});

describe('entornoDeClaude', () => {
  it('sin KADI_CLAUDE_HOME deja el entorno como está', () => {
    const env = { PATH: 'x' };
    expect(entornoDeClaude(env)).toBe(env);
  });

  it('con KADI_CLAUDE_HOME apunta Claude al perfil de quien inició sesión', () => {
    const env = entornoDeClaude({ PATH: 'x', KADI_CLAUDE_HOME: 'C:/Users/Administrador.KALOP' });

    expect(env.USERPROFILE).toBe('C:/Users/Administrador.KALOP');
    expect(env.HOME).toBe('C:/Users/Administrador.KALOP');
    expect(path.normalize(env.CLAUDE_CONFIG_DIR)).toBe(path.normalize('C:/Users/Administrador.KALOP/.claude'));
    expect(env.PATH).toBe('x');
  });
});

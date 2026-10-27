import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CONECTADO, escucharApi, hayServidor, SIN_CONEXION } from '../utils/api';
import Button from './Button';
import '../styles/SinConexion.css';

const SEGUNDOS_REINTENTO = 10;

// Tapa la app mientras no se puede hablar con el backend (corte de internet,
// server reiniciándose, túnel caído) y reintenta sola. Lo que se estaba
// escribiendo queda debajo, sin perderse.
function SinConexion() {
  const { cargando, recargarPerfil } = useAuth();
  const [sinConexion, setSinConexion] = useState(false);
  const [segundos, setSegundos] = useState(SEGUNDOS_REINTENTO);
  const [probando, setProbando] = useState(false);
  const cargandoRef = useRef(cargando);

  useEffect(() => {
    cargandoRef.current = cargando;
  }, [cargando]);

  useEffect(
    () =>
      escucharApi((evento) => {
        if (evento === SIN_CONEXION) setSinConexion(true);
        if (evento === CONECTADO) setSinConexion(false);
      }),
    []
  );

  const reintentar = useCallback(async () => {
    setProbando(true);
    const volvio = await hayServidor();
    setProbando(false);
    setSegundos(SEGUNDOS_REINTENTO);
    // Si se cortó antes de saber quién es el usuario, cargar ahora la sesión.
    if (volvio && cargandoRef.current) recargarPerfil();
  }, [recargarPerfil]);

  useEffect(() => {
    if (!sinConexion || probando) return undefined;
    if (segundos <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reintentar();
      return undefined;
    }
    const temporizador = setTimeout(() => setSegundos((anterior) => anterior - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [sinConexion, probando, segundos, reintentar]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sinConexion) setSegundos(SEGUNDOS_REINTENTO);
  }, [sinConexion]);

  if (!sinConexion) return null;

  return (
    <div className="sin-conexion-fondo">
      <div className="sin-conexion" role="alertdialog" aria-modal="true" aria-labelledby="sin-conexion-titulo">
        <img src="/logo_kdesk.svg" alt="" className="sin-conexion-logo" />
        <h1 id="sin-conexion-titulo">Sin conexión con el servidor</h1>
        <p>
          KDesk no puede comunicarse con el servidor. Puede ser un corte de internet o que el servidor se esté
          reiniciando. Lo que estabas haciendo sigue acá: cuando vuelva la conexión podés continuar.
        </p>
        <p className="sin-conexion-estado" role="status">
          {probando ? 'Probando la conexión...' : `Reintentamos en ${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}.`}
        </p>
        <Button onClick={reintentar} disabled={probando}>
          Reintentar ahora
        </Button>
      </div>
    </div>
  );
}

export default SinConexion;

import { useAuth } from '../context/AuthContext';

function Inicio() {
  const { usuario } = useAuth();

  return <h1>Bienvenido, {usuario?.nombre}</h1>;
}

export default Inicio;

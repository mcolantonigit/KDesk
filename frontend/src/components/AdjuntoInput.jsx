import FileInput from './FileInput';
import { ACEPTA_ADJUNTOS, DESCRIPCION_ADJUNTOS, TAMANO_MAXIMO_ADJUNTO } from '../utils/adjuntos';

// Adjunto de un ticket o comentario: solo los tipos y el tamaño que acepta el backend.
function AdjuntoInput(props) {
  return (
    <FileInput
      accept={ACEPTA_ADJUNTOS}
      tamanoMaximo={TAMANO_MAXIMO_ADJUNTO}
      descripcion={DESCRIPCION_ADJUNTOS}
      hint={DESCRIPCION_ADJUNTOS}
      {...props}
    />
  );
}

export default AdjuntoInput;

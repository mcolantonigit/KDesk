import multer from 'multer';
import path from 'path';
import { TAMANO_MAXIMO_BYTES, esTipoPermitido } from '../utils/archivos.util.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const sufijoUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sufijoUnico}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  if (!esTipoPermitido(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: TAMANO_MAXIMO_BYTES },
  fileFilter,
});

export function subirArchivo(req, res, next) {
  upload.single('archivo')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo supera el tamaño máximo permitido (500MB)' });
    }
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  });
}

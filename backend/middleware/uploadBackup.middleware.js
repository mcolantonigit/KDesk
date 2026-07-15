import multer from 'multer';
import os from 'os';
import path from 'path';

const TAMANO_MAXIMO_BYTES = 2 * 1024 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    const sufijoUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `kdesk-restore-${sufijoUnico}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  if (path.extname(file.originalname).toLowerCase() !== '.sql') {
    return cb(new Error('El archivo debe ser un backup .sql'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: TAMANO_MAXIMO_BYTES },
  fileFilter,
});

export function subirArchivoBackup(req, res, next) {
  upload.single('archivo')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo supera el tamaño máximo permitido (2GB)' });
    }
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Falta el archivo de backup' });
    }
    next();
  });
}

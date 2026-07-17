-- =====================================================================
-- KDesk - Script de creación de base de datos (PostgreSQL)
-- Basado en docs/FUNCTIONAL_REQUIREMENTS.md y docs/PROJECT.md
-- =====================================================================
--
-- Cómo ejecutar este script:
--
-- 1. Crear la base de datos (esto NO se puede hacer dentro de una
--    transacción ni junto con el resto del script, hay que conectarse
--    a la BD "postgres" primero):
--
--       psql -U postgres -c "CREATE DATABASE kdesk;"
--
-- 2. Ejecutar el resto del script ya conectado a "kdesk":
--
--       psql -U postgres -d kdesk -f database/schema.sql
--
-- (En pgAdmin: crear la base "kdesk" desde el árbol de Databases,
-- y después abrir el Query Tool sobre "kdesk" y pegar desde acá abajo).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Catálogos base
-- ---------------------------------------------------------------------

CREATE TABLE roles (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE sucursales (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE,
    activo  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sectores (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE,
    activo  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tipos_ticket (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE,
    activo  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE estados (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE,
    activo  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE prioridades (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE,
    activo  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- Usuarios (RF-002, RF-003, RF-021)
-- ---------------------------------------------------------------------

CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    correo          VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    id_rol          INT NOT NULL REFERENCES roles(id),
    id_sucursal     INT NOT NULL REFERENCES sucursales(id),
    id_sector       INT NOT NULL REFERENCES sectores(id),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW(),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    activacion_reenviada BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT chk_correo_kalop CHECK (
        correo LIKE '%@kalop.com.ar' OR correo LIKE '%@ergoscables.com.ar' OR correo LIKE '%@kalop.cl'
    )
);

-- ---------------------------------------------------------------------
-- Tokens de un solo uso (activación de cuenta / reset de contraseña)
-- ---------------------------------------------------------------------

CREATE TABLE tokens_verificacion (
    id                  SERIAL PRIMARY KEY,
    id_usuario          INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash          VARCHAR(64) NOT NULL UNIQUE,
    tipo                VARCHAR(30) NOT NULL,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_expiracion    TIMESTAMP NOT NULL,
    usado               BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT chk_tipo_token CHECK (tipo IN ('ACTIVACION', 'RESET_PASSWORD'))
);

-- ---------------------------------------------------------------------
-- Tickets (RF-004 a RF-009, RF-018)
-- ---------------------------------------------------------------------

CREATE TABLE tickets (
    id                      SERIAL PRIMARY KEY,
    numero                  VARCHAR(20) NOT NULL UNIQUE,
    titulo                  VARCHAR(35) NOT NULL,
    descripcion             TEXT NOT NULL,
    nombre_descriptivo      VARCHAR(300) NOT NULL,

    id_tipo                 INT NOT NULL REFERENCES tipos_ticket(id),
    id_prioridad_sugerida   INT NOT NULL REFERENCES prioridades(id),
    id_prioridad            INT REFERENCES prioridades(id),
    id_estado               INT NOT NULL REFERENCES estados(id),

    id_usuario_creador      INT NOT NULL REFERENCES usuarios(id),
    id_tecnico_responsable  INT REFERENCES usuarios(id),
    id_sucursal             INT NOT NULL REFERENCES sucursales(id),
    id_sector               INT NOT NULL REFERENCES sectores(id),

    fecha_creacion          TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion     TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_cierre            TIMESTAMP
);

-- Numeración automática TK-000001 (RF-005)

CREATE SEQUENCE ticket_numero_seq START 1;

CREATE OR REPLACE FUNCTION fn_asignar_numero_ticket()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero := 'TK-' || LPAD(nextval('ticket_numero_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_asignar_numero_ticket
BEFORE INSERT ON tickets
FOR EACH ROW
WHEN (NEW.numero IS NULL OR NEW.numero = '')
EXECUTE FUNCTION fn_asignar_numero_ticket();

-- Actualizar fecha_actualizacion automáticamente en cada UPDATE (RF-018)

CREATE OR REPLACE FUNCTION fn_actualizar_fecha_ticket()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_fecha_ticket
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_ticket();

-- ---------------------------------------------------------------------
-- Comentarios (RF-010)
-- ---------------------------------------------------------------------

CREATE TABLE comentarios (
    id                  SERIAL PRIMARY KEY,
    id_ticket           INT NOT NULL REFERENCES tickets(id),
    id_autor            INT NOT NULL REFERENCES usuarios(id),
    contenido           TEXT NOT NULL,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    eliminado           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_eliminacion   TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tareas técnicas (RF-011)
-- ---------------------------------------------------------------------

CREATE TABLE tareas_tecnicas (
    id                  SERIAL PRIMARY KEY,
    id_ticket           INT NOT NULL REFERENCES tickets(id),
    descripcion         VARCHAR(300) NOT NULL,
    completada          BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_completada    TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Adjuntos (RF-019) - pueden pertenecer a un ticket, un comentario
-- o una tarea técnica, pero siempre a uno solo de los tres.
-- ---------------------------------------------------------------------

CREATE TABLE adjuntos (
    id                  SERIAL PRIMARY KEY,
    id_ticket           INT REFERENCES tickets(id),
    id_comentario       INT REFERENCES comentarios(id),
    id_tarea            INT REFERENCES tareas_tecnicas(id),
    nombre_archivo      VARCHAR(255) NOT NULL,
    ruta_archivo        VARCHAR(500) NOT NULL,
    tipo_archivo        VARCHAR(100),
    tamano_bytes        INT,
    id_usuario_subio    INT NOT NULL REFERENCES usuarios(id),
    fecha_subida        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_adjunto_un_solo_padre CHECK (
        (CASE WHEN id_ticket IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN id_comentario IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN id_tarea IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

-- ---------------------------------------------------------------------
-- Historial del ticket (RF-012) - nunca se elimina
-- ---------------------------------------------------------------------

CREATE TABLE historial_ticket (
    id          SERIAL PRIMARY KEY,
    id_ticket   INT NOT NULL REFERENCES tickets(id),
    id_usuario  INT REFERENCES usuarios(id),
    evento      VARCHAR(100) NOT NULL,
    detalle     TEXT,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Auditoría general del sistema (RF-022)
-- ---------------------------------------------------------------------

CREATE TABLE auditoria (
    id          SERIAL PRIMARY KEY,
    id_usuario  INT REFERENCES usuarios(id),
    accion      VARCHAR(200) NOT NULL,
    detalle     TEXT,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Configuración del sistema (fila única) - retención de logs/auditoría
-- ---------------------------------------------------------------------

CREATE TABLE configuracion_sistema (
    id                          SERIAL PRIMARY KEY,
    dias_retencion_logs        INT NOT NULL DEFAULT 365,
    backup_automatico_activo   BOOLEAN NOT NULL DEFAULT FALSE,
    -- Días de la semana en que corre el backup automático, separados por
    -- coma (convención JS Date.getDay(): 0 = domingo ... 6 = sábado).
    -- Vacío = ningún día seleccionado.
    backup_dias                VARCHAR(20) NOT NULL DEFAULT '',
    backup_hora                TIME NOT NULL DEFAULT '00:00:00'
);

INSERT INTO configuracion_sistema (id, dias_retencion_logs) VALUES (1, 365);

-- =====================================================================
-- Datos base (seed) - catálogos definidos en FUNCTIONAL_REQUIREMENTS.md
-- =====================================================================

INSERT INTO roles (nombre) VALUES
    ('usuario'),
    ('tecnico'),
    ('administrador');

INSERT INTO estados (nombre) VALUES
    ('Pendiente'),
    ('Asignado'),
    ('En proceso'),
    ('En espera del usuario'),
    ('Resuelto'),
    ('Cerrado'),
    ('Cancelado');

INSERT INTO prioridades (nombre) VALUES
    ('Baja'),
    ('Media'),
    ('Alta'),
    ('Critica');

INSERT INTO tipos_ticket (nombre) VALUES
    ('Incidente'),
    ('Solicitud de Servicio'),
    ('Instalacion de Software'),
    ('Solicitud de Hardware'),
    ('Alta de Usuario'),
    ('Cambio de Contrasena'),
    ('Otro');

-- Sucursales y sectores de ejemplo, para poder practicar cargando
-- usuarios y tickets. Ajustar/completar con los reales de Kalop.

INSERT INTO sucursales (nombre) VALUES
    ('Casa Central');

INSERT INTO sectores (nombre) VALUES
    ('Sistemas'),
    ('Ventas'),
    ('Administracion');

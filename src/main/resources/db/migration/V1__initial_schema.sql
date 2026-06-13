CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    apodo VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    racha_dias INT DEFAULT 0,
    ultima_racha TIMESTAMP,
    session_token VARCHAR(255),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_levels (
    id BIGSERIAL PRIMARY KEY,
    world INT NOT NULL,
    level_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    initial_schema TEXT,
    expected_solution TEXT,
    theory TEXT,
    hints TEXT,
    xp INT NOT NULL,
    difficulty VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    level_id BIGINT NOT NULL,
    stars_earned INT DEFAULT 0,
    score INT NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP,
    CONSTRAINT uk_user_level UNIQUE (user_id, level_id)
);

CREATE TABLE IF NOT EXISTS puzzles (
    id BIGSERIAL PRIMARY KEY,
    enunciado TEXT,
    tablas_inicial TEXT,
    df_inicial TEXT,
    solucion_esperada TEXT,
    nivel_dificultad VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS intentos_puzzle (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    puzzle_id BIGINT NOT NULL,
    puntuacion INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS medals (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    tipo_condicion VARCHAR(30) NOT NULL,
    valor_condicion INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_medals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    medal_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    mensaje TEXT,
    user_id BIGINT
);

CREATE TABLE IF NOT EXISTS esquemas (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    nombre VARCHAR(255),
    estructura_json TEXT,
    dependencias_json TEXT
);

CREATE TABLE IF NOT EXISTS validaciones (
    id BIGSERIAL PRIMARY KEY,
    esquema_id BIGINT,
    nivel_normalizacion VARCHAR(10),
    violaciones_json TEXT
);

CREATE TABLE IF NOT EXISTS retos_semanales (
    id BIGSERIAL PRIMARY KEY,
    descripcion TEXT,
    tablas TEXT,
    df TEXT,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participaciones_reto (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reto_id BIGINT NOT NULL,
    puntuacion INT DEFAULT 0,
    tiempo_segundos INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rate_limit_attempts (
    id BIGSERIAL PRIMARY KEY,
    identifier VARCHAR(255),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tipo VARCHAR(50),
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

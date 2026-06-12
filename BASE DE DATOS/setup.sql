-- Archivo principal de base de datos
CREATE DATABASE IF NOT EXISTS dataquest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dataquest;
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    apodo VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('usuario', 'administrador') NOT NULL DEFAULT 'usuario',
    medallas INT DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP NULL,
    racha_dias INT DEFAULT 0,
    ultima_racha DATE NULL,
    session_token VARCHAR(64) NULL,
    deleted_at TIMESTAMP NULL
);

-- Tabla de esquemas guardados
CREATE TABLE IF NOT EXISTS esquemas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    nombre VARCHAR(100) NOT NULL,
    estructura_json JSON NOT NULL,
    dependencias_json JSON NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de validaciones
CREATE TABLE IF NOT EXISTS validaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    esquema_id INT NOT NULL,
    nivel_normalizacion VARCHAR(10) NOT NULL,
    violaciones_json JSON NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (esquema_id) REFERENCES esquemas(id) ON DELETE CASCADE
);

-- Tabla de puzzles
CREATE TABLE IF NOT EXISTS puzzles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enunciado TEXT NOT NULL,
    tablas_inicial JSON NOT NULL,
    df_inicial JSON NOT NULL,
    solucion_esperada JSON NOT NULL,
    nivel_dificultad INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de logs del sistema (REVISADA)
CREATE TABLE IF NOT EXISTS logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('error', 'evento', 'admin_accion') NOT NULL,
    mensaje TEXT NOT NULL,
    user_id INT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de intentos de puzzles
CREATE TABLE IF NOT EXISTS intentos_puzzle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    puzzle_id INT NOT NULL,
    puntuacion INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
);

-- Tabla de retos semanales
CREATE TABLE IF NOT EXISTS retos_semanales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL,
    tablas JSON NOT NULL,
    df JSON NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    CHECK (fecha_fin >= fecha_inicio)
);

-- Tabla de participaciones en retos
CREATE TABLE IF NOT EXISTS participaciones_reto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reto_id INT NOT NULL,
    puntuacion INT NOT NULL,
    tiempo_segundos INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reto_id) REFERENCES retos_semanales(id) ON DELETE CASCADE
);

-- Tabla de niveles de aprendizaje
CREATE TABLE IF NOT EXISTS learning_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    world INT NOT NULL,
    level_number INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    initial_schema JSON NOT NULL,
    expected_solution JSON NOT NULL,
    theory TEXT,
    hints JSON NULL,
    xp INT DEFAULT 100,
    difficulty ENUM('Fácil', 'Medio', 'Difícil', 'Muy Difícil') DEFAULT 'Fácil'
);

-- Tabla de progreso del usuario
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    level_id INT NOT NULL,
    stars_earned INT DEFAULT 0,
    score INT DEFAULT 0,
    attempts INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES learning_levels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_level (user_id, level_id)
);

-- Tabla de medallas disponibles
CREATE TABLE IF NOT EXISTS medals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'fa-medal',
    tipo_condicion ENUM('puzzles_solved', 'retos_completed', 'xp_reached') NOT NULL,
    valor_condicion INT NOT NULL
);

-- Tabla de medallas de usuario
CREATE TABLE IF NOT EXISTS user_medals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medal_id INT NOT NULL,
    fecha_ganada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medal_id) REFERENCES medals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_medal (user_id, medal_id)
);

-- Índices
CREATE INDEX idx_users_correo ON users(correo);
CREATE INDEX idx_users_apodo ON users(apodo);
CREATE INDEX idx_esquemas_user ON esquemas(user_id);
CREATE INDEX idx_validaciones_esquema ON validaciones(esquema_id);
CREATE INDEX idx_intentos_user ON intentos_puzzle(user_id);
CREATE INDEX idx_participaciones_user ON participaciones_reto(user_id);
CREATE INDEX idx_logs_fecha ON logs_sistema(fecha);
CREATE INDEX idx_user_medals_user ON user_medals(user_id);

-- Tabla de intentos de rate limit (para prevenir fuerza bruta)
CREATE TABLE IF NOT EXISTS rate_limit_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_time (identifier, attempted_at)
);

-- Usuario administrador por defecto (correo: admin@dataquest.com, apodo: admin, contraseña: admin123)
-- Hash de 'admin123'
INSERT INTO users (correo, apodo, password_hash, role, medallas) VALUES
('admin@dataquest-project.com', 'admin', '$2y$10$7rLSv4yqLZJ5Z6J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0', 'administrador', 0)
ON DUPLICATE KEY UPDATE id=id;

-- Medallas iniciales
INSERT INTO medals (nombre, descripcion, icono, tipo_condicion, valor_condicion) VALUES
('Iniciado', 'Resuelve tu primer puzzle', 'fa-baby', 'puzzles_solved', 1),
('Detective Relacional', 'Resuelve 5 puzzles', 'fa-search', 'puzzles_solved', 5),
('Maestro de Formas', 'Resuelve 10 puzzles', 'fa-crown', 'puzzles_solved', 10),
('Colaborador Semanal', 'Participa en tu primer reto', 'fa-calendar-check', 'retos_completed', 1),
('Leyenda de DataQuest', 'Completa 5 retos semanales', 'fa-star', 'retos_completed', 5)
ON DUPLICATE KEY UPDATE id=id;

-- Puzzle ejemplo
INSERT INTO puzzles (enunciado, tablas_inicial, df_inicial, solucion_esperada, nivel_dificultad) VALUES
('Normaliza la tabla VENTAS a 3FN', '["VENTAS(id_venta, producto, cliente, ciudad_cliente)"]', '[{"lhs":["id_venta"],"rhs":["producto","cliente","ciudad_cliente"]},{"lhs":["cliente"],"rhs":["ciudad_cliente"]}]', '["VENTAS(id_venta, producto, cliente)", "CLIENTES(cliente, ciudad_cliente)"]', 2);

-- Reto semanal activo
INSERT INTO retos_semanales (descripcion, tablas, df, fecha_inicio, fecha_fin, activo) VALUES
('Encuentra la forma normal más alta de la tabla PEDIDOS con DFs: id_pedido → cliente, id_pedido+producto → cantidad', '["PEDIDOS(id_pedido, producto, cliente, cantidad)"]', '[{"lhs":["id_pedido"],"rhs":["cliente"]},{"lhs":["id_pedido","producto"],"rhs":["cantidad"]}]', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1);

-- Datos de ejemplo para niveles
SET @count = (SELECT COUNT(*) FROM learning_levels);

INSERT INTO learning_levels (world, level_number, title, description, initial_schema, expected_solution, difficulty, xp, hints) 
SELECT 1, 1, 'La Ciudad de los Atributos', 'Aprende a identificar atributos atómicos y compuestos.', '["CLIENTES(id, nombre_completo, direccion)"]', '["CLIENTES(id, nombre, apellidos, calle, ciudad)"]', 'Fácil', 100, '["Recuerda que un atributo atómico es indivisible.", "Fíjate en el atributo `nombre_completo` y `direccion`.", "Deberías dividir `nombre_completo` en `nombre` y `apellidos`, y `direccion` en `calle` y `ciudad`."]'
WHERE @count = 0;

INSERT INTO learning_levels (world, level_number, title, description, initial_schema, expected_solution, difficulty, xp, hints) 
SELECT 1, 2, 'El Puente de las Dependencias', 'Domina las dependencias funcionales básicas.', '["EMPLEADOS(id, nombre, depto, jefe_depto)"]', '["EMPLEADOS(id, nombre, depto)", "DEPARTAMENTOS(depto, jefe_depto)"]', 'Medio', 250, '["Revisa qué atributo determina realmente a quién pertenece el departamento.", "El jefe de departamento depende del departamento, no directamente del empleado.", "Crea una tabla `DEPARTAMENTOS(depto, jefe_depto)` y quita `jefe_depto` de empleados."]'
WHERE @count = 0;

INSERT INTO learning_levels (world, level_number, title, description, initial_schema, expected_solution, difficulty, xp, hints) 
SELECT 1, 3, 'La Fortaleza de la 2FN', 'Elimina las dependencias parciales del reino.', '["INSCRIPCIONES(id_est, id_curso, nombre_est, creditos)"]', '["INSCRIPCIONES(id_est, id_curso)", "ESTUDIANTES(id_est, nombre_est)", "CURSOS(id_curso, creditos)"]', 'Difícil', 400, '["Para estar en 2FN, no debe haber dependencias parciales de la clave primaria compuesta.", "La clave de la tabla original es (id_est, id_curso). ¿El nombre del estudiante depende de ambos?", "Separa la información del estudiante y del curso en sus propias tablas, dejando solo las claves en la tabla relacional."]'
WHERE @count = 0;

INSERT INTO learning_levels (world, level_number, title, description, initial_schema, expected_solution, difficulty, xp, hints) 
SELECT 1, 4, 'El Santuario de la 3FN', 'Purifica las tablas de dependencias transitivas.', '["COMPRAS(id, fecha, id_proveedor, nom_proveedor, telefono_prov)"]', '["COMPRAS(id, fecha, id_proveedor)", "PROVEEDORES(id_proveedor, nom_proveedor, telefono_prov)"]', 'Muy Difícil', 600, '["La 3FN se viola cuando hay dependencias transitivas: X -> Y y Y -> Z.", "¿El teléfono del proveedor depende de la compra o del proveedor?", "Separa los datos del proveedor en `PROVEEDORES(id_proveedor, nom_proveedor, telefono_prov)`."]'
WHERE @count = 0;

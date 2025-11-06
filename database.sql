-- Base de datos para TMNT Runner
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS tmnt_runner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tmnt_runner;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de puntuaciones
CREATE TABLE IF NOT EXISTS puntuaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    puntuacion INT NOT NULL,
    tortuga_usada VARCHAR(20) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_puntuacion (puntuacion DESC),
    INDEX idx_fecha (fecha DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar algunos usuarios de prueba (opcional)
-- Las contraseñas están hasheadas con password_hash()
-- Contraseña para todos: "test123"
INSERT INTO usuarios (username, email, password) VALUES
('leonardo_fan', 'leo@tmnt.com', 'tmnt10'),
('raph_master', 'raph@tmnt.com', 'tmnt11'),
('donnie_tech', 'donnie@tmnt.com', 'tmnt12'),
('mikey_pizza', 'mikey@tmnt.com', 'tmnt13');

-- Insertar algunas puntuaciones de prueba
INSERT INTO puntuaciones (usuario_id, puntuacion, tortuga_usada) VALUES
(1, 1250, 'leonardo'),
(1, 980, 'leonardo'),
(2, 1450, 'raphael'),
(2, 1120, 'raphael'),
(3, 1680, 'donatello'),
(3, 890, 'donatello'),
(4, 1340, 'michelangelo'),
(4, 1570, 'michelangelo');
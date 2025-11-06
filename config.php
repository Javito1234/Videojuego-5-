<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'tmnt_runner');
define('DB_USER', 'root');
define('DB_PASS', '');

// Configuración de sesión
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Cambiar a 1 si usas HTTPS
session_start();

// Conexión a la base de datos
function getDB() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        die(json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']));
    }
}

// Función para validar si el usuario está logueado
function isLoggedIn() {
    return isset($_SESSION['usuario_id']);
}

// Función para obtener el ID del usuario actual
function getUserId() {
    return $_SESSION['usuario_id'] ?? null;
}

// Función para obtener el nombre del usuario actual
function getUsername() {
    return $_SESSION['username'] ?? null;
}

// Headers para JSON
header('Content-Type: application/json; charset=utf-8');
?>
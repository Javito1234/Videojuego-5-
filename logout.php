<?php
require_once 'config.php';

// Destruir la sesión
session_unset();
session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Sesión cerrada exitosamente'
]);
?>
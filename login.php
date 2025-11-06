<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos del POST
$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

// Validaciones básicas
if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Usuario y contraseña son requeridos']);
    exit;
}

try {
    $db = getDB();
    
    // Buscar el usuario
    $stmt = $db->prepare("SELECT id, username, password, tortuga_favorita FROM usuarios WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        exit;
    }
    
    // Verificar la contraseña
    if (!password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        exit;
    }
    
    // Iniciar sesión
    $_SESSION['usuario_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['tortuga_favorita'] = $user['tortuga_favorita'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'tortuga_favorita' => $user['tortuga_favorita']
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al iniciar sesión: ' . $e->getMessage()]);
}
?>
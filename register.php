<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos del POST
$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$tortuga = $data['tortuga'] ?? 'michelangelo';

// Validaciones
$errors = [];

if (empty($username)) {
    $errors[] = 'El nombre de usuario es requerido';
} elseif (strlen($username) < 3 || strlen($username) > 50) {
    $errors[] = 'El nombre de usuario debe tener entre 3 y 50 caracteres';
} elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    $errors[] = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
}

if (empty($email)) {
    $errors[] = 'El email es requerido';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'El email no es válido';
}

if (empty($password)) {
    $errors[] = 'La contraseña es requerida';
} elseif (strlen($password) < 6) {
    $errors[] = 'La contraseña debe tener al menos 6 caracteres';
}

$tortugasValidas = ['leonardo', 'raphael', 'donatello', 'michelangelo'];
if (!in_array($tortuga, $tortugasValidas)) {
    $errors[] = 'Tortuga seleccionada no válida';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

try {
    $db = getDB();
    
    // Verificar si el usuario ya existe
    $stmt = $db->prepare("SELECT id FROM usuarios WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'El nombre de usuario o email ya están registrados']);
        exit;
    }
    
    // Hashear la contraseña
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar el nuevo usuario
    $stmt = $db->prepare("INSERT INTO usuarios (username, email, password, tortuga_favorita) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $hashedPassword, $tortuga]);
    
    $userId = $db->lastInsertId();
    
    // Iniciar sesión automáticamente
    $_SESSION['usuario_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['tortuga_favorita'] = $tortuga;
    
    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado exitosamente',
        'user' => [
            'id' => $userId,
            'username' => $username,
            'tortuga_favorita' => $tortuga
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al registrar usuario: ' . $e->getMessage()]);
}
?>
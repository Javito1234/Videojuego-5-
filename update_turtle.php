<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión']);
    exit;
}

// Obtener datos del POST
$data = json_decode(file_get_contents('php://input'), true);
$tortuga = trim($data['tortuga'] ?? '');

// Validar tortuga
$tortugasValidas = ['leonardo', 'raphael', 'donatello', 'michelangelo'];
if (!in_array($tortuga, $tortugasValidas)) {
    echo json_encode(['success' => false, 'error' => 'Tortuga seleccionada no válida']);
    exit;
}

try {
    $db = getDB();
    $userId = getUserId();
    
    // Actualizar la tortuga favorita del usuario
    $stmt = $db->prepare("UPDATE usuarios SET tortuga_favorita = ? WHERE id = ?");
    $stmt->execute([$tortuga, $userId]);
    
    // Actualizar la sesión
    $_SESSION['tortuga_favorita'] = $tortuga;
    
    echo json_encode([
        'success' => true,
        'message' => 'Tortuga favorita actualizada',
        'tortuga_favorita' => $tortuga
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al actualizar tortuga: ' . $e->getMessage()]);
}
?>
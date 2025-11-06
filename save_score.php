<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión para guardar puntuaciones']);
    exit;
}

// Obtener datos del POST
$data = json_decode(file_get_contents('php://input'), true);
$puntuacion = intval($data['puntuacion'] ?? 0);
$tortuga = trim($data['tortuga'] ?? '');

// Validaciones
if ($puntuacion <= 0) {
    echo json_encode(['success' => false, 'error' => 'Puntuación inválida']);
    exit;
}

$tortugasValidas = ['leonardo', 'raphael', 'donatello', 'michelangelo'];
if (!in_array($tortuga, $tortugasValidas)) {
    echo json_encode(['success' => false, 'error' => 'Tortuga seleccionada no válida']);
    exit;
}

try {
    $db = getDB();
    $userId = getUserId();
    
    // Guardar la puntuación
    $stmt = $db->prepare("INSERT INTO puntuaciones (usuario_id, puntuacion, tortuga_usada) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $puntuacion, $tortuga]);
    
    // Obtener la mejor puntuación del usuario
    $stmt = $db->prepare("SELECT MAX(puntuacion) as mejor_puntuacion FROM puntuaciones WHERE usuario_id = ?");
    $stmt->execute([$userId]);
    $result = $stmt->fetch();
    
    // Obtener el ranking del usuario
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT usuario_id) + 1 as ranking
        FROM puntuaciones p1
        WHERE (
            SELECT MAX(puntuacion) 
            FROM puntuaciones p2 
            WHERE p2.usuario_id = p1.usuario_id
        ) > ?
    ");
    $stmt->execute([$result['mejor_puntuacion']]);
    $ranking = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Puntuación guardada exitosamente',
        'puntuacion' => $puntuacion,
        'mejor_puntuacion' => $result['mejor_puntuacion'],
        'ranking' => $ranking['ranking']
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al guardar puntuación: ' . $e->getMessage()]);
}
?>
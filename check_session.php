<?php
require_once 'config.php';

if (isLoggedIn()) {
    $userId = getUserId();
    
    try {
        $db = getDB();
        
        // Obtener información completa del usuario
        $stmt = $db->prepare("
            SELECT 
                u.id,
                u.username,
                u.tortuga_favorita,
                COALESCE(MAX(p.puntuacion), 0) as mejor_puntuacion,
                COUNT(p.id) as total_partidas
            FROM usuarios u
            LEFT JOIN puntuaciones p ON u.id = p.usuario_id
            WHERE u.id = ?
            GROUP BY u.id, u.username, u.tortuga_favorita
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'logged_in' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'tortuga_favorita' => $user['tortuga_favorita'],
                'mejor_puntuacion' => $user['mejor_puntuacion'],
                'total_partidas' => $user['total_partidas']
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error al obtener datos de sesión']);
    }
} else {
    echo json_encode([
        'success' => true,
        'logged_in' => false
    ]);
}
?>
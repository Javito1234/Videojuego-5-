<?php
require_once 'config.php';

try {
    $db = getDB();
    
    // Obtener el top 10 de mejores puntuaciones
    $stmt = $db->prepare("
        SELECT 
            u.username,
            u.tortuga_favorita,
            MAX(p.puntuacion) as mejor_puntuacion,
            COUNT(p.id) as total_partidas,
            MAX(p.fecha) as ultima_partida
        FROM usuarios u
        INNER JOIN puntuaciones p ON u.id = p.usuario_id
        GROUP BY u.id, u.username, u.tortuga_favorita
        ORDER BY mejor_puntuacion DESC
        LIMIT 10
    ");
    $stmt->execute();
    $leaderboard = $stmt->fetchAll();
    
    // Si el usuario está logueado, obtener su posición
    $userRanking = null;
    if (isLoggedIn()) {
        $userId = getUserId();
        
        // Obtener la mejor puntuación del usuario
        $stmt = $db->prepare("SELECT MAX(puntuacion) as mejor_puntuacion FROM puntuaciones WHERE usuario_id = ?");
        $stmt->execute([$userId]);
        $userBest = $stmt->fetch();
        
        if ($userBest && $userBest['mejor_puntuacion']) {
            // Calcular el ranking del usuario
            $stmt = $db->prepare("
                SELECT COUNT(DISTINCT usuario_id) + 1 as ranking
                FROM puntuaciones p1
                WHERE (
                    SELECT MAX(puntuacion) 
                    FROM puntuaciones p2 
                    WHERE p2.usuario_id = p1.usuario_id
                ) > ?
            ");
            $stmt->execute([$userBest['mejor_puntuacion']]);
            $rankingData = $stmt->fetch();
            
            // Obtener datos completos del usuario
            $stmt = $db->prepare("
                SELECT 
                    u.username,
                    u.tortuga_favorita,
                    MAX(p.puntuacion) as mejor_puntuacion,
                    COUNT(p.id) as total_partidas
                FROM usuarios u
                INNER JOIN puntuaciones p ON u.id = p.usuario_id
                WHERE u.id = ?
                GROUP BY u.id, u.username, u.tortuga_favorita
            ");
            $stmt->execute([$userId]);
            $userData = $stmt->fetch();
            
            $userRanking = [
                'ranking' => $rankingData['ranking'],
                'username' => $userData['username'],
                'tortuga_favorita' => $userData['tortuga_favorita'],
                'mejor_puntuacion' => $userData['mejor_puntuacion'],
                'total_partidas' => $userData['total_partidas']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'leaderboard' => $leaderboard,
        'user_ranking' => $userRanking
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al obtener leaderboard: ' . $e->getMessage()]);
}
?>
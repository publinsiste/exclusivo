<?php
header('Content-Type: application/json');

// Tus credenciales de OVH Cloud
$host = 'le624640-001.eu.clouddb.ovh.net';
$port = '35925';
$db   = 'Publinsiste'; // Asumiendo que el nombre de la BD coincide con el usuario
$user = 'dsancram';
$pass = '52xmaxABC';

try {
    // Es vital añadir el puerto al DSN de PDO
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener escorts y sus reservas
    $stmt = $pdo->query("
        SELECT e.id, e.nombre, GROUP_CONCAT(r.fecha_reserva) as ocupadas 
        FROM escorts e 
        LEFT JOIN reservas r ON e.id = r.escort_id 
        GROUP BY e.id
    ");
    
    $escorts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $escorts[] = [
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'ocupadas' => $row['ocupadas'] ? explode(',', $row['ocupadas']) : []
        ];
    }
    
    echo json_encode(['escorts' => $escorts]);
    
} catch (PDOException $e) {
    // Si falla, devolvemos un JSON válido en lugar de texto plano
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
}
?>

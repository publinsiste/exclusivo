<?php
header('Content-Type: application/json');

// Tus credenciales de OVH Cloud
$host = 'le624640-001.eu.clouddb.ovh.net';
$port = '35925';
$db   = 'Publinsiste';
$user = 'dsancram';
$pass = '52xmaxABC';

try {
    // Conexión PDO
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Consulta actualizada con los nuevos campos
    $stmt = $pdo->query("
        SELECT e.id, e.nombre, e.foto_url, e.descripcion, e.tarifa, GROUP_CONCAT(r.fecha_reserva) as ocupadas 
        FROM escorts e 
        LEFT JOIN reservas r ON e.id = r.escort_id 
        GROUP BY e.id
    ");
    
    $escorts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $escorts[] = [
            'id'          => (int)$row['id'],
            'nombre'      => $row['nombre'],
            'foto_url'    => $row['foto_url'],
            'descripcion' => $row['descripcion'],
            'tarifa'      => (float)$row['tarifa'],
            'ocupadas'    => $row['ocupadas'] ? explode(',', $row['ocupadas']) : []
        ];
    }
    
    echo json_encode(['escorts' => $escorts]);
    
} catch (PDOException $e) {
    // Manejo de errores en formato JSON
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
}
?>
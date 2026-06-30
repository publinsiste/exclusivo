<?php
header('Content-Type: application/json');

// Credenciales (Cámbialas por las reales de tu panel OVH)
$host = 'mysql5-xxxx.hosting.ovh.net';
$db   = 'nombre_de_tu_bbdd';
$user = 'tu_usuario';
$pass = 'tu_contraseña';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    
    // Obtener escorts y sus reservas ocupadas
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
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
}
?>
<?php
$host = 'le624640-001.eu.clouddb.ovh.net';
$port = '35925';
$db   = 'Publinsiste';
$user = 'dsancram';
$pass = '52xmaxABC';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $pass);
    echo "Conexión exitosa a la base de datos.";
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>

<?php
$allowed_origins = ['http://localhost:3000', 'http://localhost:3001','http://localhost:3002','http://localhost:3003'];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json');
header("Access-Control-Allow-Credentials: true");

// Database connection
$mysqli = new mysqli("localhost", "root", "dqh12345", "SHEMS", 3306);
if ($mysqli->connect_error) {
    echo json_encode(['error' => "Connect failed: " . $mysqli->connect_error]);
    exit();
}
?>

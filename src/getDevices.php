<?php
session_start();
include "connectDB.php";

$response = ['isLoggedIn' => false,'username' =>'', 'data' => []];
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'];

if (isset($_SESSION['user']) && $_SESSION['user'] === $username) {
    $response['isLoggedIn'] = true;
    $username = $_SESSION['user'];
    $response['username'] = $username ;
    $query = "SELECT * FROM Devices;";
    if ($stmt = $mysqli->prepare($query)) {
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $response['data'][] = $row;
        }
        $response['success'] = true;
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Query preparation failed']);
        exit();
    }
}else{
    $response['error'] = 'not logged in';
}

echo json_encode($response);
?>

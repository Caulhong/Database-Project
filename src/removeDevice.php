<?php
session_start();
include "connectDB.php";

$response = ['isLoggedIn' => false,'username' =>'', 'success' => false];
$input = json_decode(file_get_contents('php://input'), true);
$deviceID = $input['selectedDeviceId'];
$username = $input['username'];

if (isset($_SESSION['user'])&& $_SESSION['user'] === $username) {
    $response['isLoggedIn'] = true;
    $username = $_SESSION['user'];
    $response['username'] = $username ;
    $query = "DELETE FROM Enrolled_Devices WHERE device_id = ?;";
    if ($stmt = $mysqli->prepare($query)) {
        $stmt->bind_param('i', $deviceID);
        $stmt->execute();
        $stmt->close();
        $response['success'] = true;
    } else {
        echo json_encode(['error' => 'Query preparation failed']);
        exit();
    }
}else{
    $response['error'] = 'not logged in';
}

echo json_encode($response);
?>

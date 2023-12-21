<?php
session_start();
include "connectDB.php";
$response = ['isLoggedIn' => false,'username' =>'', 'data' => []];


$Data = file_get_contents("php://input");
$Data = json_decode($Data, true);
$address = $Data['address'];
$unit = $Data['unit'];
$username = $Data['username'];
if (isset($_SESSION['user'])&& $_SESSION['user'] === $username) {
    $response['isLoggedIn'] = true;
    $username = $_SESSION['user'];
    $response['username'] = $username ;
  }else{
    $response['error'] = 'not logged in';
    echo json_encode($response);
    exit();
  }
$sql = "SELECT * FROM enrolled_devices WHERE building_address = ? AND unit_number = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("ss", $address, $unit);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$mysqli->close();
$response['data'] = $row;
echo json_encode($response);
?>

<?php
session_start();
include "connectDB.php";

$response = ['isLoggedIn' => false,'username' =>'', 'success' => false];
$input = json_decode(file_get_contents('php://input'), true);
$buildingAddress = $input['buildingAddress'];
$unitNumber = $input['unitNumber'];
$date = $input['date'];
$squareFeet = $input['squareFeet'];
$numBedrooms = $input['numBedrooms'];
$zipCode = $input['zipCode'];
$username = $input['username'];

function locationExists($mysqli, $buildingAddress,$unitNumber) {
    $query = "SELECT * FROM Locations WHERE building_address = ? AND unit_number = ?";
    if ($stmt = $mysqli->prepare($query)) {
        $stmt->bind_param("si", $buildingAddress, $unitNumber);
        $stmt->execute();
        $result = $stmt->get_result();
        $exists = $result->num_rows > 0;
        $stmt->close();
        return $exists;
    } else {
        echo json_encode(['error' => 'Query preparation failed']);
        exit();
    }
}
//check existing location
if (locationExists($mysqli, $buildingAddress,$unitNumber)) {
    echo json_encode(['success' => false, 'error' => 'Location already exists']);
    exit();
}
//check fields are not empty
if (empty($buildingAddress) || empty($unitNumber) || empty($date) || empty($squareFeet) || empty($numBedrooms) || empty($zipCode)) {
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit();
}

if (isset($_SESSION['user']) && $_SESSION['user'] === $username) {
    $response['isLoggedIn'] = true;
    $username = $_SESSION['user'];
    $response['username'] = $username ;
    $query = "INSERT INTO Locations (building_address, unit_number, date, square_feet, num_bedrooms, zip_code, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    if ($stmt = $mysqli->prepare($query)) {
        $stmt->bind_param("sisiiis", $buildingAddress, $unitNumber, $date, $squareFeet, $numBedrooms, $zipCode, $username);
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

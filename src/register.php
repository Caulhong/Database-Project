<?php
session_start();
include "connectDB.php";

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'];
$name = $input['name'];
$billingAddress = $input['billingAddress'];
$password = $input['password'];


if (empty($username) || empty($name) || empty($billingAddress) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit();
}


function usernameExists($mysqli, $username) {
    $query = "SELECT customer_id FROM Customers WHERE customer_id = ?";
    if ($stmt = $mysqli->prepare($query)) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $exists = $result->num_rows > 0;
        $stmt->close();
        return $exists;
    } else {
        echo json_encode(['error' => 'Query Preparation failed']);
        exit();
    }
}

// Check if username already exists
if (usernameExists($mysqli, $username)) {
    echo json_encode(['success' => false, 'error' => 'Username already exists']);
    exit();
}

// Insert new user into the database
$query = "INSERT INTO Customers (customer_id, name, billing_address, password) VALUES (?, ?, ?, ?)";
if ($stmt = $mysqli->prepare($query)) {
    $stmt->bind_param("ssss", $username, $name, $billingAddress, $password);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'error' => 'Registration successful']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Registration failed']);
    }
    $stmt->close();
} else {
    echo json_encode(['error' => 'Query preparation failed']);
}

$mysqli->close();
?>

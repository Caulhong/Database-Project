<?php
session_start();
include "connectDB.php";

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'];
$password = $input['password'];


// Authenticate User
function authenticateUser($mysqli, $username, $password) {
    $query = "SELECT password FROM Customers WHERE customer_id = ?";
    if ($stmt = $mysqli->prepare($query)) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            // Compare the passwords
            $stmt->close();
            return $password === $row['password'];
        } else {
            // Username not found
            $stmt->close();
            return false;
        }
    } else {
        echo json_encode(['error' => 'Query preparation failed']);
        exit();
    }
}

// Check authentication
$isAuthenticated = authenticateUser($mysqli, $username, $password);
if ($isAuthenticated) {
    $_SESSION['user'] = $username;
    echo json_encode(['success' => true, 'message' => 'Login successful']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}


$mysqli->close();
?>
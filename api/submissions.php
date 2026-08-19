<?php
require_once 'config.php';

$pdo = getDB();

// GET all submissions
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM submissions ORDER BY created_at DESC");
    $items = $stmt->fetchAll();
    sendResponse(['success' => true, 'data' => $items]);
}

// POST - Add submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $phone = $data['phone'] ?? '';
    $service = $data['service'] ?? '';
    $message = $data['message'] ?? '';
    
    if (empty($name) || empty($email) || empty($message)) {
        sendResponse(['error' => 'Name, email, and message are required'], 400);
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO submissions (name, email, phone, service, message, status) 
        VALUES (?, ?, ?, ?, ?, 'new')
    ");
    $stmt->execute([$name, $email, $phone, $service, $message]);
    
    sendResponse(['success' => true, 'message' => 'Submission saved successfully'], 201);
}

// PUT - Update status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $status = $data['status'] ?? null;
    
    if (!$id || !$status) {
        sendResponse(['error' => 'ID and status are required'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE submissions SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    
    sendResponse(['success' => true, 'message' => 'Status updated successfully']);
}

// DELETE - Remove submission
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendResponse(['error' => 'ID is required'], 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM submissions WHERE id = ?");
    $stmt->execute([$id]);
    
    sendResponse(['success' => true, 'message' => 'Submission deleted successfully']);
}
?>
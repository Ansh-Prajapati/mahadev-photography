<?php
require_once 'config.php';

$pdo = getDB();

// ========================================
// GET ALL IMAGES
// ========================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM gallery WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        if ($item) {
            sendResponse(['success' => true, 'data' => $item]);
        } else {
            sendResponse(['error' => 'Image not found'], 404);
        }
    } else {
        $stmt = $pdo->query("SELECT * FROM gallery ORDER BY created_at DESC");
        $items = $stmt->fetchAll();
        sendResponse(['success' => true, 'data' => $items]);
    }
}

// ========================================
// ADD IMAGE
// ========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $title = $data['title'] ?? '';
    $category = $data['category'] ?? 'custom';
    $image_url = $data['image_url'] ?? '';
    $description = $data['description'] ?? '';
    // PDO serializes false as an empty string, which MySQL rejects for a
    // BOOLEAN/TINYINT column in strict mode. Always send an explicit integer.
    $featured = !empty($data['featured']) ? 1 : 0;
    
    if (empty($title) || empty($image_url)) {
        sendResponse(['error' => 'Title and image URL are required'], 400);
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO gallery (title, category, image_url, description, featured) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$title, $category, $image_url, $description, $featured]);
    
    $id = $pdo->lastInsertId();
    sendResponse([
        'success' => true,
        'message' => 'Image added successfully',
        'id' => $id
    ], 201);
}

// ========================================
// UPDATE IMAGE
// ========================================
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        sendResponse(['error' => 'ID is required'], 400);
    }
    
    $title = $data['title'] ?? '';
    $category = $data['category'] ?? 'custom';
    $image_url = $data['image_url'] ?? '';
    $description = $data['description'] ?? '';
    $featured = !empty($data['featured']) ? 1 : 0;
    
    $stmt = $pdo->prepare("
        UPDATE gallery 
        SET title = ?, category = ?, image_url = ?, description = ?, featured = ? 
        WHERE id = ?
    ");
    $stmt->execute([$title, $category, $image_url, $description, $featured, $id]);
    
    sendResponse(['success' => true, 'message' => 'Image updated successfully']);
}

// ========================================
// DELETE IMAGE
// ========================================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendResponse(['error' => 'ID is required'], 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
    $stmt->execute([$id]);
    
    sendResponse(['success' => true, 'message' => 'Image deleted successfully']);
}
?>

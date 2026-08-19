<?php
require_once 'config.php';

$pdo = getDB();

// GET all packages
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        if ($item) {
            $item['features'] = json_decode($item['features'], true) ?: [];
            sendResponse(['success' => true, 'data' => $item]);
        } else {
            sendResponse(['error' => 'Package not found'], 404);
        }
    } else {
        $stmt = $pdo->query("SELECT * FROM packages ORDER BY price ASC");
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            $item['features'] = json_decode($item['features'], true) ?: [];
        }
        sendResponse(['success' => true, 'data' => $items]);
    }
}

// POST - Add package
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    $price = $data['price'] ?? 0;
    $features = $data['features'] ?? [];
    $featured = $data['featured'] ?? false;
    
    if (empty($name) || empty($price)) {
        sendResponse(['error' => 'Name and price are required'], 400);
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO packages (name, price, features, featured) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$name, $price, json_encode($features), $featured]);
    
    sendResponse(['success' => true, 'message' => 'Package added successfully'], 201);
}

// PUT - Update package
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        sendResponse(['error' => 'ID is required'], 400);
    }
    
    $name = $data['name'] ?? '';
    $price = $data['price'] ?? 0;
    $features = $data['features'] ?? [];
    $featured = $data['featured'] ?? false;
    
    $stmt = $pdo->prepare("
        UPDATE packages 
        SET name = ?, price = ?, features = ?, featured = ? 
        WHERE id = ?
    ");
    $stmt->execute([$name, $price, json_encode($features), $featured, $id]);
    
    sendResponse(['success' => true, 'message' => 'Package updated successfully']);
}

// DELETE - Remove package
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendResponse(['error' => 'ID is required'], 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM packages WHERE id = ?");
    $stmt->execute([$id]);
    
    sendResponse(['success' => true, 'message' => 'Package deleted successfully']);
}
?>
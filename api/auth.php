<?php
require_once 'config.php';

// ========================================
// ADMIN LOGIN
// ========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = strtolower(trim($data['email'] ?? ''));
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        sendResponse(['error' => 'Email and password are required'], 400);
    }
    
    $pdo = getDB();
    
    // Check if users table exists
    try {
        // Accept the original seeded address once, then migrate it to the
        // canonical account address after a successful sign-in.
        $legacyEmail = 'admin@brijesh123.com';
        $canonicalEmail = 'admin@mahadevphotography.com';
        $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = ? OR (? = ? AND LOWER(email) = ?) LIMIT 1");
        $stmt->execute([$email, $email, $canonicalEmail, $legacyEmail]);
        $user = $stmt->fetch();
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
    
    // Older installations stored the seeded password as plain text. Permit
    // that one successful login and immediately upgrade it to a PHP hash.
    $storedPassword = $user['password'] ?? '';
    $validPassword = $user && (password_verify($password, $storedPassword) || hash_equals($storedPassword, $password));

    if ($validPassword) {
        if (password_needs_rehash($storedPassword, PASSWORD_DEFAULT) || !password_verify($password, $storedPassword)) {
            $upgrade = $pdo->prepare("UPDATE users SET password = ?, email = ? WHERE id = ?");
            $upgrade->execute([password_hash($password, PASSWORD_DEFAULT), 'admin@mahadevphotography.com', $user['id']]);
            $user['email'] = 'admin@mahadevphotography.com';
        }
        $token = base64_encode(json_encode([
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ]));
        
        sendResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    } else {
        sendResponse(['error' => 'Invalid email or password'], 401);
    }
} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>

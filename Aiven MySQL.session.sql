-- ========================================
-- MAHADEV PHOTOGRAPHY - COMPLETE DATABASE
-- ========================================

-- ========================================
-- USERS TABLE
-- ========================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin (password: admin123)
-- This is a bcrypt hash for 'admin123'
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@mahadevphotography.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ========================================
-- GALLERY TABLE
-- ========================================
DROP TABLE IF EXISTS gallery;
CREATE TABLE gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'custom',
    image_url TEXT NOT NULL,
    description TEXT,
    featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- PACKAGES TABLE
-- ========================================
DROP TABLE IF EXISTS packages;
CREATE TABLE packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSON NOT NULL,
    featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default packages
INSERT INTO packages (name, price, features, featured) VALUES
('Silver', 14999.00, '["4 hours coverage","100+ edited photos","Online gallery","Digital delivery"]', 0),
('Gold', 29999.00, '["8 hours coverage","300+ edited photos","Online gallery","Digital delivery","2 Photographers","Pre-wedding shoot"]', 1),
('Platinum', 49999.00, '["12 hours coverage","500+ edited photos","Online gallery","Digital delivery","3 Photographers","Pre-wedding & Post-wedding","Album design"]', 0);

-- ========================================
-- SUBMISSIONS TABLE
-- ========================================
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    service VARCHAR(50),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- SETTINGS TABLE
-- ========================================
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Mahadev Photography'),
('site_email', 'mahadevphotography1921@gmail.com'),
('site_phone', '+91 94264 24213'),
('site_phone2', '+91 81608 42941'),
('site_address', 'Madhav 99, Vastral, Ahmedabad, Gujarat 382418'),
('youtube_url', 'https://www.youtube.com/@mahadev_photography1921'),
('instagram_url', 'https://www.instagram.com/mahadev_photography1921');

-- ========================================
-- SAMPLE GALLERY IMAGES (Optional)
-- ========================================
INSERT INTO gallery (title, category, image_url, description, featured) VALUES
('Beautiful Wedding Ceremony', 'wedding', 'https://images.unsplash.com/photo-1511798616182-98b7d9a7e2cc?w=600&h=400&fit=crop', 'Elegant wedding photography capturing the special moment', 1),
('Romantic Pre-Wedding Shoot', 'prewedding', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop', 'Beautiful pre-wedding photoshoot in natural settings', 0),
('Engagement Celebration', 'engagement', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop', 'Capturing the joy of engagement ceremony', 0),
('Maternity Photoshoot', 'maternity', 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&h=400&fit=crop', 'Celebrating the beauty of motherhood', 0);

-- ========================================
-- VERIFY ALL TABLES
-- ========================================
SELECT '=== TABLES ===' as '';
SHOW TABLES;

SELECT '=== USERS ===' as '';
SELECT id, name, email, role FROM users;

SELECT '=== PACKAGES ===' as '';
SELECT id, name, price, featured FROM packages;

SELECT '=== SETTINGS ===' as '';
SELECT setting_key, setting_value FROM settings;

SELECT '=== GALLERY ===' as '';
SELECT id, title, category, featured FROM gallery;

-- ========================================
-- TEST QUERIES
-- ========================================
SELECT '✅ Database setup complete!' as 'Status';
SELECT COUNT(*) as 'Total Users' FROM users;
SELECT COUNT(*) as 'Total Packages' FROM packages;
SELECT COUNT(*) as 'Total Gallery Images' FROM gallery;
SELECT COUNT(*) as 'Total Settings' FROM settings;
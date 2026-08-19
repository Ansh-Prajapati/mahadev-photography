-- ========================================
-- MAHADEV PHOTOGRAPHY - FIXED DATABASE
-- ========================================

-- Use the existing database
USE mahadev_photography;

-- ========================================
-- DROP AND RECREATE GALLERY TABLE
-- ========================================
DROP TABLE IF EXISTS gallery;
CREATE TABLE gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'custom',
    image_url TEXT NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- DROP AND RECREATE PACKAGES TABLE
-- ========================================
DROP TABLE IF EXISTS packages;
CREATE TABLE packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- DROP AND RECREATE SUBMISSIONS TABLE
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
-- DROP AND RECREATE USERS TABLE (FIXED)
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

-- Insert default admin (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@Brijesh123.com', 'Brijesh@123', 'admin');

-- ========================================
-- DROP AND RECREATE SETTINGS TABLE
-- ========================================
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Mahadev Photography'),
('site_email', 'mahadevphotography1921@gmail.com'),
('site_phone', '+91 94264 24213'),
('site_phone2', '+91 81608 42941'),
('site_address', 'Madhav 99, Vastral, Ahmedabad, Gujarat 382418'),
('youtube_url', 'https://www.youtube.com/@mahadev_photography1921'),
('instagram_url', 'https://www.instagram.com/mahadev_photography1921?igsh=bWc3bTlyOTJ5MmJp');

-- ========================================
-- INSERT DEFAULT PACKAGES
-- ========================================
INSERT INTO packages (name, price, features, featured) VALUES
('Silver', 14999, '["4 hours coverage","100+ edited photos","Online gallery","Digital delivery"]', 0),
('Gold', 29999, '["8 hours coverage","300+ edited photos","Online gallery","Digital delivery","2 Photographers","Pre-wedding shoot"]', 1),
('Platinum', 49999, '["12 hours coverage","500+ edited photos","Online gallery","Digital delivery","3 Photographers","Pre-wedding & Post-wedding","Album design"]', 0);

-- ========================================
-- VERIFY TABLES
-- ========================================
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM packages;
SELECT * FROM settings;

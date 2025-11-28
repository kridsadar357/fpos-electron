CREATE DATABASE IF NOT EXISTS fuel_pos_electron;
USE fuel_pos_electron;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'cashier') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispensers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispenser_id INT,
    product_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    liters DECIMAL(10, 2) NOT NULL,
    payment_type ENUM('cash', 'promptpay') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispenser_id) REFERENCES dispensers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert initial data
INSERT IGNORE INTO products (name, price, stock, color) VALUES 
('Gasohol 95', 35.50, 10000, 'green'),
('Diesel B7', 32.20, 10000, 'red'),
('Gasohol 91', 34.80, 10000, 'yellow');

INSERT IGNORE INTO dispensers (name, status) VALUES 
('Dispenser 1', 'available'),
('Dispenser 2', 'available'),
('Dispenser 3', 'available'),
('Dispenser 4', 'available'),
('Dispenser 5', 'available'),
('Dispenser 6', 'available');

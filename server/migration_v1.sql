USE fuel_pos_electron;

-- Add type to products
ALTER TABLE products ADD COLUMN type ENUM('fuel', 'goods') NOT NULL DEFAULT 'goods';
UPDATE products SET type = 'fuel' WHERE name LIKE '%Gasohol%' OR name LIKE '%Diesel%';

-- Add status to transactions
ALTER TABLE transactions ADD COLUMN status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'completed';

-- Create nozzles table
CREATE TABLE IF NOT EXISTS nozzles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispenser_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    status ENUM('idle', 'active', 'locked') DEFAULT 'idle',
    FOREIGN KEY (dispenser_id) REFERENCES dispensers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Populate nozzles for existing dispensers (1-6) and fuel products (1-3)
INSERT INTO nozzles (dispenser_id, name, product_id) VALUES 
(1, 'Nozzle 1', 1), (1, 'Nozzle 2', 2), (1, 'Nozzle 3', 3),
(2, 'Nozzle 1', 1), (2, 'Nozzle 2', 2), (2, 'Nozzle 3', 3),
(3, 'Nozzle 1', 1), (3, 'Nozzle 2', 2), (3, 'Nozzle 3', 3),
(4, 'Nozzle 1', 1), (4, 'Nozzle 2', 2), (4, 'Nozzle 3', 3),
(5, 'Nozzle 1', 1), (5, 'Nozzle 2', 2), (5, 'Nozzle 3', 3),
(6, 'Nozzle 1', 1), (6, 'Nozzle 2', 2), (6, 'Nozzle 3', 3);

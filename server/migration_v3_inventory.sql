-- Add image_url to products
ALTER TABLE products ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;

-- Create tanks table
CREATE TABLE IF NOT EXISTS tanks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    capacity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_volume DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    min_level DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create product_stock table
CREATE TABLE IF NOT EXISTS product_stock (
    product_id INT PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0,
    min_level INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Update nozzles to link to tanks
ALTER TABLE nozzles ADD COLUMN tank_id INT DEFAULT NULL;
ALTER TABLE nozzles ADD COLUMN meter_reading DECIMAL(15, 2) DEFAULT 0.00;
-- We can add a foreign key constraint if we want strict integrity, 
-- but for now let's just add the column. 
-- ALTER TABLE nozzles ADD FOREIGN KEY (tank_id) REFERENCES tanks(id);

-- Seed Data for Tanks
-- Assuming Product IDs: 1=Gasohol 95, 2=Diesel, 3=Gasohol 91 (based on previous context)
INSERT INTO tanks (name, product_id, capacity, current_volume, min_level) VALUES 
('Tank 1 (Gasohol 95)', 1, 10000.00, 5000.00, 1000.00),
('Tank 2 (Diesel)', 2, 20000.00, 15000.00, 2000.00),
('Tank 3 (Gasohol 91)', 3, 10000.00, 8000.00, 1000.00);

-- Link Nozzles to Tanks (Assumption based on product_id)
-- Update nozzles with product_id 1 to Tank 1, etc.
UPDATE nozzles SET tank_id = 1 WHERE product_id = 1;
UPDATE nozzles SET tank_id = 2 WHERE product_id = 2;
UPDATE nozzles SET tank_id = 3 WHERE product_id = 3;

-- Seed Data for Product Stock (Goods)
-- Assuming Product IDs > 3 are goods. Let's insert some if they exist.
INSERT INTO product_stock (product_id, quantity, min_level)
SELECT id, 100, 10 FROM products WHERE type = 'goods';

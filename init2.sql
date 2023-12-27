-- Create a calendar_events table
CREATE TABLE IF NOT EXISTS calendar_products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
);
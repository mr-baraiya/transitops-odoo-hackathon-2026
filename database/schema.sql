-- ============================================================
-- TRANSITOPS - COMPLETE DATABASE SETUP (Error-Proof Version)
-- ============================================================
DROP DATABASE IF EXISTS transitops_db;

CREATE DATABASE transitops_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE transitops_db;

-- 1. Roles
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Role name'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Vehicles
CREATE TABLE vehicles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(20) UNIQUE NOT NULL COMMENT 'Unique vehicle plate/ID',
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'e.g., Van, Truck, Trailer',
    max_load_capacity DECIMAL(10,2) NOT NULL COMMENT 'in kg',
    odometer DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Current odometer reading (km)',
    acquisition_cost DECIMAL(12,2) NOT NULL,
    status ENUM('Available', 'On Trip', 'In Shop', 'Retired') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Drivers
CREATE TABLE drivers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_category VARCHAR(20) NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(20),
    safety_score TINYINT UNSIGNED DEFAULT 100,
    status ENUM('Available', 'On Trip', 'Off Duty', 'Suspended') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Trips
CREATE TABLE trips (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    cargo_weight DECIMAL(10,2) NOT NULL,
    planned_distance DECIMAL(10,2) NOT NULL COMMENT 'Planned distance in km',
    actual_distance DECIMAL(10,2) DEFAULT NULL COMMENT 'Actual distance from odometer',
    fuel_consumed DECIMAL(10,2) DEFAULT NULL COMMENT 'Liters consumed',
    start_odometer DECIMAL(10,2) DEFAULT NULL,
    end_odometer DECIMAL(10,2) DEFAULT NULL,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled') DEFAULT 'Draft',
    vehicle_id INT UNSIGNED NOT NULL,
    driver_id INT UNSIGNED NOT NULL,
    dispatched_at TIMESTAMP NULL DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Maintenance Logs
CREATE TABLE maintenance_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT UNSIGNED NOT NULL,
    maintenance_date DATE NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('Active', 'Closed') DEFAULT 'Active',
    closed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Fuel Logs
CREATE TABLE fuel_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT UNSIGNED NOT NULL,
    trip_id INT UNSIGNED NULL,
    fuel_date DATE NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    cost DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Expenses
CREATE TABLE expenses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT UNSIGNED NOT NULL,
    expense_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    cost DECIMAL(12,2) NOT NULL,
    type ENUM('Toll', 'Parking', 'Repair', 'Other') DEFAULT 'Other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle_driver ON trips(vehicle_id, driver_id);
CREATE INDEX idx_maintenance_vehicle_status ON maintenance_logs(vehicle_id, status);
CREATE INDEX idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO roles (name) VALUES ('Admin'), ('Fleet Manager'), ('Driver'), ('Safety Officer'), ('Financial Analyst');

INSERT INTO users (name, email, password, role_id) VALUES
    ('Admin User', 'admin@transitops.com', 'admin123', (SELECT id FROM roles WHERE name='Admin')),
    ('Fleet Manager', 'fleet@transitops.com', 'fleet123', (SELECT id FROM roles WHERE name='Fleet Manager')),
    ('Driver John', 'john.driver@transitops.com', 'driver123', (SELECT id FROM roles WHERE name='Driver')),
    ('Safety Officer', 'safety@transitops.com', 'safety123', (SELECT id FROM roles WHERE name='Safety Officer')),
    ('Financial Analyst', 'finance@transitops.com', 'finance123', (SELECT id FROM roles WHERE name='Financial Analyst'));

INSERT INTO vehicles (registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status) VALUES
    ('VAN-001', 'Ford Transit', 'Van', 800.00, 15234.5, 25000.00, 'Available'),
    ('TRK-101', 'Scania R500', 'Truck', 15000.00, 78450.0, 120000.00, 'Available'),
    ('TRK-102', 'Volvo FH', 'Truck', 18000.00, 22300.0, 135000.00, 'On Trip'),
    ('VAN-002', 'Mercedes Sprinter', 'Van', 1200.00, 9800.0, 31000.00, 'In Shop'),
    ('TRL-001', 'Utility Trailer', 'Trailer', 5000.00, 5600.0, 8000.00, 'Retired');

INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) VALUES
    ('Alex Johnson', 'DL-12345', 'B', '2027-05-15', '+1-555-0101', 95, 'Available'),
    ('Maria Garcia', 'DL-67890', 'C', '2026-11-20', '+1-555-0102', 88, 'On Trip'),
    ('James Smith', 'DL-11223', 'B', '2025-08-10', '+1-555-0103', 72, 'Suspended'),
    ('Sarah Lee', 'DL-44556', 'A', '2027-01-01', '+1-555-0104', 100, 'Available'),
    ('Robert Brown', 'DL-77889', 'D', '2024-12-31', '+1-555-0105', 60, 'Off Duty');

INSERT INTO trips (source, destination, cargo_weight, planned_distance, actual_distance, fuel_consumed, start_odometer, end_odometer, revenue, status, vehicle_id, driver_id, dispatched_at, completed_at) VALUES
    ('Warehouse A', 'Store 12', 450.00, 120.0, 125.0, 25.5, 15234.5, 15359.5, 350.00, 'Completed', 
        (SELECT id FROM vehicles WHERE registration_number='VAN-001'), 
        (SELECT id FROM drivers WHERE name='Alex Johnson'), 
        '2026-07-01 08:00:00', '2026-07-01 10:30:00'),
    ('Depot B', 'City Center', 1000.00, 80.0, NULL, NULL, NULL, NULL, 0.00, 'Draft',
        (SELECT id FROM vehicles WHERE registration_number='TRK-101'),
        (SELECT id FROM drivers WHERE name='Maria Garcia'),
        NULL, NULL),
    ('Port C', 'Warehouse D', 2000.00, 300.0, NULL, NULL, NULL, NULL, 0.00, 'Dispatched',
        (SELECT id FROM vehicles WHERE registration_number='TRK-102'),
        (SELECT id FROM drivers WHERE name='Sarah Lee'),
        '2026-07-12 06:00:00', NULL),
    ('Store 12', 'Warehouse A', 300.00, 125.0, NULL, NULL, NULL, NULL, 0.00, 'Cancelled',
        (SELECT id FROM vehicles WHERE registration_number='VAN-001'),
        (SELECT id FROM drivers WHERE name='Alex Johnson'),
        NULL, NULL);

INSERT INTO maintenance_logs (vehicle_id, maintenance_date, description, cost, status, closed_at) VALUES
    ((SELECT id FROM vehicles WHERE registration_number='VAN-002'), '2026-07-10', 'Oil change and brake inspection', 350.00, 'Active', NULL),
    ((SELECT id FROM vehicles WHERE registration_number='TRK-101'), '2026-06-15', 'Engine tune-up', 1200.00, 'Closed', '2026-06-16 14:00:00');

INSERT INTO fuel_logs (vehicle_id, trip_id, fuel_date, liters, cost) VALUES
    ((SELECT id FROM vehicles WHERE registration_number='VAN-001'), 
     (SELECT id FROM trips WHERE source='Warehouse A' AND destination='Store 12' ORDER BY id LIMIT 1),
     '2026-07-01', 25.5, 45.90),
    ((SELECT id FROM vehicles WHERE registration_number='TRK-102'), NULL, '2026-07-11', 200.0, 360.00),
    ((SELECT id FROM vehicles WHERE registration_number='VAN-001'), NULL, '2026-07-05', 30.0, 54.00);

INSERT INTO expenses (vehicle_id, expense_date, description, cost, type) VALUES
    ((SELECT id FROM vehicles WHERE registration_number='VAN-001'), '2026-07-01', 'Highway toll', 15.50, 'Toll'),
    ((SELECT id FROM vehicles WHERE registration_number='TRK-101'), '2026-06-20', 'Parking fee at depot', 25.00, 'Parking'),
    ((SELECT id FROM vehicles WHERE registration_number='VAN-002'), '2026-07-09', 'Replacement wiper blades', 12.99, 'Repair');
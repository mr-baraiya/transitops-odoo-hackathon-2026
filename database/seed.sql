-- ============================================================
-- TRANSITOPS - COMPLETE DATABASE SETUP (Production-Ready MVP)
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
    profile VARCHAR(255) DEFAULT NULL COMMENT 'Profile picture link or file path',
    role_id INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Locations
CREATE TABLE locations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Vehicles
CREATE TABLE vehicles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(20) UNIQUE NOT NULL COMMENT 'Unique vehicle plate/ID',
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'e.g., Van, Truck, Trailer',
    max_load_capacity DECIMAL(10,2) NOT NULL CHECK (max_load_capacity >= 0) COMMENT 'in kg',
    odometer DECIMAL(10,2) DEFAULT 0.00 CHECK (odometer >= 0) COMMENT 'Current odometer reading (km)',
    acquisition_cost DECIMAL(12,2) NOT NULL CHECK (acquisition_cost >= 0),
    status ENUM('Available', 'On Trip', 'In Shop', 'Retired') DEFAULT 'Available',
    deleted_at DATETIME NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Drivers
CREATE TABLE drivers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_category VARCHAR(20) NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(20),
    safety_score TINYINT UNSIGNED DEFAULT 100 CHECK (safety_score >= 0 AND safety_score <= 100),
    status ENUM('Available', 'On Trip', 'Off Duty', 'Suspended') DEFAULT 'Available',
    user_id INT UNSIGNED NULL,
    deleted_at DATETIME NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Trips
CREATE TABLE trips (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_location_id INT UNSIGNED NOT NULL,
    destination_location_id INT UNSIGNED NOT NULL,
    cargo_weight DECIMAL(10,2) NOT NULL CHECK (cargo_weight >= 0),
    planned_distance DECIMAL(10,2) NOT NULL CHECK (planned_distance >= 0),
    actual_distance DECIMAL(10,2) DEFAULT NULL CHECK (actual_distance IS NULL OR actual_distance >= 0),
    fuel_consumed DECIMAL(10,2) DEFAULT NULL CHECK (fuel_consumed IS NULL OR fuel_consumed >= 0),
    start_odometer DECIMAL(10,2) DEFAULT NULL,
    end_odometer DECIMAL(10,2) DEFAULT NULL,
    revenue DECIMAL(12,2) DEFAULT 0.00 CHECK (revenue >= 0),
    status ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled') DEFAULT 'Draft',
    vehicle_id INT UNSIGNED NOT NULL,
    driver_id INT UNSIGNED NOT NULL,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_at DATETIME NULL DEFAULT NULL,
    dispatched_at DATETIME NULL DEFAULT NULL,
    completed_at DATETIME NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (source_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (destination_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (start_odometer IS NULL OR end_odometer IS NULL OR end_odometer >= start_odometer),
    CHECK (completed_at IS NULL OR dispatched_at IS NULL OR completed_at >= dispatched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Maintenance Logs
CREATE TABLE maintenance_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT UNSIGNED NOT NULL,
    maintenance_date DATE NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(12,2) DEFAULT 0.00 CHECK (cost >= 0),
    status ENUM('Active', 'Closed') DEFAULT 'Active',
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_at DATETIME NULL DEFAULT NULL,
    closed_at DATETIME NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Fuel Logs
CREATE TABLE fuel_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT UNSIGNED NOT NULL,
    trip_id INT UNSIGNED NULL,
    fuel_date DATE NOT NULL,
    liters DECIMAL(10,2) NOT NULL CHECK (liters >= 0),
    cost DECIMAL(12,2) NOT NULL CHECK (cost >= 0),
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_at DATETIME NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Expenses
CREATE TABLE expenses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT UNSIGNED NOT NULL,
    expense_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    cost DECIMAL(12,2) NOT NULL CHECK (cost >= 0),
    type ENUM('Toll', 'Parking', 'Repair', 'Other') DEFAULT 'Other',
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    deleted_at DATETIME NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_created_at ON drivers(created_at);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle_driver ON trips(vehicle_id, driver_id);
CREATE INDEX idx_trips_created_at ON trips(created_at);
CREATE INDEX idx_trips_dispatched_at ON trips(dispatched_at);
CREATE INDEX idx_maintenance_vehicle_status ON maintenance_logs(vehicle_id, status);
CREATE INDEX idx_maintenance_date ON maintenance_logs(maintenance_date);
CREATE INDEX idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_date ON fuel_logs(fuel_date);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO roles (name) VALUES ('Admin'), ('Fleet Manager'), ('Driver'), ('Safety Officer'), ('Financial Analyst');

INSERT INTO users (name, email, password, profile, role_id) VALUES
    ('Admin User', 'admin@transitops.com', CONCAT('sha256$', SHA2('admin123', 256)), 'uploads/profiles/admin.jpg', (SELECT id FROM roles WHERE name='Admin')),
    ('Fleet Manager', 'fleet@transitops.com', CONCAT('sha256$', SHA2('fleet123', 256)), 'uploads/profiles/fleet.jpg', (SELECT id FROM roles WHERE name='Fleet Manager')),
    ('Driver John', 'john.driver@transitops.com', CONCAT('sha256$', SHA2('driver123', 256)), 'uploads/profiles/driver.jpg', (SELECT id FROM roles WHERE name='Driver')),
    ('Safety Officer', 'safety@transitops.com', CONCAT('sha256$', SHA2('safety123', 256)), 'uploads/profiles/safety.jpg', (SELECT id FROM roles WHERE name='Safety Officer')),
    ('Financial Analyst', 'finance@transitops.com', CONCAT('sha256$', SHA2('finance123', 256)), 'uploads/profiles/finance.jpg', (SELECT id FROM roles WHERE name='Financial Analyst'));

INSERT INTO locations (name) VALUES
    ('Warehouse A'),
    ('Store 12'),
    ('Depot B'),
    ('City Center'),
    ('Port C'),
    ('Warehouse D');

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

INSERT INTO trips (source_location_id, destination_location_id, cargo_weight, planned_distance, actual_distance, fuel_consumed, start_odometer, end_odometer, revenue, status, vehicle_id, driver_id, created_by, updated_by, dispatched_at, completed_at) VALUES
    ((SELECT id FROM locations WHERE name='Warehouse A'), (SELECT id FROM locations WHERE name='Store 12'), 450.00, 120.0, 125.0, 25.5, 15234.5, 15359.5, 350.00, 'Completed',
        (SELECT id FROM vehicles WHERE registration_number='VAN-001'),
        (SELECT id FROM drivers WHERE name='Alex Johnson'),
        (SELECT id FROM users WHERE email='admin@transitops.com'),
        (SELECT id FROM users WHERE email='admin@transitops.com'),
        '2026-07-01 08:00:00', '2026-07-01 10:30:00'),
    ((SELECT id FROM locations WHERE name='Depot B'), (SELECT id FROM locations WHERE name='City Center'), 1000.00, 80.0, NULL, NULL, NULL, NULL, 0.00, 'Draft',
        (SELECT id FROM vehicles WHERE registration_number='TRK-101'),
        (SELECT id FROM drivers WHERE name='Maria Garcia'),
        (SELECT id FROM users WHERE email='fleet@transitops.com'),
        (SELECT id FROM users WHERE email='fleet@transitops.com'),
        NULL, NULL),
    ((SELECT id FROM locations WHERE name='Port C'), (SELECT id FROM locations WHERE name='Warehouse D'), 2000.00, 300.0, NULL, NULL, NULL, NULL, 0.00, 'Dispatched',
        (SELECT id FROM vehicles WHERE registration_number='TRK-102'),
        (SELECT id FROM drivers WHERE name='Sarah Lee'),
        (SELECT id FROM users WHERE email='safety@transitops.com'),
        (SELECT id FROM users WHERE email='safety@transitops.com'),
        '2026-07-12 06:00:00', NULL),
    ((SELECT id FROM locations WHERE name='Store 12'), (SELECT id FROM locations WHERE name='Warehouse A'), 300.00, 125.0, NULL, NULL, NULL, NULL, 0.00, 'Cancelled',
        (SELECT id FROM vehicles WHERE registration_number='VAN-001'),
        (SELECT id FROM drivers WHERE name='Alex Johnson'),
        (SELECT id FROM users WHERE email='finance@transitops.com'),
        (SELECT id FROM users WHERE email='finance@transitops.com'),
        NULL, NULL);

INSERT INTO maintenance_logs (vehicle_id, maintenance_date, description, cost, status, created_by, updated_by) VALUES
    ((SELECT id FROM vehicles WHERE registration_number='VAN-002'), '2026-07-10', 'Oil change and brake inspection', 350.00, 'Active',
        (SELECT id FROM users WHERE email='admin@transitops.com'),
        (SELECT id FROM users WHERE email='admin@transitops.com')),
    ((SELECT id FROM vehicles WHERE registration_number='TRK-101'), '2026-06-15', 'Engine tune-up', 1200.00, 'Closed',
        (SELECT id FROM users WHERE email='fleet@transitops.com'),
        (SELECT id FROM users WHERE email='fleet@transitops.com'));

INSERT INTO fuel_logs (vehicle_id, trip_id, fuel_date, liters, cost, created_by, updated_by) VALUES
    ((SELECT id FROM vehicles WHERE registration_number='VAN-001'),
     (SELECT id FROM trips WHERE source_location_id = (SELECT id FROM locations WHERE name='Warehouse A') AND destination_location_id = (SELECT id FROM locations WHERE name='Store 12') ORDER BY id LIMIT 1),
     '2026-07-01', 25.5, 45.90,
     (SELECT id FROM users WHERE email='admin@transitops.com'),
     (SELECT id FROM users WHERE email='admin@transitops.com')),
    ((SELECT id FROM vehicles WHERE registration_number='TRK-102'), NULL, '2026-07-11', 200.0, 360.00,
     (SELECT id FROM users WHERE email='safety@transitops.com'),
     (SELECT id FROM users WHERE email='safety@transitops.com')),
    ((SELECT id FROM vehicles WHERE registration_number='VAN-001'), NULL, '2026-07-05', 30.0, 54.00,
     (SELECT id FROM users WHERE email='finance@transitops.com'),
     (SELECT id FROM users WHERE email='finance@transitops.com'));

INSERT INTO expenses (vehicle_id, expense_date, description, cost, type, created_by, updated_by) VALUES
    ((SELECT id FROM vehicles WHERE registration_number='VAN-001'), '2026-07-01', 'Highway toll', 15.50, 'Toll',
     (SELECT id FROM users WHERE email='admin@transitops.com'),
     (SELECT id FROM users WHERE email='admin@transitops.com')),
    ((SELECT id FROM vehicles WHERE registration_number='TRK-101'), '2026-06-20', 'Parking fee at depot', 25.00, 'Parking',
     (SELECT id FROM users WHERE email='fleet@transitops.com'),
     (SELECT id FROM users WHERE email='fleet@transitops.com')),
    ((SELECT id FROM vehicles WHERE registration_number='VAN-002'), '2026-07-09', 'Replacement wiper blades', 12.99, 'Repair',
     (SELECT id FROM users WHERE email='admin@transitops.com'),
     (SELECT id FROM users WHERE email='admin@transitops.com'));
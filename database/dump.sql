-- ==========================================
-- TRANSITOPS DATABASE DUMP (STRUCTURE & DATA)
-- Generated: 2026-07-12T05:30:02.480Z
-- ==========================================

-- Table Structure DDLs
-- ============================================================
-- TransitOps Fleet Management Database
-- PostgreSQL Schema
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Helper: generic trigger to auto-update updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,

    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,

    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    phone         VARCHAR(20),

    status        VARCHAR(20) NOT NULL DEFAULT 'Active'
                  CHECK (status IN ('Active', 'Inactive')),
    last_login    TIMESTAMPTZ,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email   ON users(email);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 3. VEHICLES
-- ============================================================
CREATE TABLE vehicles (
    id                   SERIAL PRIMARY KEY,

    registration_number  VARCHAR(20) UNIQUE NOT NULL,

    vehicle_name         VARCHAR(100) NOT NULL,
    model                VARCHAR(100),

    vehicle_type         VARCHAR(50) NOT NULL,

    max_load_capacity    NUMERIC(10,2) NOT NULL CHECK (max_load_capacity >= 0),

    odometer             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (odometer >= 0),

    acquisition_cost     NUMERIC(12,2) CHECK (acquisition_cost >= 0),

    purchase_date        DATE,

    status               VARCHAR(20) NOT NULL DEFAULT 'Available'
                         CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),

    region               VARCHAR(100),

    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_region ON vehicles(region);

CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 4. DRIVERS
-- ============================================================
CREATE TABLE drivers (
    id                SERIAL PRIMARY KEY,

    user_id           INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    license_number    VARCHAR(50) UNIQUE NOT NULL,
    license_category  VARCHAR(20),
    license_expiry    DATE NOT NULL,

    safety_score      NUMERIC(5,2) NOT NULL DEFAULT 100
                      CHECK (safety_score BETWEEN 0 AND 100),

    status            VARCHAR(20) NOT NULL DEFAULT 'Available'
                      CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')),

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry);

CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON drivers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 5. TRIPS
-- ============================================================
CREATE TABLE trips (
    id                SERIAL PRIMARY KEY,

    vehicle_id        INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id         INTEGER NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,

    source            VARCHAR(150) NOT NULL,
    destination       VARCHAR(150) NOT NULL,

    cargo_weight      NUMERIC(10,2) NOT NULL CHECK (cargo_weight >= 0),

    planned_distance  NUMERIC(10,2) CHECK (planned_distance >= 0),
    actual_distance   NUMERIC(10,2) CHECK (actual_distance >= 0),

    start_time        TIMESTAMPTZ,
    end_time          TIMESTAMPTZ,

    status            VARCHAR(20) NOT NULL DEFAULT 'Draft'
                      CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),

    revenue           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (revenue >= 0),

    remarks           TEXT,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_trip_times CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time)
);

CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_trips_driver_id  ON trips(driver_id);
CREATE INDEX idx_trips_status     ON trips(status);
CREATE INDEX idx_trips_start_time ON trips(start_time);

CREATE TRIGGER trg_trips_updated_at
BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 6. MAINTENANCE LOGS
-- ============================================================
CREATE TABLE maintenance_logs (
    id                SERIAL PRIMARY KEY,

    vehicle_id        INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

    title             VARCHAR(150) NOT NULL,
    description       TEXT,

    maintenance_type  VARCHAR(50) NOT NULL,

    cost              NUMERIC(12,2) CHECK (cost >= 0),

    start_date        DATE NOT NULL,
    end_date          DATE,

    status            VARCHAR(20) NOT NULL DEFAULT 'Pending'
                      CHECK (status IN ('Pending', 'In Progress', 'Completed')),

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_maintenance_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_maintenance_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_status     ON maintenance_logs(status);

CREATE TRIGGER trg_maintenance_updated_at
BEFORE UPDATE ON maintenance_logs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 7. FUEL LOGS
-- ============================================================
CREATE TABLE fuel_logs (
    id          SERIAL PRIMARY KEY,

    vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id     INTEGER REFERENCES trips(id) ON DELETE SET NULL,

    liters      NUMERIC(10,2) NOT NULL CHECK (liters > 0),
    cost        NUMERIC(12,2) NOT NULL CHECK (cost >= 0),

    fuel_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    odometer    NUMERIC(10,2) CHECK (odometer >= 0),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fuel_vehicle_id ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_trip_id    ON fuel_logs(trip_id);
CREATE INDEX idx_fuel_date       ON fuel_logs(fuel_date);

-- ============================================================
-- 8. EXPENSES
-- ============================================================
CREATE TABLE expenses (
    id            SERIAL PRIMARY KEY,

    vehicle_id    INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id       INTEGER REFERENCES trips(id) ON DELETE SET NULL,

    expense_type  VARCHAR(20) NOT NULL
                  CHECK (expense_type IN ('Fuel', 'Maintenance', 'Toll', 'Insurance', 'Repair', 'Other')),

    amount        NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    description   TEXT,
    expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_vehicle_id ON expenses(vehicle_id);
CREATE INDEX idx_expenses_trip_id    ON expenses(trip_id);
CREATE INDEX idx_expenses_type       ON expenses(expense_type);
CREATE INDEX idx_expenses_date       ON expenses(expense_date);

COMMIT;

-- ============================================================
-- DASHBOARD VIEWS (bonus: ready-made KPI queries)
-- ============================================================

-- Fleet status counts
CREATE OR REPLACE VIEW v_fleet_status_summary AS
SELECT
    COUNT(*)                                   AS total_vehicles,
    COUNT(*) FILTER (WHERE status = 'Available') AS available_vehicles,
    COUNT(*) FILTER (WHERE status = 'On Trip')    AS vehicles_on_trip,
    COUNT(*) FILTER (WHERE status = 'In Shop')    AS vehicles_in_shop,
    COUNT(*) FILTER (WHERE status = 'Retired')    AS retired_vehicles
FROM vehicles;

-- Trip status counts
CREATE OR REPLACE VIEW v_trip_status_summary AS
SELECT
    COUNT(*) FILTER (WHERE status = 'Dispatched') AS active_trips,
    COUNT(*) FILTER (WHERE status = 'Draft')       AS pending_trips,
    COUNT(*) FILTER (WHERE status = 'Completed')   AS completed_trips,
    COUNT(*) FILTER (WHERE status = 'Cancelled')   AS cancelled_trips
FROM trips;

-- Drivers currently on duty (On Trip or Available, i.e. not Off Duty/Suspended)
CREATE OR REPLACE VIEW v_drivers_on_duty AS
SELECT COUNT(*) AS drivers_on_duty
FROM drivers
WHERE status IN ('On Trip', 'Available');

-- Fleet utilization = vehicles on trip / total active (non-retired) vehicles
CREATE OR REPLACE VIEW v_fleet_utilization AS
SELECT
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'On Trip')
        / NULLIF(COUNT(*) FILTER (WHERE status != 'Retired'), 0)
    , 2) AS fleet_utilization_pct
FROM vehicles;

-- Cost summaries
CREATE OR REPLACE VIEW v_cost_summary AS
SELECT
    (SELECT COALESCE(SUM(cost), 0) FROM fuel_logs)                                   AS total_fuel_cost,
    (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs)                            AS total_maintenance_cost,
    (SELECT COALESCE(SUM(amount), 0) FROM expenses)                                  AS total_expenses,
    (SELECT COALESCE(SUM(revenue), 0) FROM trips WHERE status = 'Completed')         AS total_revenue;

-- Per-vehicle ROI: revenue from completed trips minus (acquisition cost + maintenance + fuel + other expenses)
CREATE OR REPLACE VIEW v_vehicle_roi AS
SELECT
    v.id                                                             AS vehicle_id,
    v.registration_number,
    v.vehicle_name,
    COALESCE(t.total_revenue, 0)                                     AS total_revenue,
    COALESCE(f.total_fuel_cost, 0)                                   AS total_fuel_cost,
    COALESCE(m.total_maintenance_cost, 0)                            AS total_maintenance_cost,
    COALESCE(e.total_other_expenses, 0)                              AS total_other_expenses,
    COALESCE(t.total_revenue, 0)
        - COALESCE(f.total_fuel_cost, 0)
        - COALESCE(m.total_maintenance_cost, 0)
        - COALESCE(e.total_other_expenses, 0)                        AS net_profit
FROM vehicles v
LEFT JOIN (
    SELECT vehicle_id, SUM(revenue) AS total_revenue
    FROM trips WHERE status = 'Completed'
    GROUP BY vehicle_id
) t ON t.vehicle_id = v.id
LEFT JOIN (
    SELECT vehicle_id, SUM(cost) AS total_fuel_cost
    FROM fuel_logs GROUP BY vehicle_id
) f ON f.vehicle_id = v.id
LEFT JOIN (
    SELECT vehicle_id, SUM(cost) AS total_maintenance_cost
    FROM maintenance_logs GROUP BY vehicle_id
) m ON m.vehicle_id = v.id
LEFT JOIN (
    SELECT vehicle_id, SUM(amount) AS total_other_expenses
    FROM expenses WHERE expense_type NOT IN ('Fuel', 'Maintenance')
    GROUP BY vehicle_id
) e ON e.vehicle_id = v.id;

-- Drivers with expiring/expired licenses (safety compliance)
CREATE OR REPLACE VIEW v_license_alerts AS
SELECT
    d.id AS driver_id,
    u.first_name,
    u.last_name,
    d.license_number,
    d.license_expiry,
    CASE
        WHEN d.license_expiry < CURRENT_DATE THEN 'Expired'
        WHEN d.license_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Valid'
    END AS license_status
FROM drivers d
JOIN users u ON u.id = d.user_id
WHERE d.license_expiry <= CURRENT_DATE + INTERVAL '30 days';


-- Vehicle Documents Table DDLs
-- Migration: Create vehicle_documents table
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('RC', 'Insurance', 'Permit', 'Other')),
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_id ON vehicle_documents(vehicle_id);


-- Business Rules & Cascading Triggers
-- ============================================================
-- Business Rule Automation (bonus)
-- Implements the workflow rules from the design doc:
--   - Trip dispatch validates availability/capacity/license
--     and flips vehicle/driver status to "On Trip"
--   - Trip completion/cancellation frees the vehicle/driver
--   - Maintenance creation flips vehicle to "In Shop"
--   - Maintenance completion frees the vehicle
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- TRIP: validate + cascade status on INSERT/UPDATE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trip_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_status   VARCHAR(20);
    v_capacity NUMERIC(10,2);
    d_status   VARCHAR(20);
    d_expiry   DATE;
BEGIN
    -- Moving into Dispatched: run pre-dispatch checks
    IF NEW.status = 'Dispatched' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'Dispatched') THEN

        SELECT status, max_load_capacity INTO v_status, v_capacity
        FROM vehicles WHERE id = NEW.vehicle_id FOR UPDATE;

        SELECT status, license_expiry INTO d_status, d_expiry
        FROM drivers WHERE id = NEW.driver_id FOR UPDATE;

        IF v_status <> 'Available' THEN
            RAISE EXCEPTION 'Vehicle % is not Available (status=%)', NEW.vehicle_id, v_status;
        END IF;

        IF d_status <> 'Available' THEN
            RAISE EXCEPTION 'Driver % is not Available (status=%)', NEW.driver_id, d_status;
        END IF;

        IF NEW.cargo_weight > v_capacity THEN
            RAISE EXCEPTION 'Cargo weight % exceeds vehicle capacity %', NEW.cargo_weight, v_capacity;
        END IF;

        IF d_expiry < CURRENT_DATE THEN
            RAISE EXCEPTION 'Driver % license expired on %', NEW.driver_id, d_expiry;
        END IF;

        UPDATE vehicles SET status = 'On Trip' WHERE id = NEW.vehicle_id;
        UPDATE drivers  SET status = 'On Trip' WHERE id = NEW.driver_id;

        IF NEW.start_time IS NULL THEN
            NEW.start_time := now();
        END IF;
    END IF;

    -- Moving into Completed or Cancelled: free up resources
    IF NEW.status IN ('Completed', 'Cancelled') AND OLD.status IS DISTINCT FROM NEW.status THEN
        UPDATE vehicles SET status = 'Available' WHERE id = NEW.vehicle_id AND status = 'On Trip';
        UPDATE drivers  SET status = 'Available' WHERE id = NEW.driver_id AND status = 'On Trip';

        IF NEW.status = 'Completed' AND NEW.end_time IS NULL THEN
            NEW.end_time := now();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_status_change
BEFORE INSERT OR UPDATE OF status ON trips
FOR EACH ROW EXECUTE FUNCTION fn_trip_status_change();

-- ------------------------------------------------------------
-- MAINTENANCE: cascade vehicle status
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_maintenance_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status IN ('Pending', 'In Progress') THEN
        UPDATE vehicles SET status = 'In Shop' WHERE id = NEW.vehicle_id;
    END IF;

    IF TG_OP = 'UPDATE' AND NEW.status = 'Completed' AND OLD.status IS DISTINCT FROM 'Completed' THEN
        UPDATE vehicles SET status = 'Available' WHERE id = NEW.vehicle_id AND status = 'In Shop';
        IF NEW.end_date IS NULL THEN
            NEW.end_date := CURRENT_DATE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintenance_status_change
BEFORE INSERT OR UPDATE OF status ON maintenance_logs
FOR EACH ROW EXECUTE FUNCTION fn_maintenance_status_change();

-- ------------------------------------------------------------
-- FUEL LOG -> auto-create matching Expense row (keeps totals consistent)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_fuel_log_to_expense()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, description, expense_date)
    VALUES (NEW.vehicle_id, NEW.trip_id, 'Fuel', NEW.cost, 'Auto-generated from fuel log #' || NEW.id, NEW.fuel_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fuel_log_to_expense
AFTER INSERT ON fuel_logs
FOR EACH ROW EXECUTE FUNCTION fn_fuel_log_to_expense();

-- ------------------------------------------------------------
-- MAINTENANCE LOG -> auto-create matching Expense row on completion
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_maintenance_log_to_expense()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Completed' AND OLD.status IS DISTINCT FROM 'Completed' AND NEW.cost IS NOT NULL THEN
        INSERT INTO expenses (vehicle_id, expense_type, amount, description, expense_date)
        VALUES (NEW.vehicle_id, 'Maintenance', NEW.cost, 'Auto-generated from maintenance log #' || NEW.id, COALESCE(NEW.end_date, CURRENT_DATE));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintenance_log_to_expense
AFTER UPDATE OF status ON maintenance_logs
FOR EACH ROW EXECUTE FUNCTION fn_maintenance_log_to_expense();

COMMIT;


-- ==========================================
-- DATABASE DATA DUMP
-- ==========================================

SET session_replication_role = 'replica';

-- Data for table roles
INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at") VALUES (1, 'Admin', 'Full system access', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at") VALUES (2, 'Fleet Manager', 'Manages vehicles, drivers, and trips', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at") VALUES (3, 'Driver', 'Executes trips', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at") VALUES (4, 'Safety Officer', 'Monitors compliance and safety scores', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at") VALUES (5, 'Finance', 'Manages expenses and revenue', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');

-- Data for table users
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (4, 3, 'Priya', 'Nair', 'priya.nair@transitops.com', '$2b$12$gwDMKBPBaeu/.O/z9Wt3nO..rjumCuSZDcaORFvs5cIvELVAXGili', '9990000004', 'Active', NULL, '2026-07-12T04:28:19.677Z', '2026-07-12T04:50:15.137Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (5, 4, 'Sameer', 'Joshi', 'sameer.joshi@transitops.com', '$2b$12$gwDMKBPBaeu/.O/z9Wt3nO..rjumCuSZDcaORFvs5cIvELVAXGili', '9990000005', 'Active', NULL, '2026-07-12T04:28:19.677Z', '2026-07-12T04:50:15.137Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (1, 1, 'Ava', 'Shah', 'ava.shah@transitops.com', '$2b$12$gwDMKBPBaeu/.O/z9Wt3nO..rjumCuSZDcaORFvs5cIvELVAXGili', '9990000001', 'Active', '2026-07-12T04:50:30.543Z', '2026-07-12T04:28:19.677Z', '2026-07-12T04:50:30.543Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (6, 3, 'Amit Kumar', 'Patel', 'test.driver.1783832365901@transitops.com', '$2b$12$G6s8YFOkefYnwbyFJkGdieD9Sy7d5W.gG.FCXCl/e48d.K1oVG4Ei', '9990000123', 'Inactive', NULL, '2026-07-12T04:59:29.731Z', '2026-07-12T05:00:10.989Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (7, 3, 'Amit Kumar', 'Patel', 'test.driver.1783832468415@transitops.com', '$2b$12$QwIYlS1xVTv/ehJrSYaCKOlgzjhkwH.30AK4EzJ0cvM3piHcbGk8m', '9990000123', 'Inactive', NULL, '2026-07-12T05:01:12.246Z', '2026-07-12T05:01:44.522Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (8, 3, 'Amit Kumar', 'Patel', 'test.driver.1783832612321@transitops.com', '$2b$12$cza1n0NNSa2tJ6Ao5ET6nuAoi0z.7Z5mHa4X4zKynYLEVXcMx35UW', '9990000123', 'Inactive', NULL, '2026-07-12T05:03:35.137Z', '2026-07-12T05:04:16.787Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (9, 3, 'Amit Kumar', 'Patel', 'test.driver.1783832689540@transitops.com', '$2b$12$8.4jIPmBmiaVeI0wFn9KseMice05o8FFoIvkLO1HueYkKGlVJsgdS', '9990000123', 'Inactive', NULL, '2026-07-12T05:04:52.309Z', '2026-07-12T05:05:20.990Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (10, 3, 'Amit Kumar', 'Patel', 'test.driver.1783832963025@transitops.com', '$2b$12$Mj6fDh2ccbhl.026zqR12.oUvSHnY/dGsYPqFsVYXajjSkg8nWxam', '9990000123', 'Inactive', NULL, '2026-07-12T05:09:25.834Z', '2026-07-12T05:09:59.515Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (2, 2, 'Rohan', 'Mehta', 'rohan.mehta@transitops.com', '$2b$12$gwDMKBPBaeu/.O/z9Wt3nO..rjumCuSZDcaORFvs5cIvELVAXGili', '9990000002', 'Active', '2026-07-12T05:26:18.938Z', '2026-07-12T04:28:19.677Z', '2026-07-12T05:26:18.938Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (3, 3, 'Karan', 'Verma', 'karan.verma@transitops.com', '$2b$12$gwDMKBPBaeu/.O/z9Wt3nO..rjumCuSZDcaORFvs5cIvELVAXGili', '9990000003', 'Active', '2026-07-12T05:26:20.243Z', '2026-07-12T04:28:19.677Z', '2026-07-12T05:26:20.243Z');
INSERT INTO "users" ("id", "role_id", "first_name", "last_name", "email", "password_hash", "phone", "status", "last_login", "created_at", "updated_at") VALUES (11, 3, 'Amit Kumar', 'Patel', 'test.driver.1783833979075@transitops.com', '$2b$12$1AiMPGF0XHTVqD2UtqAHC.oiMIz28vI/VN3ACEbwEurmtaeTOJ04K', '9990000123', 'Inactive', NULL, '2026-07-12T05:26:22.383Z', '2026-07-12T05:27:02.215Z');

-- Data for table vehicles
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (1, 'GJ01AB1234', 'Titan-1', 'Tata Ace', 'Mini Truck', 750.00, 12000.00, 650000.00, '2023-05-09T18:30:00.000Z', 'Available', 'Rajkot', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (2, 'GJ01CD5678', 'Titan-2', 'Ashok Leyland', 'Truck', 5000.00, 42000.00, 2200000.00, '2021-11-01T18:30:00.000Z', 'On Trip', 'Rajkot', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (3, 'GJ05EF9012', 'Titan-3', 'Mahindra Bolero Pickup', 'Pickup', 1200.00, 8000.00, 850000.00, '2024-01-17T18:30:00.000Z', 'In Shop', 'Ahmedabad', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (8, 'GJ01XY1372', 'Express-Carrier-Pro', 'Tata 407', 'Truck', 3500.00, 15000.00, 1200000.00, '2025-05-31T18:30:00.000Z', 'Retired', 'Ahmedabad', '2026-07-12T05:09:28.239Z', '2026-07-12T05:09:59.031Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (4, 'GJ01XY7391', 'Express-Carrier-Pro', 'Tata 407', 'Truck', 3500.00, 15000.00, 1200000.00, '2025-05-31T18:30:00.000Z', 'Retired', 'Ahmedabad', '2026-07-12T04:59:32.670Z', '2026-07-12T05:00:09.723Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (5, 'GJ01XY3733', 'Express-Carrier-Pro', 'Tata 407', 'Truck', 3500.00, 15000.00, 1200000.00, '2025-05-31T18:30:00.000Z', 'Retired', 'Ahmedabad', '2026-07-12T05:01:14.686Z', '2026-07-12T05:01:43.986Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (6, 'GJ01XY6231', 'Express-Carrier-Pro', 'Tata 407', 'Truck', 3500.00, 15000.00, 1200000.00, '2025-05-31T18:30:00.000Z', 'Retired', 'Ahmedabad', '2026-07-12T05:03:37.093Z', '2026-07-12T05:04:16.292Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (7, 'GJ01XY3261', 'Express-Carrier-Pro', 'Tata 407', 'Truck', 3500.00, 15000.00, 1200000.00, '2025-05-31T18:30:00.000Z', 'Retired', 'Ahmedabad', '2026-07-12T05:04:54.359Z', '2026-07-12T05:05:20.480Z');
INSERT INTO "vehicles" ("id", "registration_number", "vehicle_name", "model", "vehicle_type", "max_load_capacity", "odometer", "acquisition_cost", "purchase_date", "status", "region", "created_at", "updated_at") VALUES (9, 'GJ01XY2492', 'Express-Carrier-Pro', 'Tata 407', 'Truck', 3500.00, 15000.00, 1200000.00, '2025-05-31T18:30:00.000Z', 'Retired', 'Ahmedabad', '2026-07-12T05:26:25.238Z', '2026-07-12T05:27:01.401Z');

-- Data for table drivers
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (1, 3, 'DL-GJ-2021-0001', 'LMV', '2027-03-14T18:30:00.000Z', 95.50, 'Available', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (2, 4, 'DL-GJ-2019-0045', 'HMV', '2026-07-31T18:30:00.000Z', 88.00, 'On Trip', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (3, 6, 'GJ-01-1783832373724', 'HMV-Pro', '2028-12-30T18:30:00.000Z', 95.00, 'Available', '2026-07-12T04:59:36.220Z', '2026-07-12T04:59:50.150Z');
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (4, 7, 'GJ-01-1783832476639', 'HMV-Pro', '2028-12-30T18:30:00.000Z', 95.00, 'Available', '2026-07-12T05:01:19.381Z', '2026-07-12T05:01:31.703Z');
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (5, 8, 'GJ-01-1783832617902', 'HMV-Pro', '2028-12-30T18:30:00.000Z', 95.00, 'Available', '2026-07-12T05:03:40.157Z', '2026-07-12T05:03:56.753Z');
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (6, 9, 'GJ-01-1783832695321', 'HMV-Pro', '2028-12-30T18:30:00.000Z', 95.00, 'Available', '2026-07-12T05:04:57.589Z', '2026-07-12T05:05:08.804Z');
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (7, 10, 'GJ-01-1783832969305', 'HMV-Pro', '2028-12-30T18:30:00.000Z', 95.00, 'Available', '2026-07-12T05:09:31.579Z', '2026-07-12T05:09:44.799Z');
INSERT INTO "drivers" ("id", "user_id", "license_number", "license_category", "license_expiry", "safety_score", "status", "created_at", "updated_at") VALUES (8, 11, 'GJ-01-1783833987871', 'HMV-Pro', '2028-12-30T18:30:00.000Z', 95.00, 'Available', '2026-07-12T05:26:30.709Z', '2026-07-12T05:26:46.693Z');

-- Data for table trips
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (1, 2, 2, 'Rajkot', 'Ahmedabad', 3200.00, 220.00, NULL, '2026-07-10T04:28:19.677Z', NULL, 'Dispatched', 45000.00, 'Priority cargo', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (2, 4, 3, 'Ahmedabad', 'Surat', 1200.00, 265.00, 270.00, '2026-07-12T04:59:44.090Z', '2026-07-12T04:59:44.875Z', 'Completed', 18000.00, 'Fast shipping cargo', '2026-07-12T04:59:42.470Z', '2026-07-12T04:59:44.875Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (3, 4, 3, 'Ahmedabad', 'Surat', 800.00, 260.00, 260.00, '2026-07-12T04:59:48.740Z', '2026-07-12T04:59:50.150Z', 'Completed', 15000.00, NULL, '2026-07-12T04:59:47.960Z', '2026-07-12T04:59:50.150Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (4, 5, 4, 'Ahmedabad', 'Surat', 1200.00, 265.00, 270.00, '2026-07-12T05:01:25.295Z', '2026-07-12T05:01:26.041Z', 'Completed', 18000.00, 'Fast shipping cargo', '2026-07-12T05:01:23.781Z', '2026-07-12T05:01:26.041Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (5, 5, 4, 'Ahmedabad', 'Surat', 800.00, 260.00, 260.00, '2026-07-12T05:01:29.886Z', '2026-07-12T05:01:31.703Z', 'Completed', 15000.00, NULL, '2026-07-12T05:01:29.026Z', '2026-07-12T05:01:31.703Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (6, 6, 5, 'Ahmedabad', 'Surat', 1200.00, 265.00, 270.00, '2026-07-12T05:03:47.972Z', '2026-07-12T05:03:48.702Z', 'Completed', 18000.00, 'Fast shipping cargo', '2026-07-12T05:03:43.637Z', '2026-07-12T05:03:48.702Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (7, 6, 5, 'Ahmedabad', 'Surat', 800.00, 260.00, 260.00, '2026-07-12T05:03:53.548Z', '2026-07-12T05:03:56.753Z', 'Completed', 15000.00, NULL, '2026-07-12T05:03:51.469Z', '2026-07-12T05:03:56.753Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (8, 7, 6, 'Ahmedabad', 'Surat', 1200.00, 265.00, 270.00, '2026-07-12T05:05:03.194Z', '2026-07-12T05:05:03.959Z', 'Completed', 18000.00, 'Fast shipping cargo', '2026-07-12T05:05:01.239Z', '2026-07-12T05:05:03.959Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (9, 7, 6, 'Ahmedabad', 'Surat', 800.00, 260.00, 260.00, '2026-07-12T05:05:07.524Z', '2026-07-12T05:05:08.804Z', 'Completed', 15000.00, NULL, '2026-07-12T05:05:06.769Z', '2026-07-12T05:05:08.804Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (10, 8, 7, 'Ahmedabad', 'Surat', 1200.00, 265.00, 270.00, '2026-07-12T05:09:37.104Z', '2026-07-12T05:09:37.874Z', 'Completed', 18000.00, 'Fast shipping cargo', '2026-07-12T05:09:35.044Z', '2026-07-12T05:09:37.874Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (11, 8, 7, 'Ahmedabad', 'Surat', 800.00, 260.00, 260.00, '2026-07-12T05:09:43.489Z', '2026-07-12T05:09:44.799Z', 'Completed', 15000.00, NULL, '2026-07-12T05:09:42.494Z', '2026-07-12T05:09:44.799Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (12, 9, 8, 'Ahmedabad', 'Surat', 1200.00, 265.00, 270.00, '2026-07-12T05:26:39.093Z', '2026-07-12T05:26:39.998Z', 'Completed', 18000.00, 'Fast shipping cargo', '2026-07-12T05:26:36.363Z', '2026-07-12T05:26:39.998Z');
INSERT INTO "trips" ("id", "vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "actual_distance", "start_time", "end_time", "status", "revenue", "remarks", "created_at", "updated_at") VALUES (13, 9, 8, 'Ahmedabad', 'Surat', 800.00, 260.00, 260.00, '2026-07-12T05:26:45.288Z', '2026-07-12T05:26:46.693Z', 'Completed', 15000.00, NULL, '2026-07-12T05:26:44.479Z', '2026-07-12T05:26:46.693Z');

-- Data for table maintenance_logs
INSERT INTO "maintenance_logs" ("id", "vehicle_id", "title", "description", "maintenance_type", "cost", "start_date", "end_date", "status", "created_at", "updated_at") VALUES (1, 3, 'Brake pad replacement', 'Routine service after inspection flagged wear', 'Preventive', 4200.00, '2026-07-10T18:30:00.000Z', NULL, 'In Progress', '2026-07-12T04:28:19.677Z', '2026-07-12T04:28:19.677Z');

-- Data for table fuel_logs
INSERT INTO "fuel_logs" ("id", "vehicle_id", "trip_id", "liters", "cost", "fuel_date", "odometer", "created_at") VALUES (1, 2, 1, 60.00, 6300.00, '2026-07-10T18:30:00.000Z', 42100.00, '2026-07-12T04:28:19.677Z');

-- Data for table expenses
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (1, 2, 1, 'Fuel', 6300.00, 'Auto-generated from fuel log #1', '2026-07-10T18:30:00.000Z', '2026-07-12T04:28:19.677Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (2, 4, NULL, 'Maintenance', 4600.00, 'Auto-generated from maintenance log #2', '2026-07-11T18:30:00.000Z', '2026-07-12T04:59:46.910Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (3, 4, 3, 'Fuel', 4100.00, 'Auto-generated from fuel log #2', '2026-07-11T18:30:00.000Z', '2026-07-12T04:59:49.350Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (5, 5, NULL, 'Maintenance', 4600.00, 'Auto-generated from maintenance log #3', '2026-07-11T18:30:00.000Z', '2026-07-12T05:01:28.051Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (6, 5, 5, 'Fuel', 4100.00, 'Auto-generated from fuel log #3', '2026-07-11T18:30:00.000Z', '2026-07-12T05:01:30.371Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (8, 6, NULL, 'Maintenance', 4600.00, 'Auto-generated from maintenance log #4', '2026-07-11T18:30:00.000Z', '2026-07-12T05:03:50.457Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (9, 6, 7, 'Fuel', 4100.00, 'Auto-generated from fuel log #4', '2026-07-11T18:30:00.000Z', '2026-07-12T05:03:54.803Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (11, 7, NULL, 'Maintenance', 4600.00, 'Auto-generated from maintenance log #5', '2026-07-11T18:30:00.000Z', '2026-07-12T05:05:05.764Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (12, 7, 9, 'Fuel', 4100.00, 'Auto-generated from fuel log #5', '2026-07-11T18:30:00.000Z', '2026-07-12T05:05:08.049Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (14, 8, NULL, 'Maintenance', 4600.00, 'Auto-generated from maintenance log #6', '2026-07-11T18:30:00.000Z', '2026-07-12T05:09:39.819Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (15, 8, 11, 'Fuel', 4100.00, 'Auto-generated from fuel log #6', '2026-07-11T18:30:00.000Z', '2026-07-12T05:09:44.024Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (17, 9, NULL, 'Maintenance', 4600.00, 'Auto-generated from maintenance log #7', '2026-07-11T18:30:00.000Z', '2026-07-12T05:26:43.363Z');
INSERT INTO "expenses" ("id", "vehicle_id", "trip_id", "expense_type", "amount", "description", "expense_date", "created_at") VALUES (18, 9, 13, 'Fuel', 4100.00, 'Auto-generated from fuel log #7', '2026-07-11T18:30:00.000Z', '2026-07-12T05:26:45.843Z');

SET session_replication_role = 'origin';

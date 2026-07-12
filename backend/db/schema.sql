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

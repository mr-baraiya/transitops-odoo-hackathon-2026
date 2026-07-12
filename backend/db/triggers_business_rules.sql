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

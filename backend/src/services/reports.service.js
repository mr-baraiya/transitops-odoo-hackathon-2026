const { query } = require('../config/db');

const ReportsService = {
  /**
   * Fuel efficiency: distance / fuel per vehicle
   */
  fuelEfficiency: async (filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.vehicle_id) {
      conditions.push(`t.vehicle_id = $${idx++}`);
      params.push(filters.vehicle_id);
    }

    const where = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

    return query(
      `SELECT
         v.id AS vehicle_id,
         v.registration_number,
         v.vehicle_name,
         COALESCE(SUM(t.actual_distance), 0) AS total_distance,
         COALESCE(SUM(f.liters), 0) AS total_fuel_liters,
         CASE WHEN SUM(f.liters) > 0
           THEN ROUND(SUM(t.actual_distance) / SUM(f.liters), 2)
           ELSE 0
         END AS km_per_liter
       FROM vehicles v
       LEFT JOIN trips t ON t.vehicle_id = v.id AND t.status = 'Completed' ${where}
       LEFT JOIN fuel_logs f ON f.vehicle_id = v.id
       GROUP BY v.id, v.registration_number, v.vehicle_name
       ORDER BY km_per_liter DESC`,
      params
    );
  },

  /**
   * Fleet utilization over a date range
   */
  utilization: async ({ from, to } = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (from) {
      conditions.push(`start_time >= $${idx++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`start_time <= $${idx++}`);
      params.push(to);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalVehicles = await query(
      `SELECT COUNT(*) AS total FROM vehicles WHERE status != 'Retired'`
    );

    const activeVehicles = await query(
      `SELECT COUNT(DISTINCT vehicle_id) AS active
       FROM trips ${where}`,
      params
    );

    const total = parseInt(totalVehicles.rows[0].total, 10);
    const active = parseInt(activeVehicles.rows[0].active, 10);

    return {
      total_vehicles: total,
      active_vehicles: active,
      utilization_pct: total > 0 ? Math.round((active / total) * 10000) / 100 : 0,
    };
  },

  /**
   * Operational cost per vehicle (Fuel + Maintenance)
   */
  operationalCost: async () => {
    return query(
      `SELECT
         v.id AS vehicle_id,
         v.registration_number,
         v.vehicle_name,
         COALESCE(f.fuel_cost, 0) AS fuel_cost,
         COALESCE(m.maintenance_cost, 0) AS maintenance_cost,
         COALESCE(f.fuel_cost, 0) + COALESCE(m.maintenance_cost, 0) AS total_operational_cost
       FROM vehicles v
       LEFT JOIN (
         SELECT vehicle_id, SUM(cost) AS fuel_cost FROM fuel_logs GROUP BY vehicle_id
       ) f ON f.vehicle_id = v.id
       LEFT JOIN (
         SELECT vehicle_id, SUM(cost) AS maintenance_cost FROM maintenance_logs GROUP BY vehicle_id
       ) m ON m.vehicle_id = v.id
       ORDER BY total_operational_cost DESC`
    );
  },

  /**
   * Vehicle ROI from the v_vehicle_roi view
   */
  roi: async () => {
    return query(`SELECT * FROM v_vehicle_roi ORDER BY net_profit DESC`);
  },
};

module.exports = ReportsService;

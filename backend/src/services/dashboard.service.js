const { query } = require('../config/db');

const DashboardService = {
  /**
   * Get all KPIs — optionally filtered by vehicle type/status/region
   */
  getKPIs: async (filters = {}) => {
    // Fleet status (with optional filters)
    const fleetConditions = [];
    const fleetParams = [];
    let idx = 1;

    if (filters.type) {
      fleetConditions.push(`vehicle_type = $${idx++}`);
      fleetParams.push(filters.type);
    }
    if (filters.status) {
      fleetConditions.push(`status = $${idx++}`);
      fleetParams.push(filters.status);
    }
    if (filters.region) {
      fleetConditions.push(`region = $${idx++}`);
      fleetParams.push(filters.region);
    }

    const fleetWhere = fleetConditions.length ? `WHERE ${fleetConditions.join(' AND ')}` : '';

    const fleet = await query(
      `SELECT
         COUNT(*) AS total_vehicles,
         COUNT(*) FILTER (WHERE status = 'Available') AS available_vehicles,
         COUNT(*) FILTER (WHERE status = 'On Trip') AS vehicles_on_trip,
         COUNT(*) FILTER (WHERE status = 'In Shop') AS vehicles_in_shop,
         COUNT(*) FILTER (WHERE status = 'Retired') AS retired_vehicles
       FROM vehicles ${fleetWhere}`,
      fleetParams
    );

    const trips = await query(`SELECT * FROM v_trip_status_summary`);
    const drivers = await query(`SELECT * FROM v_drivers_on_duty`);
    const utilization = await query(`SELECT * FROM v_fleet_utilization`);
    const costs = await query(`SELECT * FROM v_cost_summary`);

    return {
      fleet: fleet.rows[0],
      trips: trips.rows[0],
      drivers: drivers.rows[0],
      utilization: utilization.rows[0],
      costs: costs.rows[0],
    };
  },
};

module.exports = DashboardService;

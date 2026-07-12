const ReportsService = require('../services/reports.service');
const CsvExportService = require('../services/csvExport.service');
const PdfExportService = require('../services/pdfExport.service');
const asyncHandler = require('../utils/asyncHandler');
const { success, badRequest } = require('../utils/apiResponse');

exports.fuelEfficiency = asyncHandler(async (req, res) => {
  const result = await ReportsService.fuelEfficiency(req.query);
  return success(res, result.rows);
});

exports.utilization = asyncHandler(async (req, res) => {
  const result = await ReportsService.utilization(req.query);
  return success(res, result);
});

exports.operationalCost = asyncHandler(async (req, res) => {
  const result = await ReportsService.operationalCost();
  return success(res, result.rows);
});

exports.roi = asyncHandler(async (req, res) => {
  const result = await ReportsService.roi();
  return success(res, result.rows);
});

/**
 * GET /api/reports/export/csv?report=fuel-efficiency|utilization|operational-cost|roi
 */
exports.exportCsv = asyncHandler(async (req, res) => {
  const { report } = req.query;
  let data;

  switch (report) {
    case 'fuel-efficiency': {
      const r = await ReportsService.fuelEfficiency(req.query);
      data = r.rows;
      break;
    }
    case 'utilization': {
      const r = await ReportsService.utilization(req.query);
      data = [r]; // single row
      break;
    }
    case 'operational-cost': {
      const r = await ReportsService.operationalCost();
      data = r.rows;
      break;
    }
    case 'roi': {
      const r = await ReportsService.roi();
      data = r.rows;
      break;
    }
    default:
      return badRequest(res, 'Invalid report type. Use: fuel-efficiency, utilization, operational-cost, roi');
  }

  const csv = CsvExportService.toCSV(data);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${report}-report.csv"`);
  return res.send(csv);
});

/**
 * GET /api/reports/export/pdf?report=fuel-efficiency|operational-cost|roi
 */
exports.exportPdf = asyncHandler(async (req, res) => {
  const { report } = req.query;
  let data, columns, title;

  switch (report) {
    case 'fuel-efficiency': {
      const r = await ReportsService.fuelEfficiency(req.query);
      data = r.rows;
      columns = ['vehicle_id', 'registration_number', 'vehicle_name', 'total_distance', 'total_fuel_liters', 'km_per_liter'];
      title = 'Fuel Efficiency Report';
      break;
    }
    case 'operational-cost': {
      const r = await ReportsService.operationalCost();
      data = r.rows;
      columns = ['vehicle_id', 'registration_number', 'vehicle_name', 'fuel_cost', 'maintenance_cost', 'total_operational_cost'];
      title = 'Operational Cost Report';
      break;
    }
    case 'roi': {
      const r = await ReportsService.roi();
      data = r.rows;
      columns = ['vehicle_id', 'registration_number', 'vehicle_name', 'total_revenue', 'total_fuel_cost', 'total_maintenance_cost', 'net_profit'];
      title = 'Vehicle ROI Report';
      break;
    }
    default:
      return badRequest(res, 'Invalid report type. Use: fuel-efficiency, operational-cost, roi');
  }

  PdfExportService.generateReport(title, columns, data, res);
});

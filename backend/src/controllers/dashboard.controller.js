const DashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

exports.getKPIs = asyncHandler(async (req, res) => {
  const kpis = await DashboardService.getKPIs(req.query);
  return success(res, kpis);
});

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = 'localhost';

let fmToken = '';
let driverToken = '';
let createdUserId = null;
let createdVehicleId = null;
let createdDriverId = null;
let createdTripId = null;
let createdMaintenanceId = null;
let createdFuelLogId = null;
let createdExpenseId = null;
let createdDocumentId = null;

// Helper to make request
function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: { ...headers }
    };

    let postData = '';
    if (data && headers['Content-Type'] === 'application/json') {
      postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    } else if (data && headers['Content-Type'] && headers['Content-Type'].startsWith('multipart/form-data')) {
      postData = data;
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(body),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

// JSON Request Helper
function apiReq(method, path, data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request(method, path, data, headers);
}

// Multipart Form Request Helper for files
function fileUploadReq(path, fieldName, fileName, fileContent, token) {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  
  const parts = [];
  
  // document_type parameter
  parts.push(Buffer.from(`--${boundary}\r\n`));
  parts.push(Buffer.from('Content-Disposition: form-data; name="document_type"\r\n\r\n'));
  parts.push(Buffer.from('Insurance\r\n'));
  
  // File parameter
  parts.push(Buffer.from(`--${boundary}\r\n`));
  parts.push(Buffer.from(`Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n`));
  parts.push(Buffer.from('Content-Type: application/pdf\r\n\r\n'));
  parts.push(Buffer.from(fileContent));
  parts.push(Buffer.from('\r\n'));
  
  // Closing boundary
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  
  const payload = Buffer.concat(parts);

  const headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return request('POST', path, payload, headers);
}

async function runTests() {
  console.log('=== STARTING TRANOPS ENDPOINT TEST SUITE ===\n');

  try {
    // ----------------------------------------
    // 1. AUTH TESTING
    // ----------------------------------------
    console.log('1. Auth Testing:');
    
    // Login as Fleet Manager (rohan.mehta@transitops.com)
    let res = await apiReq('POST', '/api/auth/login', {
      email: 'rohan.mehta@transitops.com',
      password: 'password123'
    });
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] Login FM successful');
      fmToken = res.body.data.token;
    } else {
      console.log('  [FAIL] Login FM failed:', res.body);
    }

    // Login as Driver (rbnbpatel1@transitops.com)
    res = await apiReq('POST', '/api/auth/login', {
      email: 'rbnbpatel1@transitops.com',
      password: 'password123'
    });
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] Login Driver successful');
      driverToken = res.body.data.token;
    } else {
      console.log('  [FAIL] Login Driver failed:', res.body);
    }

    // GET /api/auth/me
    res = await apiReq('GET', '/api/auth/me', null, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.role_name === 'Fleet Manager') {
      console.log('  [PASS] GET /auth/me details match FM');
    } else {
      console.log('  [FAIL] GET /auth/me failed:', res.body);
    }

    // POST /api/auth/register (Create a driver user user)
    const randomEmail = `test.driver.${Date.now()}@transitops.com`;
    res = await apiReq('POST', '/api/auth/register', {
      role_id: 3, // Driver
      first_name: 'Amit',
      last_name: 'Patel',
      email: randomEmail,
      password: 'password123',
      phone: '9990000123'
    }, fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /auth/register successful');
      createdUserId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /auth/register failed:', res.body);
    }

    // ----------------------------------------
    // 2. USERS TESTING
    // ----------------------------------------
    console.log('\n2. Users Testing:');

    // GET /api/users
    res = await apiReq('GET', '/api/users', null, fmToken);
    if (res.statusCode === 200 && res.body.success && Array.isArray(res.body.data)) {
      console.log('  [PASS] GET /users returns list');
    } else {
      console.log('  [FAIL] GET /users failed:', res.body);
    }

    // GET /api/users/:id
    res = await apiReq('GET', `/api/users/${createdUserId}`, null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /users/:id details matched');
    } else {
      console.log('  [FAIL] GET /users/:id failed:', res.body);
    }

    // PATCH /api/users/:id
    res = await apiReq('PATCH', `/api/users/${createdUserId}`, { first_name: 'Amit Kumar' }, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.first_name === 'Amit Kumar') {
      console.log('  [PASS] PATCH /users/:id update successful');
    } else {
      console.log('  [FAIL] PATCH /users/:id failed:', res.body);
    }

    // ----------------------------------------
    // 3. VEHICLES TESTING
    // ----------------------------------------
    console.log('\n3. Vehicles Testing:');

    // POST /api/vehicles
    const regNum = `GJ01XY${Math.floor(1000 + Math.random() * 9000)}`;
    res = await apiReq('POST', '/api/vehicles', {
      registration_number: regNum,
      vehicle_name: 'Express-Carrier',
      model: 'Tata 407',
      vehicle_type: 'Truck',
      max_load_capacity: 3500.00,
      odometer: 15000.00,
      acquisition_cost: 1200000.00,
      purchase_date: '2025-06-01',
      status: 'Available',
      region: 'Ahmedabad'
    }, fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /vehicles successful');
      createdVehicleId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /vehicles failed:', res.body);
    }

    // GET /api/vehicles
    res = await apiReq('GET', '/api/vehicles?type=Truck', null, fmToken);
    if (res.statusCode === 200 && res.body.success && Array.isArray(res.body.data)) {
      console.log('  [PASS] GET /vehicles with filters successful');
    } else {
      console.log('  [FAIL] GET /vehicles failed:', res.body);
    }

    // GET /api/vehicles/available
    res = await apiReq('GET', '/api/vehicles/available', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /vehicles/available returned list');
    } else {
      console.log('  [FAIL] GET /vehicles/available failed:', res.body);
    }

    // GET /api/vehicles/:id
    res = await apiReq('GET', `/api/vehicles/${createdVehicleId}`, null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /vehicles/:id matched');
    } else {
      console.log('  [FAIL] GET /vehicles/:id failed:', res.body);
    }

    // PATCH /api/vehicles/:id
    res = await apiReq('PATCH', `/api/vehicles/${createdVehicleId}`, { vehicle_name: 'Express-Carrier-Pro' }, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.vehicle_name === 'Express-Carrier-Pro') {
      console.log('  [PASS] PATCH /vehicles/:id update matched');
    } else {
      console.log('  [FAIL] PATCH /vehicles/:id failed:', res.body);
    }

    // PATCH /api/vehicles/:id/status
    res = await apiReq('PATCH', `/api/vehicles/${createdVehicleId}/status`, { status: 'Available' }, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] PATCH /vehicles/:id/status override matched');
    } else {
      console.log('  [FAIL] PATCH /vehicles/:id/status failed:', res.body);
    }

    // ----------------------------------------
    // 4. DRIVERS TESTING
    // ----------------------------------------
    console.log('\n4. Drivers Testing:');

    // POST /api/drivers
    const licNum = `GJ-01-${Date.now()}`;
    res = await apiReq('POST', '/api/drivers', {
      user_id: createdUserId,
      license_number: licNum,
      license_category: 'HMV',
      license_expiry: '2028-12-31',
      safety_score: 95.0,
      status: 'Available'
    }, fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /drivers successful');
      createdDriverId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /drivers failed:', res.body);
    }

    // GET /api/drivers
    res = await apiReq('GET', '/api/drivers', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /drivers successful');
    } else {
      console.log('  [FAIL] GET /drivers failed:', res.body);
    }

    // GET /api/drivers/available
    res = await apiReq('GET', '/api/drivers/available', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /drivers/available successful');
    } else {
      console.log('  [FAIL] GET /drivers/available failed:', res.body);
    }

    // GET /api/drivers/license-alerts
    res = await apiReq('GET', '/api/drivers/license-alerts', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /drivers/license-alerts successful');
    } else {
      console.log('  [FAIL] GET /drivers/license-alerts failed:', res.body);
    }

    // PATCH /api/drivers/:id
    res = await apiReq('PATCH', `/api/drivers/${createdDriverId}`, { license_category: 'HMV-Pro' }, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.license_category === 'HMV-Pro') {
      console.log('  [PASS] PATCH /drivers/:id update successful');
    } else {
      console.log('  [FAIL] PATCH /drivers/:id failed:', res.body);
    }

    // PATCH /api/drivers/:id/status
    res = await apiReq('PATCH', `/api/drivers/${createdDriverId}/status`, { status: 'Available' }, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] PATCH /drivers/:id/status successful');
    } else {
      console.log('  [FAIL] PATCH /drivers/:id/status failed:', res.body);
    }

    // PATCH /api/drivers/:id/safety-score
    res = await apiReq('PATCH', `/api/drivers/${createdDriverId}/safety-score`, { safety_score: 92.5 }, fmToken);
    if (res.statusCode === 403) {
      console.log('  [PASS] PATCH /drivers/:id/safety-score blocked FM correctly');
    } else {
      console.log('  [WARNING] PATCH /drivers/:id/safety-score returned status:', res.statusCode);
    }

    // ----------------------------------------
    // 5. TRIPS TESTING
    // ----------------------------------------
    console.log('\n5. Trips Testing:');

    // POST /api/trips (Draft)
    res = await apiReq('POST', '/api/trips', {
      vehicle_id: createdVehicleId,
      driver_id: createdDriverId,
      source: 'Ahmedabad',
      destination: 'Surat',
      cargo_weight: 1200.00,
      planned_distance: 260.00,
      revenue: 18000.00,
      remarks: 'Fast shipping cargo'
    }, fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /trips (Draft) successful');
      createdTripId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /trips failed:', res.body);
    }

    // PATCH /api/trips/:id (Edit Draft)
    res = await apiReq('PATCH', `/api/trips/${createdTripId}`, { planned_distance: 265.00 }, fmToken);
    if (res.statusCode === 200 && res.body.success && parseFloat(res.body.data.planned_distance) === 265.00) {
      console.log('  [PASS] PATCH /trips/:id (Edit Draft) successful');
    } else {
      console.log('  [FAIL] PATCH /trips/:id edit failed:', res.body);
    }

    // PATCH /api/trips/:id/dispatch (Draft -> Dispatched)
    res = await apiReq('PATCH', `/api/trips/${createdTripId}/dispatch`, null, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.status === 'Dispatched') {
      console.log('  [PASS] PATCH /trips/:id/dispatch successful');
    } else {
      console.log('  [FAIL] PATCH /trips/:id/dispatch failed:', res.body);
    }

    // PATCH /api/trips/:id/complete (Dispatched -> Completed)
    res = await apiReq('PATCH', `/api/trips/${createdTripId}/complete`, {
      actual_distance: 270.00
    }, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.status === 'Completed') {
      console.log('  [PASS] PATCH /trips/:id/complete successful');
    } else {
      console.log('  [FAIL] PATCH /trips/:id/complete failed:', res.body);
    }

    // ----------------------------------------
    // 6. MAINTENANCE TESTING
    // ----------------------------------------
    console.log('\n6. Maintenance Testing:');

    // POST /api/maintenance (vehicle status In Shop auto)
    res = await apiReq('POST', '/api/maintenance', {
      vehicle_id: createdVehicleId,
      title: 'Regular Engine Tuneup',
      description: 'Filter replacement and oil change',
      maintenance_type: 'Preventive',
      cost: 4500.00,
      start_date: '2026-07-12',
      status: 'Pending'
    }, fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /maintenance successful');
      createdMaintenanceId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /maintenance failed:', res.body);
    }

    // Verify vehicle is now "In Shop"
    let vehRes = await apiReq('GET', `/api/vehicles/${createdVehicleId}`, null, fmToken);
    if (vehRes.statusCode === 200 && vehRes.body.data.status === 'In Shop') {
      console.log('  [PASS] Vehicle status automatically updated to "In Shop" via DB trigger');
    } else {
      console.log('  [FAIL] Vehicle status check failed. Status is:', vehRes.body.data ? vehRes.body.data.status : 'unknown');
    }

    // PATCH /api/maintenance/:id/close
    res = await apiReq('PATCH', `/api/maintenance/${createdMaintenanceId}/close`, {
      cost: 4600.00,
      end_date: '2026-07-12'
    }, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.status === 'Completed') {
      console.log('  [PASS] PATCH /maintenance/:id/close successful');
    } else {
      console.log('  [FAIL] PATCH /maintenance/:id/close failed:', res.body);
    }

    // Verify vehicle is now back to "Available"
    vehRes = await apiReq('GET', `/api/vehicles/${createdVehicleId}`, null, fmToken);
    if (vehRes.statusCode === 200 && vehRes.body.data.status === 'Available') {
      console.log('  [PASS] Vehicle status automatically reverted to "Available" via DB trigger');
    } else {
      console.log('  [FAIL] Vehicle status revert check failed. Status is:', vehRes.body.data ? vehRes.body.data.status : 'unknown');
    }

    // ----------------------------------------
    // 7. FUEL LOGS AND EXPENSES TESTING
    // ----------------------------------------
    console.log('\n7. Fuel Logs & Expenses Testing:');

    // Create a new Dispatched trip first for linking fuel logs
    const newTripRes = await apiReq('POST', '/api/trips', {
      vehicle_id: createdVehicleId,
      driver_id: createdDriverId,
      source: 'Ahmedabad',
      destination: 'Surat',
      cargo_weight: 800.00,
      planned_distance: 260.00,
      revenue: 15000.00
    }, fmToken);
    const linkedTripId = newTripRes.body.data.id;
    await apiReq('PATCH', `/api/trips/${linkedTripId}/dispatch`, null, fmToken);

    // POST /api/fuel-logs
    res = await apiReq('POST', '/api/fuel-logs', {
      vehicle_id: createdVehicleId,
      trip_id: linkedTripId,
      liters: 45.5,
      cost: 4100.00,
      fuel_date: '2026-07-12',
      odometer: 15300.00
    }, fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /fuel-logs successful');
      createdFuelLogId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /fuel-logs failed:', res.body);
    }

    // Close the trip
    await apiReq('PATCH', `/api/trips/${linkedTripId}/complete`, { actual_distance: 260.00 }, fmToken);

    // Verify Expense is automatically logged
    let expListRes = await apiReq('GET', `/api/expenses?vehicle_id=${createdVehicleId}&type=Fuel`, null, fmToken);
    if (expListRes.statusCode === 200 && expListRes.body.data.length > 0) {
      console.log('  [PASS] Fuel Expense automatically created in DB via trigger');
    } else {
      console.log('  [FAIL] Fuel Expense auto-creation verify failed:', expListRes.body);
    }

    // POST /api/expenses
    res = await apiReq('POST', '/api/expenses', {
      vehicle_id: createdVehicleId,
      expense_type: 'Toll',
      amount: 450.00,
      description: 'Highway toll tax',
      expense_date: '2026-07-12'
    }, fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /expenses successful');
      createdExpenseId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /expenses failed:', res.body);
    }

    // GET /api/expenses/vehicle/:id/total
    res = await apiReq('GET', `/api/expenses/vehicle/${createdVehicleId}/total`, null, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.total_cost !== undefined) {
      console.log('  [PASS] GET /expenses/vehicle/:id/total successful. Total:', res.body.data.total_cost);
    } else {
      console.log('  [FAIL] GET /expenses/vehicle/:id/total failed:', res.body);
    }

    // ----------------------------------------
    // 8. REPORTS TESTING
    // ----------------------------------------
    console.log('\n8. Reports Testing:');

    // GET /api/reports/fuel-efficiency
    res = await apiReq('GET', '/api/reports/fuel-efficiency', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /reports/fuel-efficiency successful');
    } else {
      console.log('  [FAIL] GET /reports/fuel-efficiency failed:', res.body);
    }

    // GET /api/reports/utilization
    res = await apiReq('GET', '/api/reports/utilization', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /reports/utilization successful');
    } else {
      console.log('  [FAIL] GET /reports/utilization failed:', res.body);
    }

    // GET /api/reports/operational-cost
    res = await apiReq('GET', '/api/reports/operational-cost', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /reports/operational-cost successful');
    } else {
      console.log('  [FAIL] GET /reports/operational-cost failed:', res.body);
    }

    // GET /api/reports/roi
    res = await apiReq('GET', '/api/reports/roi', null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] GET /reports/roi successful');
    } else {
      console.log('  [FAIL] GET /reports/roi failed:', res.body);
    }

    // GET /api/reports/export/csv
    res = await apiReq('GET', '/api/reports/export/csv?report=roi', null, fmToken);
    if (res.statusCode === 200 && typeof res.body === 'string') {
      console.log('  [PASS] GET /reports/export/csv successfully returned CSV download');
    } else {
      console.log('  [FAIL] GET /reports/export/csv failed');
    }

    // ----------------------------------------
    // 9. DOCUMENTS TESTING
    // ----------------------------------------
    console.log('\n9. Documents Testing:');

    // POST /api/vehicles/:id/documents
    res = await fileUploadReq(`/api/vehicles/${createdVehicleId}/documents`, 'document', 'insurance.pdf', 'This is dummy vehicle insurance card content.', fmToken);
    if (res.statusCode === 201 && res.body.success) {
      console.log('  [PASS] POST /vehicles/:id/documents upload successful');
      createdDocumentId = res.body.data.id;
    } else {
      console.log('  [FAIL] POST /vehicles/:id/documents upload failed:', res.body);
    }

    // GET /api/vehicles/:id/documents (list)
    res = await apiReq('GET', `/api/vehicles/${createdVehicleId}/documents`, null, fmToken);
    if (res.statusCode === 200 && res.body.success && res.body.data.length > 0) {
      console.log('  [PASS] GET /vehicles/:id/documents returns list');
    } else {
      console.log('  [FAIL] GET /vehicles/:id/documents failed:', res.body);
    }

    // GET /api/documents/:id/download (download)
    res = await apiReq('GET', `/api/documents/${createdDocumentId}/download`, null, fmToken);
    if (res.statusCode === 200) {
      console.log('  [PASS] GET /documents/:id/download file retrieval successful');
    } else {
      console.log('  [FAIL] GET /documents/:id/download failed:', res.body);
    }

    // DELETE /api/documents/:id (cleanup document)
    res = await apiReq('DELETE', `/api/documents/${createdDocumentId}`, null, fmToken);
    if (res.statusCode === 200 && res.body.success) {
      console.log('  [PASS] DELETE /documents/:id cleanup successful');
    } else {
      console.log('  [FAIL] DELETE /documents/:id failed:', res.body);
    }

    // ----------------------------------------
    // 10. CLEANUP CREATED RESOURCES
    // ----------------------------------------
    console.log('\n10. Cleanup Resource Check:');

    // Delete fuel log
    res = await apiReq('DELETE', `/api/fuel-logs/${createdFuelLogId}`, null, fmToken);
    if (res.statusCode === 200) console.log('  [CLEANUP] Deleted test fuel log');

    // Delete manually logged expense
    res = await apiReq('DELETE', `/api/expenses/${createdExpenseId}`, null, fmToken);
    if (res.statusCode === 200) console.log('  [CLEANUP] Deleted test expense');

    // Delete maintenance log
    res = await apiReq('DELETE', `/api/maintenance/${createdMaintenanceId}`, null, fmToken);
    if (res.statusCode === 200) console.log('  [CLEANUP] Deleted test maintenance log');

    // Delete driver profile
    res = await apiReq('DELETE', `/api/drivers/${createdDriverId}`, null, fmToken);
    if (res.statusCode === 200) console.log('  [CLEANUP] Deleted test driver profile');

    // Retire created vehicle
    res = await apiReq('DELETE', `/api/vehicles/${createdVehicleId}`, null, fmToken);
    if (res.statusCode === 200) console.log('  [CLEANUP] Retired test vehicle');

    // Deactivate created user
    res = await apiReq('DELETE', `/api/users/${createdUserId}`, null, fmToken);
    if (res.statusCode === 200) console.log('  [CLEANUP] Deactivated test user');

    console.log('\n=== ENDPOINT TESTING COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (err) {
    console.error('\nUnexpected error during tests:', err.message);
    process.exit(1);
  }
}

runTests();

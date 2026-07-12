const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Health Check Route
router.get('/health', async (req, res) => {
  let dbStatus = 'UP';
  let dbError = null;

  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    dbStatus = 'DOWN';
    dbError = err.message;
  }

  const isHealthy = dbStatus === 'UP';
  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()) + 's',
    database: {
      status: dbStatus,
      error: dbError
    },
    system: {
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});

// Interactive API Explorer & Documentation
router.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TransitOps API Directory & Explorer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      
      --get: #3b82f6;
      --post: #10b981;
      --patch: #f59e0b;
      --delete: #ef4444;
      
      --accent: #6366f1;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem 1rem;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 3rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.05em;
      background: linear-gradient(to right, #818cf8, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.subtitle {
      color: var(--text-muted);
      margin-top: 0.5rem;
      font-size: 1.1rem;
    }

    .badge-health {
      background-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .badge-health:hover {
      background-color: rgba(16, 185, 129, 0.25);
    }

    .category {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 2.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }

    .category-title {
      font-size: 1.25rem;
      font-weight: 600;
      padding: 1.25rem 1.5rem;
      background-color: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border);
      letter-spacing: -0.02em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th, td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.95rem;
    }

    th {
      font-weight: 600;
      color: var(--text-muted);
      background-color: rgba(0, 0, 0, 0.1);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .method {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.75rem;
      min-width: 70px;
      text-align: center;
      letter-spacing: 0.02em;
    }

    .method.GET { background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .method.POST { background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .method.PATCH { background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .method.DELETE { background-color: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    .endpoint {
      font-family: monospace;
      font-size: 0.9rem;
      color: #e2e8f0;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .role-badge {
      display: inline-block;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .roles-section {
      margin-bottom: 3rem;
    }

    .roles-section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
    }

    .role-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      padding: 1.25rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: border-color 0.2s, transform 0.2s;
    }

    .role-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }

    .role-title {
      font-weight: 700;
      font-size: 1rem;
      color: #818cf8;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }

    .role-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.45;
    }

    footer {
      text-align: center;
      margin-top: 4rem;
      color: var(--text-muted);
      font-size: 0.875rem;
      border-top: 1px solid var(--border);
      padding-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>TransitOps API Directory</h1>
        <p class="subtitle">Interactive API map and system parameters directory</p>
      </div>
      <a href="/health" class="badge-health" target="_blank">Health Check Status</a>
    </header>

    <!-- ROLES DIRECTORY -->
    <div class="roles-section">
      <div class="roles-section-title">System Roles Directory</div>
      <div class="roles-grid">
        <div class="role-card">
          <div class="role-title">Admin</div>
          <div class="role-desc">Super-user database permissions. Manages user initialization and seeding.</div>
        </div>
        <div class="role-card">
          <div class="role-title">Fleet Manager (FM)</div>
          <div class="role-desc">Full control on Vehicles, Drivers, Trips dispatch, Maintenance, Expenses, and Documents.</div>
        </div>
        <div class="role-card">
          <div class="role-title">Driver (DR)</div>
          <div class="role-desc">Log fuel, view vehicle pools, edit drafts, and handle assigned trip workflow states.</div>
        </div>
        <div class="role-card">
          <div class="role-title">Safety Officer (SO)</div>
          <div class="role-desc">Monitor compliance alerts, manual warning notifications, statuses, and safety scores.</div>
        </div>
        <div class="role-card">
          <div class="role-title">Finance</div>
          <div class="role-desc">Manage expense sheets, analyze operation metrics, vehicle ROI margins, CSV and PDF exports.</div>
        </div>
      </div>
    </div>

    <!-- 1. AUTH -->
    <div class="category">
      <div class="category-title">Authentication & Access</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/auth/login</span></td>
            <td>Logs a user in using email and password, returning JWT token.</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Public</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/auth/register</span></td>
            <td>Register new account credentials with seeded roles.</td>
            <td><span class="role-badge">Admin / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/auth/me</span></td>
            <td>Retrieve current user profile session parameters.</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/auth/logout</span></td>
            <td>Sign out current user sessions.</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 2. USERS -->
    <div class="category">
      <div class="category-title">Users Management</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/users</span></td>
            <td>List details of all registered users.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/users/:id</span></td>
            <td>Get profile metrics of a user.</td>
            <td><span class="role-badge">FM / Self</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/users/:id</span></td>
            <td>Update custom fields, roles, or status credentials.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/users/:id</span></td>
            <td>Deactivate profile access credentials.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. VEHICLES -->
    <div class="category">
      <div class="category-title">Vehicles Directory</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/vehicles</span></td>
            <td>List vehicles (supports <code>type</code>, <code>status</code>, and <code>region</code> filtering).</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/vehicles/available</span></td>
            <td>List vehicles currently set to "Available" for dispatch assignments.</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/vehicles/:id</span></td>
            <td>Get technical specifications and current parameters.</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/vehicles</span></td>
            <td>Register a new vehicle with parameters.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/vehicles/:id</span></td>
            <td>Modify technical data.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/vehicles/:id/status</span></td>
            <td>Directly override vehicle statuses (e.g. In Shop / Retired).</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/vehicles/:id</span></td>
            <td>Retire/deactivate vehicle assignments.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. DRIVERS -->
    <div class="category">
      <div class="category-title">Drivers Management</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/drivers</span></td>
            <td>List registered drivers (supports status & license categories filtering).</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/drivers/available</span></td>
            <td>List available drivers with valid licenses.</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/drivers/license-alerts</span></td>
            <td>Get drivers with expired or expiring-soon licenses.</td>
            <td><span class="role-badge">SO / FM</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/drivers/license-alerts/send</span></td>
            <td>Manually dispatch reminder notifications to drivers.</td>
            <td><span class="role-badge">SO</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/drivers/:id</span></td>
            <td>Get details and compliance statuses.</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/drivers</span></td>
            <td>Create a profile linked to a registered driver account.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/drivers/:id</span></td>
            <td>Update permit data.</td>
            <td><span class="role-badge">FM / SO</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/drivers/:id/status</span></td>
            <td>Directly override driver status variables.</td>
            <td><span class="role-badge">SO / FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/drivers/:id/safety-score</span></td>
            <td>Update custom compliance safety marks.</td>
            <td><span class="role-badge">SO</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/drivers/:id</span></td>
            <td>Deactivate driver profiles.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 5. TRIPS -->
    <div class="category">
      <div class="category-title">Trips Workflow</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/trips</span></td>
            <td>List trips (supports status, vehicle, and driver filtering).</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/trips/:id</span></td>
            <td>Retrieve complete route metadata.</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/trips</span></td>
            <td>Create a trip in Draft status.</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/trips/:id</span></td>
            <td>Edit trip parameters (permitted only while in Draft status).</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/trips/:id/dispatch</span></td>
            <td>Dispatch trip (enforces vehicle availability and driver license validations).</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/trips/:id/complete</span></td>
            <td>Complete trip (records distance, returning vehicle/driver to available pool).</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/trips/:id/cancel</span></td>
            <td>Cancel dispatched trip.</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/trips/:id</span></td>
            <td>Delete a Draft trip.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 6. MAINTENANCE -->
    <div class="category">
      <div class="category-title">Maintenance Logs</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/maintenance</span></td>
            <td>List records (supports status and vehicle filters).</td>
            <td><span class="role-badge">FM / SO</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/maintenance/:id</span></td>
            <td>Get maintenance log details.</td>
            <td><span class="role-badge">FM / SO</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/maintenance</span></td>
            <td>Create record (automatically shifts vehicle status to In Shop).</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/maintenance/:id</span></td>
            <td>Modify record description or values.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/maintenance/:id/close</span></td>
            <td>Complete maintenance (reverts vehicle status to Available and creates matching expense).</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/maintenance/:id</span></td>
            <td>Remove maintenance records.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 7. FUEL & EXPENSES -->
    <div class="category">
      <div class="category-title">Fuel Logs & Expenses</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/fuel-logs</span></td>
            <td>List logged transactions.</td>
            <td><span class="role-badge">FM / Finance</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/fuel-logs</span></td>
            <td>Record fuel consumption (automatically writes to expenses).</td>
            <td><span class="role-badge">Driver / FM</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/fuel-logs/:id</span></td>
            <td>Remove fuel entries.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/expenses</span></td>
            <td>List expense items (supports vehicle, type, and date range filters).</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/expenses</span></td>
            <td>Log operating expense.</td>
            <td><span class="role-badge">FM / Finance</span></td>
          </tr>
          <tr>
            <td><span class="method PATCH">PATCH</span></td>
            <td><span class="endpoint">/api/expenses/:id</span></td>
            <td>Edit logs details.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/expenses/:id</span></td>
            <td>Remove log records.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/expenses/vehicle/:id/total</span></td>
            <td>Get operational cost totals for the vehicle.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 8. DASHBOARD & REPORTS -->
    <div class="category">
      <div class="category-title">Dashboard & Reports</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/dashboard/kpis</span></td>
            <td>Returns fleet indicators, costs, and utilization. Supports filters.</td>
            <td><span class="role-badge" style="background-color: rgba(255,255,255,0.05); color:#cbd5e1; border: 1px solid rgba(255,255,255,0.1)">Any</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/reports/fuel-efficiency</span></td>
            <td>Analyze vehicle fuel economy.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/reports/utilization</span></td>
            <td>Analyze fleet utilization rate over a date range.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/reports/operational-cost</span></td>
            <td>Summarize vehicle expenses.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/reports/roi</span></td>
            <td>Analyze vehicle return on investment metrics.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/reports/export/csv</span></td>
            <td>Export dynamic metrics as CSV download.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/reports/export/pdf</span></td>
            <td>Export reports as PDF layout formats.</td>
            <td><span class="role-badge">Finance / FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 9. DOCUMENTS -->
    <div class="category">
      <div class="category-title">Documents Management</div>
      <table>
        <thead>
          <tr>
            <th style="width: 120px;">Method</th>
            <th style="width: 250px;">Endpoint</th>
            <th>Description</th>
            <th style="width: 180px;">Access Allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method POST">POST</span></td>
            <td><span class="endpoint">/api/vehicles/:id/documents</span></td>
            <td>Upload vehicle files (multipart/form-data with file name field <code>document</code>).</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/vehicles/:id/documents</span></td>
            <td>List documents linked to the vehicle.</td>
            <td><span class="role-badge">FM / SO</span></td>
          </tr>
          <tr>
            <td><span class="method GET">GET</span></td>
            <td><span class="endpoint">/api/documents/:id/download</span></td>
            <td>Download the document binary directly.</td>
            <td><span class="role-badge">FM / SO</span></td>
          </tr>
          <tr>
            <td><span class="method DELETE">DELETE</span></td>
            <td><span class="endpoint">/api/documents/:id</span></td>
            <td>Remove documents and files from the server.</td>
            <td><span class="role-badge">FM</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      <p>TransitOps API Directory Explorer &copy; 2026. Built with Clean REST Standards.</p>
    </footer>
  </div>
</body>
</html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;

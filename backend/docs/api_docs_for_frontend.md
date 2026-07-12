# TransitOps Backend — API Documentation for Frontend Developers

Welcome! This document outlines the API endpoints, request structures, roles, and authorization rules for the TransitOps fleet management backend.

## General Information

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json` (except for document uploads, which use `multipart/form-data`)
- **Authentication**: JWT token passed in the Authorization header.
  - Format: `Authorization: Bearer <your_jwt_token>`

## System Roles & Access Policy

## System Roles & Access Policy

The backend enforces a strict Role-Based Access Control (RBAC) policy. Users must belong to one of the following roles (matching the database seeds exactly):

### 1. Admin
- **Role Identifier**: `Admin`
- **Scope**: Super-user access.
- **Primary Permissions**:
  - Full read/write access to all resources.
  - Seeding user roles and registers new accounts via `/api/auth/register`.

### 2. Fleet Manager
- **Role Identifier**: `Fleet Manager` (abbreviated as `FM`)
- **Scope**: Direct operational head of logistics, vehicles, and trips.
- **Primary Permissions**:
  - Full CRUD control on **Vehicles** (including available pool and manual status overrides).
  - Full CRUD control on **Drivers** (creating profiles, updating categories, status overrides).
  - Full CRUD control on **Trips** (creation, editing, dispatching, completing, and canceling).
  - Full CRUD control on **Maintenance Logs** (scheduling and closing services).
  - Full CRUD control on **Expenses** and **Fuel Logs**.
  - Document uploads and file removal on vehicles.

### 3. Driver
- **Role Identifier**: `Driver` (abbreviated as `DR`)
- **Scope**: Fleet operations execution.
- **Primary Permissions**:
  - Can view lists of `Available` vehicles and drivers for trip matching.
  - Can create **Trips** in `Draft` status, edit them, and request/initiate dispatching.
  - Can transition a trip status to `Completed` or `Cancelled`.
  - Can submit **Fuel Logs** for assigned trips (auto-generating expense lines).

### 4. Safety Officer
- **Role Identifier**: `Safety Officer` (abbreviated as `SO`)
- **Scope**: Compliance, licensing, security, and safety scoring.
- **Primary Permissions**:
  - View driver compliance states and expired/expiring license reports (`/api/drivers/license-alerts`).
  - Manually dispatch license reminder warning emails to drivers.
  - Update driver safety scores (`PATCH /api/drivers/:id/safety-score`).
  - Override driver statuses (e.g., suspending a driver).
  - Read maintenance schedules and check uploaded vehicle documentation.

### 5. Finance
- **Role Identifier**: `Finance` (abbreviated as `Finance`)
- **Scope**: Operating costs, budgeting, and performance analytics.
- **Primary Permissions**:
  - Full CRUD control on general **Expenses** (excluding maintenance close operations).
  - Read access to all operational metrics, fuel economies, vehicle ROI statistics, and fleet utilization logs.
  - Export reports as structured CSV format or tabular layout PDF documents.

---

## 1. Authentication (`/auth`)

### POST `/auth/login`
Logs a user in.
- **Request Body**:
  ```json
  {
    "email": "rohan.mehta@transitops.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 2,
        "role_id": 2,
        "first_name": "Rohan",
        "last_name": "Mehta",
        "email": "rohan.mehta@transitops.com",
        "phone": "9990000002",
        "status": "Active",
        "role_name": "Fleet Manager"
      }
    }
  }
  ```

### POST `/auth/register`
Creates a user account (restricted to **Admin** and **Fleet Manager**).
- **Request Body**:
  ```json
  {
    "role_id": 3,
    "first_name": "Amit",
    "last_name": "Patel",
    "email": "amit.patel@transitops.com",
    "password": "password123",
    "phone": "9990000123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": 6,
      "role_id": 3,
      "first_name": "Amit",
      "last_name": "Patel",
      "email": "amit.patel@transitops.com",
      "phone": "9990000123",
      "status": "Active"
    }
  }
  ```

### GET `/auth/me`
Gets current logged-in user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "id": 2,
      "role_id": 2,
      "first_name": "Rohan",
      "last_name": "Mehta",
      "email": "rohan.mehta@transitops.com",
      "phone": "9990000002",
      "status": "Active",
      "role_name": "Fleet Manager"
    }
  }
  ```

---

## 2. Users (`/users`)

All routes require **Fleet Manager** access.

- **GET `/users`**: Lists all users.
- **GET `/users/:id`**: Gets detail of a specific user. (Accessible by Fleet Manager, or by users viewing their own profile).
- **PATCH `/users/:id`**: Updates user fields (e.g. `first_name`, `last_name`, `phone`, `status`, `role_id`).
- **DELETE `/users/:id`**: Deactivates a user (sets status to `Inactive` so they can no longer login).

---

## 3. Vehicles (`/vehicles`)

- **GET `/vehicles`**: List all vehicles.
  - **Query Params** (Optional filters):
    - `?type=Truck`
    - `?status=Available` (Available / On Trip / In Shop / Retired)
    - `?region=Rajkot`
- **GET `/vehicles/available`**: Helper pool endpoint for trips dispatch list. Returns only available vehicles (excludes Retired / In Shop).
- **POST `/vehicles`** (FM only): Registers a new vehicle.
  - **Request Body**:
    ```json
    {
      "registration_number": "GJ01XY9876",
      "vehicle_name": "Titan-X",
      "model": "Tata Ace Gold",
      "vehicle_type": "Mini Truck",
      "max_load_capacity": 850.00,
      "odometer": 5000.00,
      "acquisition_cost": 750000.00,
      "purchase_date": "2024-05-12",
      "region": "Rajkot"
    }
    ```
- **PATCH `/vehicles/:id`** (FM only): Edit vehicle attributes.
- **PATCH `/vehicles/:id/status`** (FM only): Update vehicle status manually (e.g. `Retired`).
- **DELETE `/vehicles/:id`** (FM only): Deactivates/Retires vehicle (sets status to `Retired`).

---

## 4. Drivers (`/drivers`)

- **GET `/drivers`**: Lists all drivers. Supports filters `?status=` and `?license_category=`.
- **GET `/drivers/available`**: Active dispatch pool. Returns available drivers with non-expired licenses.
- **GET `/drivers/license-alerts`** (Safety Officer, FM): Drivers with expiring/expired licenses.
- **POST `/drivers/license-alerts/send`** (Safety Officer only): Manually triggers reminder emails to affected drivers.
- **POST `/drivers`** (FM only):
  ```json
  {
    "user_id": 6,
    "license_number": "DL-GJ-2026-0987",
    "license_category": "HMV",
    "license_expiry": "2029-06-15"
  }
  ```
- **PATCH `/drivers/:id`** (FM, Safety Officer): Update categories / expiry dates.
- **PATCH `/drivers/:id/status`** (FM, Safety Officer): Override status (Available, Suspended, etc.).
- **PATCH `/drivers/:id/safety-score`** (Safety Officer only):
  ```json
  {
    "safety_score": 94.50
  }
  ```

---

## 5. Trips (`/trips`)

Trips enforce workflow states: `Draft` -> `Dispatched` -> `Completed` / `Cancelled`.

- **POST `/trips`**: Creates a trip as a `Draft`.
  ```json
  {
    "vehicle_id": 2,
    "driver_id": 1,
    "source": "Rajkot",
    "destination": "Ahmedabad",
    "cargo_weight": 3200.00,
    "planned_distance": 220.00,
    "remarks": "Priority load"
  }
  ```
- **PATCH `/trips/:id`**: Edit trip parameters (allowed only while in `Draft` status).
- **PATCH `/trips/:id/dispatch`**: Transitions trip from `Draft` to `Dispatched`.
  - **Validation**:
    - Vehicle must be `Available`.
    - Driver must be `Available` and have a valid, non-expired license.
    - Cargo weight must not exceed vehicle capacity.
  - **Effect**: Updates vehicle & driver status to `On Trip`. Sets `start_time` to now.
- **PATCH `/trips/:id/complete`**: Transitions trip to `Completed`.
  - **Request Body**:
    ```json
    {
      "actual_distance": 222.50,
      "end_time": "2026-07-12T12:00:00Z"
    }
    ```
  - **Effect**: Returns vehicle & driver status back to `Available`.
- **PATCH `/trips/:id/cancel`**: Cancels dispatched trip. Returns vehicle & driver status to `Available`.
- **DELETE `/trips/:id`**: Deletes a trip (allowed only while in `Draft` status).

---

## 6. Maintenance (`/maintenance`)

- **POST `/maintenance`**: Log maintenance entry.
  - **Effect**: Vehicle status automatically shifts to `In Shop`.
  - **Request Body**:
    ```json
    {
      "vehicle_id": 3,
      "title": "Brake service",
      "maintenance_type": "Repair",
      "start_date": "2026-07-12"
    }
    ```
- **PATCH `/maintenance/:id/close`**: Complete maintenance.
  - **Effect**: Vehicle status automatically reverts to `Available`. Auto-writes matching log details to `expenses` table for analytics.
  - **Request Body**:
    ```json
    {
      "cost": 3200.00,
      "end_date": "2026-07-12"
    }
    ```

---

## 7. Fuel & Expenses (`/fuel-logs` & `/expenses`)

- **POST `/fuel-logs`**: Record fuel consumption.
  - **Effect**: Automatically creates corresponding `Fuel` expense record.
  - **Request Body**:
    ```json
    {
      "vehicle_id": 2,
      "trip_id": 4,
      "liters": 45.0,
      "cost": 4100.00,
      "fuel_date": "2026-07-12",
      "odometer": 12450.00
    }
    ```
- **POST `/expenses`**: Record generic operating expense.
  - **Request Body**:
    ```json
    {
      "vehicle_id": 2,
      "expense_type": "Toll",
      "amount": 250.00,
      "description": "Highway toll tax",
      "expense_date": "2026-07-12"
    }
    ```
- **GET `/expenses/vehicle/:id/total`**: Returns operating sum (Fuel + Maintenance costs) for the vehicle.

---

## 8. Dashboard KPIs (`/dashboard`)

- **GET `/dashboard/kpis`**:
  Returns current fleet statistics, active trips, costs, revenues, and fleet utilization. Supports filters `?type=&status=&region=` to slice indicators.
  - **Response Sample**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": {
        "fleet": {
          "total_vehicles": "3",
          "available_vehicles": "2",
          "vehicles_on_trip": "0",
          "vehicles_in_shop": "1",
          "retired_vehicles": "0"
        },
        "trips": {
          "active_trips": "0",
          "pending_trips": "0",
          "completed_trips": "1",
          "cancelled_trips": "0"
        },
        "drivers": {
          "drivers_on_duty": "2"
        },
        "utilization": {
          "fleet_utilization_pct": "0.00"
        },
        "costs": {
          "total_fuel_cost": "6300.00",
          "total_maintenance_cost": "4200.00",
          "total_expenses": "6300.00",
          "total_revenue": "45000.00"
        }
      }
    }
    ```

---

## 9. Reports & Exports (`/reports`)

Requires **Finance** or **Fleet Manager** permissions.

- **GET `/reports/fuel-efficiency`**: Returns km/L efficiency per vehicle.
- **GET `/reports/utilization`**: Returns fleet utilization rate over a date range.
- **GET `/reports/operational-cost`**: Returns aggregated operational cost per vehicle.
- **GET `/reports/roi`**: Returns Net Profit (Trips Revenue - Operational Expenses) and ROI metrics.
- **GET `/reports/export/csv?report=roi`**: Exports current data directly as a `.csv` download.
- **GET `/reports/export/pdf?report=roi`**: Exports current report as a tabular `.pdf` file.

---

## 10. Vehicle Document Uploads

- **POST `/vehicles/:id/documents`**: Upload vehicle files.
  - **Content-Type**: `multipart/form-data`
  - **Form Fields**:
    - `document_type`: Must be one of `RC`, `Insurance`, `Permit`, `Other`.
    - `document`: Binary upload parameter.
  - **File Restrictions**: Only `PDF`, `JPEG`, `PNG`, `WEBP`, `DOC`, and `DOCX` up to 10MB are permitted.
- **GET `/vehicles/:id/documents`**: Lists all documents linked to the vehicle.
- **GET `/documents/:id/download`**: Downloads the raw document.
- **DELETE `/documents/:id`**: Removes document entry and unlinks file from the server.

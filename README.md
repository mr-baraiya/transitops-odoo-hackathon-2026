# TransitOps

**Smart Transport Operations Platform** — Submission for Odoo Hackathon 2026

TransitOps is an end-to-end transport operations platform that digitizes vehicle, driver, dispatch, maintenance, and expense management while enforcing business rules and providing operational insights.

---

## Problem Statement

Many logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This leads to scheduling conflicts, underutilized vehicles, missed maintenance, expired driver licenses, inaccurate expense tracking, and poor operational visibility.

TransitOps solves this by providing a centralized platform to manage the complete lifecycle of transport operations — from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics.

---

## Target Users

| Role | Responsibilities |
|------|-----------------|
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency |
| **Driver** | Creates trips, assigns vehicles and drivers, monitors active deliveries |
| **Safety Officer** | Ensures driver compliance, tracks license validity, monitors safety scores |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, and profitability |

---

## Features

### Core (Mandatory)

- **Authentication & RBAC** — Secure login with role-based access control
- **Dashboard** — KPIs: Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%)
- **Vehicle Registry** — CRUD with Registration Number, Model, Type, Load Capacity, Odometer, Acquisition Cost, Status (`Available` | `On Trip` | `In Shop` | `Retired`)
- **Driver Management** — CRUD with License Number, Category, Expiry Date, Safety Score, Status (`Available` | `On Trip` | `Off Duty` | `Suspended`)
- **Trip Management** — Source, Destination, Vehicle, Driver, Cargo Weight, Planned Distance. Lifecycle: `Draft → Dispatched → Completed → Cancelled`
- **Maintenance Workflow** — Create maintenance records; auto-transitions vehicle status to `In Shop`
- **Fuel & Expense Tracking** — Fuel logs (liters, cost, date), tolls, maintenance costs. Auto-compute total operational cost per vehicle
- **Reports & Analytics** — Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI with CSV export

### Bonus

- Charts and visual analytics
- PDF export
- Email reminders for expiring licenses
- Vehicle document management
- Search, filters, and sorting
- Dark mode

---

## Business Rules

| # | Rule |
|---|------|
| 1 | Vehicle registration number must be unique |
| 2 | `Retired` or `In Shop` vehicles are excluded from dispatch selection |
| 3 | Drivers with expired licenses or `Suspended` status cannot be assigned to trips |
| 4 | A driver/vehicle already `On Trip` cannot be assigned to another trip |
| 5 | Cargo weight must not exceed vehicle's maximum load capacity |
| 6 | Dispatching a trip → vehicle & driver status become `On Trip` |
| 7 | Completing a trip → vehicle & driver status restored to `Available` |
| 8 | Cancelling a dispatched trip → vehicle & driver restored to `Available` |
| 9 | Creating a maintenance record → vehicle status becomes `In Shop` |
| 10 | Closing maintenance → vehicle restored to `Available` (unless `Retired`) |

---

## Database Entities

`Users` · `Roles` · `Vehicles` · `Drivers` · `Trips` · `Maintenance Logs` · `Fuel Logs` · `Expenses`

---

## Project Structure

```
transitops-odoo-hackathon-2026/
├── backend/          # API server
├── frontend/         # Web application
├── database/         # Schemas & seeds
└── docs/             # Documentation
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL |

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Installation

```bash
# Clone
git clone <repo-url>
cd transitops-odoo-hackathon-2026

# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Example Workflow

1. Register vehicle `Van-05` with max capacity 500 kg → Status: `Available`
2. Register driver `Alex` with valid license
3. Create trip with cargo weight 450 kg
4. System validates 450 kg ≤ 500 kg → dispatch allowed
5. Vehicle & driver status → `On Trip`
6. Complete trip (enter final odometer + fuel consumed)
7. Vehicle & driver status → `Available`
8. Create maintenance record (Oil Change) → vehicle status → `In Shop` (hidden from dispatch)
9. Reports update operational cost and fuel efficiency

---

## Team

| Member | Role |
|--------|------|
| **Vishal Baraiya** | Team Leader · Backend Developer |
| **Mayank Pathar** | AI/ML Engineer |
| **Manav Mandalia** | Frontend Developer |
| **Saurabh Singh** | Database Engineer & QA |

---

## References

- [Mockup (Excalidraw)](https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td)

---

*Built for the Odoo Hackathon 2026*

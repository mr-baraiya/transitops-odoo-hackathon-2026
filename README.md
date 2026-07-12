# 🚛 TransitOps – Smart Transport Operations Platform

TransitOps is a centralized transport operations platform developed for the **Odoo Hackathon 2026**. It simplifies fleet management by bringing together vehicle management, driver administration, trip dispatching, maintenance tracking, fuel and expense management, and operational analytics into a single application.

The platform is designed to replace manual spreadsheets and paperwork with a digital workflow that helps organizations manage their transport operations efficiently while improving visibility, reducing operational overhead, and ensuring compliance with business rules.

---

## 📌 Features

### 🔐 Authentication & Role-Based Access Control
- Secure user authentication
- Role-Based Access Control (RBAC)
- Protected routes for authenticated users

### 🚚 Vehicle Management
- Register and manage vehicles
- Track vehicle status
- Maintain vehicle information including:
  - Registration Number
  - Vehicle Model
  - Vehicle Type
  - Load Capacity
  - Odometer Reading
  - Acquisition Cost

### 👨‍✈️ Driver Management
- Driver profile management
- License tracking
- Driver availability status
- Safety score management

### 📦 Trip Management
- Create and dispatch trips
- Assign vehicles and drivers
- Track trip lifecycle
- Cargo weight validation
- Distance tracking

### 🔧 Maintenance Management
- Vehicle maintenance records
- Maintenance status tracking
- Automatic vehicle availability updates

### ⛽ Fuel & Expense Management
- Fuel log management
- Expense tracking
- Maintenance cost recording
- Operational cost monitoring

### 📊 Dashboard & Analytics
- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Operational Insights

---

## 🏗️ Tech Stack

- **Laravel**
- **PHP**
- **MySQL**
- **Blade Templates**
- **Bootstrap**
- **JavaScript**
- **HTML5**
- **CSS3**

---

## 📂 Project Modules

```
Authentication
Dashboard
Vehicle Management
Driver Management
Trip Management
Maintenance Management
Fuel Management
Expense Management
Reports & Analytics
```

---

## 📋 Business Rules

The platform enforces several operational rules, including:

- Vehicle registration numbers must be unique.
- Retired or maintenance vehicles cannot be assigned to trips.
- Drivers with expired licenses cannot be dispatched.
- Vehicles and drivers already assigned to an active trip cannot be assigned again.
- Cargo weight cannot exceed the vehicle's maximum load capacity.
- Vehicle and driver statuses update automatically during trip dispatch and completion.
- Vehicles under maintenance are automatically marked unavailable.

---

## 📈 Dashboard Metrics

The dashboard provides real-time operational insights including:

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Fuel Consumption
- Operational Costs

---

## 🚀 Future Enhancements

- Interactive charts and analytics
- PDF and CSV report export
- Email reminders for expiring driver licenses
- Vehicle document management
- Advanced search and filtering
- Dark mode
- Notification system

---

## 👥 Team

Developed as part of the **Odoo Hackathon 2026**.

---

## 📄 License

This project was developed for educational and hackathon purposes.

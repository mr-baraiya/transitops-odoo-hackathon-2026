import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import VehicleRegistry from "./pages/vehicles/VehicleRegistry";
import DriverManagement from "./pages/driver/driver"
import TripManagement from "./pages/Trip/Tripmanagement"
import MaintenanceManagement from "./pages/Maintenancemanagement/Maintenancemanagement"
import FuelExpenseManagement from "./pages/Fuelexpensemanagement/Fuelexpensemanagement"
import ReportsAnalytics from "./pages/Reportsanalytics/Reportsanalytics"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<VehicleRegistry />} />
        <Route path="/driver" element={<DriverManagement/>} />
        <Route path="/trip" element={<TripManagement/>} />
        <Route path="/maintenance" element={<MaintenanceManagement/>} />
        <Route path="/fuel" element={<FuelExpenseManagement/>} />
        <Route path="/report" element={<ReportsAnalytics/>} />
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
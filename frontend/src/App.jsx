import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import VehicleRegistry from "./pages/vehicles/VehicleRegistry";
import DriverManagement from "./pages/driver/driver"
import TripManagement from "./pages/Trip/Tripmanagement"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<VehicleRegistry />} />
        <Route path="/driver" element={<DriverManagement/>} />TripManagement
        <Route path="/trip" element={<TripManagement/>} />
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
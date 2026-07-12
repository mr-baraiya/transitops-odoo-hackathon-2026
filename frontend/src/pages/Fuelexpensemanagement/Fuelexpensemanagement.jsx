import React, { useState } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Search, Bell, ChevronDown, Truck, Users, Wrench, MapPin, Fuel, Plus,
  AlertTriangle, TrendingUp, TrendingDown, Car, ClipboardList, CircleDot,
  LayoutDashboard, Settings, FileBarChart, LogOut, X, Calendar, Gauge,
  Receipt, Wallet, ParkingCircle, ShieldCheck, MoreHorizontal, Inbox,
} from "lucide-react";

/* ---------------- mock data ---------------- */

const vehicles = [
  "MH-04 BX 2210", "MH-04 BX 1187", "MH-04 BX 0925", "MH-04 BX 3342", "MH-04 BX 1765",
];

const trips = ["TRP-3391", "TRP-3390", "TRP-3389", "TRP-3388", "TRP-3387", "TRP-3376"];

const summaryCards = [
  { label: "Total Fuel Cost", value: "₹5,20,400", icon: Fuel, delta: "+8.2%", up: true },
  { label: "Total Maintenance Cost", value: "₹1,84,900", icon: Wrench, delta: "+3.5%", up: true, warn: true },
  { label: "Total Operational Cost", value: "₹7,05,300", icon: Wallet, delta: "+6.1%", up: true },
  { label: "Avg Fuel Efficiency", value: "11.4 km/l", icon: Gauge, delta: "-0.4", up: false },
  { label: "Fuel Logs Recorded", value: "342", icon: Receipt, delta: "+18", up: true },
];

const fuelLogs = [
  { id: "FL-2201", vehicle: "MH-04 BX 2210", trip: "TRP-3391", liters: 42.5, cost: "₹4,250", odometer: "82,410 km", date: "10 Jul" },
  { id: "FL-2202", vehicle: "MH-04 BX 1187", trip: "TRP-3390", liters: 38.0, cost: "₹3,800", odometer: "65,220 km", date: "10 Jul" },
  { id: "FL-2203", vehicle: "MH-04 BX 0925", trip: "TRP-3389", liters: 45.2, cost: "₹4,520", odometer: "91,005 km", date: "09 Jul" },
  { id: "FL-2204", vehicle: "MH-04 BX 3342", trip: "TRP-3388", liters: 33.8, cost: "₹3,380", odometer: "54,870 km", date: "09 Jul" },
  { id: "FL-2205", vehicle: "MH-04 BX 1765", trip: "TRP-3387", liters: 40.1, cost: "₹4,010", odometer: "77,340 km", date: "08 Jul" },
  { id: "FL-2206", vehicle: "MH-04 BX 2210", trip: "TRP-3376", liters: 41.6, cost: "₹4,160", odometer: "82,050 km", date: "07 Jul" },
];

const expenseTypeMeta = {
  Fuel: { bg: "rgba(245,166,35,.12)", color: "#B9760F", icon: Fuel },
  Toll: { bg: "rgba(59,81,117,.10)", color: "#5A6478", icon: MapPin },
  Maintenance: { bg: "rgba(229,89,77,.12)", color: "#C4392E", icon: Wrench },
  Parking: { bg: "rgba(124,111,224,.12)", color: "#5B4FCB", icon: ParkingCircle },
  Insurance: { bg: "rgba(14,165,165,.12)", color: "#0B8181", icon: ShieldCheck },
  Other: { bg: "rgba(130,145,168,.12)", color: "#5A6478", icon: MoreHorizontal },
};

const expenses = [
  { id: "EXP-5501", vehicle: "MH-04 BX 2210", type: "Fuel", amount: "₹4,250", desc: "Fuel refill at Central Depot", date: "10 Jul" },
  { id: "EXP-5502", vehicle: "MH-04 BX 1187", type: "Toll", amount: "₹380", desc: "Expressway toll — Fairview route", date: "10 Jul" },
  { id: "EXP-5503", vehicle: "MH-04 BX 3342", type: "Maintenance", amount: "₹6,800", desc: "Tyre replacement (2 units)", date: "11 Jul" },
  { id: "EXP-5504", vehicle: "MH-04 BX 0925", type: "Parking", amount: "₹150", desc: "Terminal parking, overnight", date: "09 Jul" },
  { id: "EXP-5505", vehicle: "MH-04 BX 1765", type: "Insurance", amount: "₹12,500", desc: "Annual policy renewal", date: "05 Jul" },
  { id: "EXP-5506", vehicle: "MH-04 BX 1187", type: "Other", amount: "₹450", desc: "Vehicle cleaning service", date: "08 Jul" },
  { id: "EXP-5507", vehicle: "MH-04 BX 2210", type: "Fuel", amount: "₹4,160", desc: "Fuel refill at Oak St station", date: "07 Jul" },
  { id: "EXP-5508", vehicle: "MH-04 BX 3342", type: "Toll", amount: "₹210", desc: "City toll gate", date: "06 Jul" },
  { id: "EXP-5509", vehicle: "MH-04 BX 0925", type: "Maintenance", amount: "₹1,450", desc: "Oil change", date: "09 Jul" },
];

const costTrend = [
  { month: "Feb", fuel: 4200, maintenance: 1800 },
  { month: "Mar", fuel: 4600, maintenance: 2100 },
  { month: "Apr", fuel: 4300, maintenance: 1600 },
  { month: "May", fuel: 5000, maintenance: 2400 },
  { month: "Jun", fuel: 4800, maintenance: 1900 },
  { month: "Jul", fuel: 5200, maintenance: 2600 },
];

const operationalTrend = costTrend.map((c) => ({ month: c.month, total: c.fuel + c.maintenance }));

const expenseBreakdown = [
  { name: "Fuel", value: 5204, color: "#F5A623" },
  { name: "Maintenance", value: 1849, color: "#E5594D" },
  { name: "Insurance", value: 890, color: "#0EA5A5" },
  { name: "Toll", value: 612, color: "#3B5175" },
  { name: "Parking", value: 340, color: "#7C6FE0" },
  { name: "Other", value: 210, color: "#8291A8" },
];

const opsSummary = [
  { label: "Total Fuel Cost", value: "₹5,20,400" },
  { label: "Total Maintenance Cost", value: "₹1,84,900" },
  { label: "Total Operational Cost", value: "₹7,05,300" },
  { label: "Average Cost Per Trip", value: "₹1,245" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Vehicles", icon: Truck },
  { label: "Drivers", icon: Users },
  { label: "Trips", icon: MapPin },
  { label: "Maintenance", icon: Wrench },
  { label: "Fuel Logs", icon: Fuel, active: true },
  { label: "Reports", icon: FileBarChart },
];

/* ---------------- component ---------------- */

export default function FuelExpenseManagement() {
  const [expenseType, setExpenseType] = useState("All Types");
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [dateRange, setDateRange] = useState("This Week");
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const [fuelForm, setFuelForm] = useState({
    vehicle: vehicles[0], trip: trips[0], liters: "", cost: "", odometer: "", station: "", date: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    vehicle: vehicles[0], type: "Fuel", amount: "", description: "", date: "",
  });

  const submitFuel = (e) => { e.preventDefault(); setShowFuelModal(false); };
  const submitExpense = (e) => { e.preventDefault(); setShowExpenseModal(false); };

  return (
    <div className="to-dash">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .to-dash *{ box-sizing:border-box; }
        .to-dash{
          font-family:'Inter',sans-serif;
          background:#F4F6FA;
          color:#1C2431;
          width:100%;
          height:100vh;
          display:flex;
          overflow:hidden;
        }

        /* ---------- SIDEBAR ---------- */
        .to-sidebar{
          width:240px; flex-shrink:0; height:100vh;
          background:linear-gradient(180deg,#0B1526 0%,#101F38 100%);
          color:#E8ECF3;
          display:flex; flex-direction:column;
          padding:22px 16px;
        }
        .to-sidebar-logo{
          display:flex; align-items:center; gap:9px;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px;
          padding:0 8px; margin-bottom:30px;
        }
        .to-sidebar-logo i{
          width:9px;height:9px;border-radius:50%;background:#F5A623;
          box-shadow:0 0 0 4px rgba(245,166,35,.18);
        }
        .to-nav{ display:flex; flex-direction:column; gap:2px; flex:1; }
        .to-nav-item{
          display:flex; align-items:center; gap:11px;
          padding:10px 12px; border-radius:8px;
          font-size:13.5px; font-weight:500; color:#9AA6BA;
          cursor:pointer; border-left:2px solid transparent;
          transition:.15s background, .15s color;
        }
        .to-nav-item:hover{ background:rgba(255,255,255,.05); color:#E8ECF3; }
        .to-nav-item.active{
          background:rgba(245,166,35,.10); color:#F5A623;
          border-left:2px solid #F5A623;
        }
        .to-nav-item svg{ flex-shrink:0; }

        .to-sidebar-footer{ display:flex; flex-direction:column; gap:2px; }
        .to-live-badge{
          display:inline-flex; align-items:center; gap:8px;
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.1em;
          color:#3DDC97; background:rgba(61,220,151,.08);
          border:1px solid rgba(61,220,151,.3); padding:7px 11px; border-radius:8px;
          margin-bottom:12px;
        }
        .to-live-dot{
          width:6px;height:6px;border-radius:50%;background:#3DDC97;
          animation:to-pulse 1.8s infinite;
        }
        @keyframes to-pulse{
          0%{ box-shadow:0 0 0 0 rgba(61,220,151,.55); }
          70%{ box-shadow:0 0 0 7px rgba(61,220,151,0); }
          100%{ box-shadow:0 0 0 0 rgba(61,220,151,0); }
        }
        .to-nav-item.logout{ color:#8291A8; }
        .to-nav-item.logout:hover{ color:#E5594D; background:rgba(229,89,77,.08); }

        /* ---------- MAIN COLUMN ---------- */
        .to-main{ flex:1; display:flex; flex-direction:column; min-width:0; height:100vh; }

        .to-topbar{
          display:flex; align-items:center; justify-content:space-between;
          gap:24px; padding:14px 28px;
          background:#fff; border-bottom:1px solid #E7EAF0; flex-shrink:0;
        }
        .to-search{
          flex:1; max-width:420px;
          display:flex; align-items:center; gap:10px;
          background:#F4F6FA; border:1px solid #E7EAF0; border-radius:10px;
          padding:0 14px; height:38px;
        }
        .to-search input{
          background:transparent; border:none; outline:none;
          color:#1C2431; font-size:13.5px; width:100%;
        }
        .to-search input::placeholder{ color:#9AA3B2; }
        .to-search svg{ color:#8291A8; flex-shrink:0; }

        .to-nav-right{ display:flex; align-items:center; gap:18px; }
        .to-bell{ position:relative; color:#5A6478; cursor:pointer; }
        .to-bell-dot{
          position:absolute; top:-3px; right:-3px;
          width:8px;height:8px;border-radius:50%;
          background:#F5A623; border:2px solid #fff;
        }
        .to-top-divider{ width:1px; height:26px; background:#E7EAF0; }
        .to-profile{ display:flex; align-items:center; gap:10px; }
        .to-avatar{
          width:34px;height:34px;border-radius:50%;
          background:linear-gradient(135deg,#F5A623,#E0941C);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; color:#181008;
        }
        .to-profile-name{ font-size:13.5px; font-weight:600; line-height:1.2; color:#1C2431; }
        .to-role-tag{
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.06em;
          color:#1FA871; margin-top:2px;
        }

        .to-content{ flex:1; overflow-y:auto; padding:26px 28px 40px; }

        .to-header{
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:22px; flex-wrap:wrap; gap:14px;
        }
        .to-header h1{
          font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:600; color:#101F38;
        }
        .to-header p{ color:#8291A8; font-size:13.5px; margin-top:5px; }

        .to-header-actions{ display:flex; gap:10px; flex-wrap:wrap; }
        .to-btn{
          display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif; font-size:13px; font-weight:600;
          border-radius:8px; padding:0 16px; height:38px; cursor:pointer;
          border:1px solid transparent; white-space:nowrap;
          transition:.15s opacity, .15s background;
        }
        .to-btn-primary{ background:#F5A623; color:#181008; }
        .to-btn-primary:hover{ background:#E0941C; }
        .to-btn-secondary{ background:#fff; color:#101F38; border-color:#E2E6ED; }
        .to-btn-secondary:hover{ border-color:#F5A623; color:#B9760F; }
        .to-btn-ghost{ background:transparent; color:#5A6478; border-color:#E2E6ED; }
        .to-btn-ghost:hover{ border-color:#F5A623; color:#B9760F; }

        /* ---------- SEARCH ROW ---------- */
        .to-search-row{
          display:flex; gap:12px; flex-wrap:wrap;
          margin-bottom:14px;
        }
        .to-search-box{
          flex:1; min-width:220px;
          display:flex; align-items:center; gap:10px;
          background:#fff; border:1px solid #E7EAF0; border-radius:10px;
          padding:0 14px; height:42px;
        }
        .to-search-box input{
          background:transparent; border:none; outline:none;
          color:#1C2431; font-size:13.5px; width:100%;
        }
        .to-search-box input::placeholder{ color:#9AA3B2; }
        .to-search-box svg{ color:#8291A8; flex-shrink:0; }

        /* ---------- FILTERS ---------- */
        .to-filters{
          display:flex; gap:12px; flex-wrap:wrap;
          background:#fff; border:1px solid #E7EAF0; border-radius:12px;
          padding:14px; margin-bottom:22px;
        }
        .to-filter{ display:flex; flex-direction:column; gap:5px; min-width:150px; }
        .to-filter label{ font-size:11px; font-weight:600; color:#5A6478; letter-spacing:.02em; }
        .to-filter-select{ position:relative; display:flex; align-items:center; }
        .to-filter select{
          width:100%; height:40px; appearance:none; cursor:pointer;
          border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 30px 0 12px; font-size:13px; color:#1C2431;
        }
        .to-filter select:focus{ outline:none; border-color:#F5A623; }
        .to-filter-select svg{ position:absolute; right:10px; pointer-events:none; color:#8291A8; }

        /* ---------- KPI GRID ---------- */
        .to-kpi-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:14px; margin-bottom:24px;
        }
        .to-kpi-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px; }
        .to-kpi-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .to-kpi-icon{
          width:34px;height:34px;border-radius:8px; background:#FEF4E4; color:#E0941C;
          display:flex; align-items:center; justify-content:center;
        }
        .to-kpi-icon.warn{ background:#FDECEA; color:#E5594D; }
        .to-kpi-delta{ display:flex; align-items:center; gap:3px; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; }
        .to-kpi-delta.up{ color:#2DBE80; }
        .to-kpi-delta.down{ color:#E5594D; }
        .to-kpi-value{ font-family:'Space Grotesk',sans-serif; font-size:24px; font-weight:700; color:#101F38; }
        .to-kpi-label{ font-size:12.5px; color:#8291A8; margin-top:4px; }

        /* ---------- SECTION CARD ---------- */
        .to-section-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:20px; margin-bottom:20px; }
        .to-section-title{
          font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:#101F38;
          margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;
        }
        .to-section-sub{ font-size:11.5px; color:#8291A8; font-weight:400; font-family:'Inter',sans-serif; }

        .to-toggle-row{ display:flex; align-items:center; gap:8px; font-size:12px; color:#5A6478; }
        .to-toggle{
          width:34px; height:19px; border-radius:999px; background:#E2E6ED; position:relative;
          cursor:pointer; transition:.15s background; flex-shrink:0;
        }
        .to-toggle.on{ background:#F5A623; }
        .to-toggle-dot{
          width:15px;height:15px;border-radius:50%; background:#fff; position:absolute; top:2px; left:2px;
          transition:.15s left; box-shadow:0 1px 2px rgba(0,0,0,.2);
        }
        .to-toggle.on .to-toggle-dot{ left:17px; }

        .to-analytics-grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .to-analytics-grid .to-full{ grid-column:1 / -1; }

        .to-table{ width:100%; border-collapse:collapse; font-size:13px; }
        .to-table th{
          text-align:left; padding:10px 12px; font-size:11px; letter-spacing:.04em;
          color:#8291A8; font-weight:600; border-bottom:1px solid #ECEFF3; text-transform:uppercase;
        }
        .to-table td{ padding:12px; border-bottom:1px solid #F1F3F7; color:#1C2431; }
        .to-table tr:last-child td{ border-bottom:none; }
        .to-mono{ font-family:'JetBrains Mono',monospace; font-size:12.5px; color:#5A6478; }

        .badge{
          display:inline-flex; align-items:center; gap:5px;
          font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:600;
          letter-spacing:.03em; padding:4px 9px; border-radius:6px;
        }

        .to-summary-band{
          background:linear-gradient(160deg,#0B1526 0%,#101F38 100%);
          border-radius:12px; padding:22px 24px;
          display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:20px;
          margin-bottom:20px;
        }
        .to-summary-item{ color:#E8ECF3; }
        .to-summary-item .val{ font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; }
        .to-summary-item .lbl{
          font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.06em;
          color:#8291A8; margin-top:5px; text-transform:uppercase;
        }
        .to-summary-item.accent .val{ color:#F5A623; }

        /* ---------- EMPTY STATE ---------- */
        .to-empty-wrap{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:56px 20px;
        }
        .to-empty-icon{
          width:64px;height:64px;border-radius:16px; background:#F4F6FA; color:#9AA6BA;
          display:flex; align-items:center; justify-content:center; margin-bottom:18px;
        }
        .to-empty-title{ font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:600; color:#101F38; }
        .to-empty-sub{ font-size:13px; color:#8291A8; margin-top:6px; max-width:320px; }
        .to-empty-actions{ display:flex; gap:10px; margin-top:20px; flex-wrap:wrap; justify-content:center; }

        /* ---------- MODAL ---------- */
        .to-modal-overlay{
          position:fixed; inset:0; background:rgba(11,21,38,.55);
          display:flex; align-items:center; justify-content:center; z-index:50; padding:20px;
        }
        .to-modal{
          background:#fff; border-radius:14px; width:100%; max-width:460px;
          max-height:88vh; overflow-y:auto; box-shadow:0 20px 60px rgba(11,21,38,.35);
        }
        .to-modal-head{
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 22px; border-bottom:1px solid #ECEFF3;
        }
        .to-modal-head h3{ font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:600; color:#101F38; }
        .to-modal-close{
          width:28px;height:28px;border-radius:7px; display:flex; align-items:center; justify-content:center;
          color:#8291A8; cursor:pointer; background:#F4F6FA;
        }
        .to-modal-close:hover{ color:#E5594D; }
        .to-modal-body{ padding:20px 22px 22px; }
        .to-form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }
        .to-form-field{ display:flex; flex-direction:column; gap:6px; }
        .to-form-field.full{ grid-column:1 / -1; }
        .to-form-field label{ font-size:11.5px; font-weight:600; color:#5A6478; }
        .to-form-field input, .to-form-field select, .to-form-field textarea{
          height:40px; border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 12px; font-size:13px; color:#1C2431; font-family:'Inter',sans-serif; outline:none;
        }
        .to-form-field textarea{ height:76px; padding:10px 12px; resize:none; }
        .to-form-field input:focus, .to-form-field select:focus, .to-form-field textarea:focus{ border-color:#F5A623; }
        .to-modal-actions{ display:flex; justify-content:flex-end; gap:10px; }

        @media (max-width: 1000px){
          .to-analytics-grid{ grid-template-columns:1fr; }
        }
        @media (max-width: 860px){
          .to-sidebar{ width:76px; padding:22px 10px; }
          .to-sidebar-logo span, .to-nav-item span, .to-live-badge span{ display:none; }
          .to-nav-item{ justify-content:center; }
          .to-search{ display:none; }
          .to-form-grid{ grid-template-columns:1fr; }
        }
      `}</style>

      {/* ---------- SIDEBAR ---------- */}
      <div className="to-sidebar">
        <div className="to-sidebar-logo"><i /> <span>TransitOps</span></div>

        <div className="to-nav">
          {navItems.map((n) => (
            <div className={`to-nav-item ${n.active ? "active" : ""}`} key={n.label}>
              <n.icon size={17} /> <span>{n.label}</span>
            </div>
          ))}
        </div>

        <div className="to-sidebar-footer">
          <span className="to-live-badge"><span className="to-live-dot" /> <span>LIVE NETWORK</span></span>
          <div className="to-nav-item">
            <Settings size={17} /> <span>Settings</span>
          </div>
          <div className="to-nav-item logout">
            <LogOut size={17} /> <span>Log Out</span>
          </div>
        </div>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="to-main">
        <div className="to-topbar">
          <div className="to-search">
            <Search size={15} />
            <input placeholder="Search vehicles, drivers, trip IDs…" />
          </div>

          <div className="to-nav-right">
            <div className="to-bell">
              <Bell size={19} />
              <span className="to-bell-dot" />
            </div>
            <div className="to-top-divider" />
            <div className="to-profile">
              <div className="to-avatar">RM</div>
              <div>
                <div className="to-profile-name">Rhea Malhotra</div>
                <div className="to-role-tag">FLEET MANAGER</div>
              </div>
            </div>
          </div>
        </div>

        <div className="to-content">
          {/* ---------- HEADER ---------- */}
          <div className="to-header">
            <div>
              <h1>Fuel & Expense Management</h1>
              <p>Track operational expenses and fuel consumption.</p>
            </div>
            <div className="to-header-actions">
              <button className="to-btn to-btn-secondary" onClick={() => setShowExpenseModal(true)}>
                <Plus size={15} /> Add Expense
              </button>
              <button className="to-btn to-btn-primary" onClick={() => setShowFuelModal(true)}>
                <Plus size={15} /> Add Fuel Log
              </button>
            </div>
          </div>

          {/* ---------- SEARCH ---------- */}
          <div className="to-search-row">
            <div className="to-search-box">
              <Truck size={15} />
              <input placeholder="Search by vehicle number…" />
            </div>
            <div className="to-search-box">
              <ClipboardList size={15} />
              <input placeholder="Search by trip ID…" />
            </div>
          </div>

          {/* ---------- FILTERS ---------- */}
          <div className="to-filters">
            <div className="to-filter">
              <label>Expense Type</label>
              <div className="to-filter-select">
                <select value={expenseType} onChange={(e) => setExpenseType(e.target.value)}>
                  <option>All Types</option>
                  <option>Fuel</option><option>Toll</option><option>Maintenance</option>
                  <option>Parking</option><option>Insurance</option><option>Other</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="to-filter">
              <label>Vehicle</label>
              <div className="to-filter-select">
                <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
                  <option>All Vehicles</option>
                  {vehicles.map((v) => <option key={v}>{v}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="to-filter">
              <label>Date Range</label>
              <div className="to-filter-select">
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option>Today</option><option>This Week</option><option>This Month</option><option>Custom Range</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* ---------- SUMMARY CARDS ---------- */}
          <div className="to-kpi-grid">
            {summaryCards.map((k) => (
              <div className="to-kpi-card" key={k.label}>
                <div className="to-kpi-top">
                  <div className={`to-kpi-icon ${k.warn ? "warn" : ""}`}><k.icon size={17} /></div>
                  <div className={`to-kpi-delta ${k.up ? "up" : "down"}`}>
                    {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {k.delta}
                  </div>
                </div>
                <div className="to-kpi-value">{k.value}</div>
                <div className="to-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* ---------- FUEL LOGS + EXPENSE TABLES ---------- */}
          {showEmptyState ? (
            <div className="to-section-card">
              <div className="to-section-title">
                Fuel &amp; Expense Records
                <div className="to-toggle-row">
                  Preview empty state
                  <div className={`to-toggle ${showEmptyState ? "on" : ""}`} onClick={() => setShowEmptyState(!showEmptyState)}>
                    <div className="to-toggle-dot" />
                  </div>
                </div>
              </div>
              <div className="to-empty-wrap">
                <div className="to-empty-icon"><Inbox size={28} /></div>
                <div className="to-empty-title">No Fuel or Expense Records Found</div>
                <div className="to-empty-sub">Try adjusting your filters, or log a new fuel fill-up or expense to get started.</div>
                <div className="to-empty-actions">
                  <button className="to-btn to-btn-secondary" onClick={() => setShowExpenseModal(true)}>
                    <Plus size={15} /> Add Expense
                  </button>
                  <button className="to-btn to-btn-primary" onClick={() => setShowFuelModal(true)}>
                    <Plus size={15} /> Add Fuel Log
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="to-section-card">
                <div className="to-section-title">
                  Fuel Logs
                  <div className="to-toggle-row">
                    Preview empty state
                    <div className={`to-toggle ${showEmptyState ? "on" : ""}`} onClick={() => setShowEmptyState(!showEmptyState)}>
                      <div className="to-toggle-dot" />
                    </div>
                  </div>
                </div>
                <table className="to-table">
                  <thead>
                    <tr>
                      <th>Fuel Log ID</th><th>Vehicle</th><th>Trip</th><th>Fuel (L)</th>
                      <th>Cost</th><th>Odometer</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.map((f) => (
                      <tr key={f.id}>
                        <td className="to-mono">{f.id}</td>
                        <td>{f.vehicle}</td>
                        <td className="to-mono">{f.trip}</td>
                        <td>{f.liters.toFixed(1)} L</td>
                        <td className="to-mono">{f.cost}</td>
                        <td className="to-mono">{f.odometer}</td>
                        <td className="to-mono">{f.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="to-section-card">
                <div className="to-section-title">Expense Records</div>
                <table className="to-table">
                  <thead>
                    <tr>
                      <th>Expense ID</th><th>Vehicle</th><th>Type</th><th>Amount</th>
                      <th>Description</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((ex) => {
                      const meta = expenseTypeMeta[ex.type];
                      return (
                        <tr key={ex.id}>
                          <td className="to-mono">{ex.id}</td>
                          <td>{ex.vehicle}</td>
                          <td>
                            <span className="badge" style={{ background: meta.bg, color: meta.color }}>
                              <meta.icon size={11} /> {ex.type}
                            </span>
                          </td>
                          <td className="to-mono">{ex.amount}</td>
                          <td>{ex.desc}</td>
                          <td className="to-mono">{ex.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ---------- COST ANALYTICS ---------- */}
          <div className="to-analytics-grid">
            <div className="to-section-card">
              <div className="to-section-title">
                Fuel Cost Trend
                <span className="to-section-sub">Last 6 months, in ₹</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={costTrend}>
                  <CartesianGrid vertical={false} stroke="#EEF1F5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                  <Line type="monotone" dataKey="fuel" stroke="#F5A623" strokeWidth={2.5} dot={false} name="Fuel" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="to-section-card">
              <div className="to-section-title">
                Maintenance Cost Trend
                <span className="to-section-sub">Last 6 months, in ₹</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={costTrend}>
                  <CartesianGrid vertical={false} stroke="#EEF1F5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                  <Line type="monotone" dataKey="maintenance" stroke="#3B5175" strokeWidth={2.5} dot={false} name="Maintenance" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="to-section-card">
              <div className="to-section-title">Expense Breakdown</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {expenseBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11.5, color: "#5A6478" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="to-section-card">
              <div className="to-section-title">
                Monthly Operational Cost
                <span className="to-section-sub">Fuel + Maintenance</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={operationalTrend}>
                  <CartesianGrid vertical={false} stroke="#EEF1F5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                  <Line type="monotone" dataKey="total" stroke="#1FA871" strokeWidth={2.5} dot={{ r: 3 }} name="Total Cost" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ---------- OPERATIONAL SUMMARY ---------- */}
          <div className="to-summary-band">
            {opsSummary.map((o, i) => (
              <div className={`to-summary-item ${i === opsSummary.length - 1 ? "accent" : ""}`} key={o.label}>
                <div className="val">{o.value}</div>
                <div className="lbl">{o.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- ADD FUEL LOG MODAL ---------- */}
      {showFuelModal && (
        <div className="to-modal-overlay" onClick={() => setShowFuelModal(false)}>
          <div className="to-modal" onClick={(e) => e.stopPropagation()}>
            <div className="to-modal-head">
              <h3>Add Fuel Log</h3>
              <div className="to-modal-close" onClick={() => setShowFuelModal(false)}><X size={16} /></div>
            </div>
            <form className="to-modal-body" onSubmit={submitFuel}>
              <div className="to-form-grid">
                <div className="to-form-field">
                  <label>Vehicle</label>
                  <select value={fuelForm.vehicle} onChange={(e) => setFuelForm({ ...fuelForm, vehicle: e.target.value })}>
                    {vehicles.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="to-form-field">
                  <label>Trip</label>
                  <select value={fuelForm.trip} onChange={(e) => setFuelForm({ ...fuelForm, trip: e.target.value })}>
                    {trips.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="to-form-field">
                  <label>Fuel Quantity (Liters)</label>
                  <input type="number" step="0.1" placeholder="e.g. 42.5" value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                </div>
                <div className="to-form-field">
                  <label>Fuel Cost (₹)</label>
                  <input type="number" placeholder="e.g. 4250" value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                </div>
                <div className="to-form-field">
                  <label>Odometer Reading (km)</label>
                  <input type="number" placeholder="e.g. 82410" value={fuelForm.odometer}
                    onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })} />
                </div>
                <div className="to-form-field">
                  <label>Fuel Station</label>
                  <input type="text" placeholder="e.g. Central Depot" value={fuelForm.station}
                    onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })} />
                </div>
                <div className="to-form-field full">
                  <label>Date</label>
                  <input type="date" value={fuelForm.date}
                    onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
                </div>
              </div>
              <div className="to-modal-actions">
                <button type="button" className="to-btn to-btn-ghost" onClick={() => setShowFuelModal(false)}>Cancel</button>
                <button type="submit" className="to-btn to-btn-primary">Save Fuel Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- ADD EXPENSE MODAL ---------- */}
      {showExpenseModal && (
        <div className="to-modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="to-modal" onClick={(e) => e.stopPropagation()}>
            <div className="to-modal-head">
              <h3>Add Expense</h3>
              <div className="to-modal-close" onClick={() => setShowExpenseModal(false)}><X size={16} /></div>
            </div>
            <form className="to-modal-body" onSubmit={submitExpense}>
              <div className="to-form-grid">
                <div className="to-form-field">
                  <label>Vehicle</label>
                  <select value={expenseForm.vehicle} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })}>
                    {vehicles.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="to-form-field">
                  <label>Expense Type</label>
                  <select value={expenseForm.type} onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                    {Object.keys(expenseTypeMeta).map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="to-form-field">
                  <label>Amount (₹)</label>
                  <input type="number" placeholder="e.g. 450" value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                </div>
                <div className="to-form-field">
                  <label>Date</label>
                  <input type="date" value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                </div>
                <div className="to-form-field full">
                  <label>Description</label>
                  <textarea placeholder="Brief note about this expense…" value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                </div>
              </div>
              <div className="to-modal-actions">
                <button type="button" className="to-btn to-btn-ghost" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="submit" className="to-btn to-btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
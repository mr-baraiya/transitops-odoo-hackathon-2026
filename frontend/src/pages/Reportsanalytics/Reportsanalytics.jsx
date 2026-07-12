import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Search, Bell, ChevronDown, Truck, Users, Wrench, MapPin, Fuel,
  TrendingUp, TrendingDown, Car, ClipboardList, LayoutDashboard, Settings,
  FileBarChart, LogOut, Download, FileText, Route, Percent, Award,
  UserCheck, Gauge, Inbox, RefreshCw, Star, Wallet, DollarSign,
} from "lucide-react";

/* ---------------- mock data ---------------- */

const kpis = [
  { label: "Fleet Utilization", value: "82%", icon: TrendingUp, delta: "+3.1%", up: true },
  { label: "Fuel Efficiency", value: "11.4 km/l", icon: Fuel, delta: "-0.4", up: false },
  { label: "Operational Cost", value: "₹7,05,300", icon: Wallet, delta: "+6.1%", up: true, warn: true },
  { label: "Vehicle ROI", value: "18.6%", icon: Percent, delta: "+1.8%", up: true },
  { label: "Total Trips", value: "1,284", icon: MapPin, delta: "+92", up: true },
  { label: "Total Distance Covered", value: "48,920 km", icon: Route, delta: "+2,410", up: true },
];

const tripsOverview = [
  { day: "Mon", scheduled: 62, completed: 58 },
  { day: "Tue", scheduled: 70, completed: 64 },
  { day: "Wed", scheduled: 66, completed: 61 },
  { day: "Thu", scheduled: 74, completed: 69 },
  { day: "Fri", scheduled: 80, completed: 71 },
  { day: "Sat", scheduled: 52, completed: 49 },
  { day: "Sun", scheduled: 40, completed: 38 },
];

const costTrend = [
  { month: "Feb", fuel: 4200, maintenance: 1800 },
  { month: "Mar", fuel: 4600, maintenance: 2100 },
  { month: "Apr", fuel: 4300, maintenance: 1600 },
  { month: "May", fuel: 5000, maintenance: 2400 },
  { month: "Jun", fuel: 4800, maintenance: 1900 },
  { month: "Jul", fuel: 5200, maintenance: 2600 },
];

const statusDistribution = [
  { name: "Available", value: 22, color: "#3DDC97" },
  { name: "On Trip", value: 96, color: "#F5A623" },
  { name: "Maintenance", value: 8, color: "#E5594D" },
  { name: "Retired", value: 4, color: "#3B5175" },
];

const expenseBreakdown = [
  { name: "Fuel", value: 5204, color: "#F5A623" },
  { name: "Maintenance", value: 1849, color: "#E5594D" },
  { name: "Insurance", value: 890, color: "#0EA5A5" },
  { name: "Toll", value: 612, color: "#3B5175" },
  { name: "Parking", value: 340, color: "#7C6FE0" },
  { name: "Other", value: 210, color: "#8291A8" },
];

const utilizationTrend = [
  { month: "Feb", utilization: 74 },
  { month: "Mar", utilization: 77 },
  { month: "Apr", utilization: 73 },
  { month: "May", utilization: 79 },
  { month: "Jun", utilization: 80 },
  { month: "Jul", utilization: 82 },
];

const reportsTable = [
  { vehicle: "MH-04 BX 2210", distance: "9,240 km", fuel: "812 L", efficiency: "11.4 km/l", maintenance: "₹18,400", total: "₹1,02,600", revenue: "₹1,38,900", roi: "35.4%" },
  { vehicle: "MH-04 BX 1187", distance: "8,410 km", fuel: "760 L", efficiency: "11.1 km/l", maintenance: "₹22,100", total: "₹98,200", revenue: "₹1,15,600", roi: "17.7%" },
  { vehicle: "MH-04 BX 0925", distance: "10,050 km", fuel: "845 L", efficiency: "11.9 km/l", maintenance: "₹14,900", total: "₹1,08,300", revenue: "₹1,42,200", roi: "31.3%" },
  { vehicle: "MH-04 BX 3342", distance: "7,320 km", fuel: "690 L", efficiency: "10.6 km/l", maintenance: "₹31,600", total: "₹95,400", revenue: "₹99,800", roi: "4.6%" },
  { vehicle: "MH-04 BX 1765", distance: "8,890 km", fuel: "770 L", efficiency: "11.5 km/l", maintenance: "₹19,200", total: "₹1,00,700", revenue: "₹1,27,300", roi: "26.4%" },
  { vehicle: "MH-04 BX 4482", distance: "5,010 km", fuel: "480 L", efficiency: "10.4 km/l", maintenance: "₹8,700", total: "₹58,100", revenue: "₹61,400", roi: "5.7%" },
];

const performanceCards = [
  { label: "Best Performing Vehicle", value: "MH-04 BX 2210", sub: "35.4% ROI · 9,240 km this month", icon: Award },
  { label: "Highest Fuel Efficiency", value: "MH-04 BX 0925", sub: "11.9 km/l average", icon: Fuel },
  { label: "Most Active Driver", value: "Arjun Patel", sub: "214 trips completed", icon: UserCheck },
  { label: "Highest Maintenance Cost", value: "MH-04 BX 3342", sub: "₹31,600 this month", icon: Wrench },
];

const opsSummary = [
  { label: "Total Revenue", value: "₹6,85,200" },
  { label: "Total Fuel Cost", value: "₹5,20,400" },
  { label: "Total Maintenance Cost", value: "₹1,84,900" },
  { label: "Net Operational Cost", value: "₹7,05,300" },
  { label: "Fleet Utilization", value: "82%" },
  { label: "Avg Cost Per Km", value: "₹14.4" },
];

const insights = [
  { label: "Most Used Vehicle", value: "MH-04 BX 2210", icon: TrendingUp },
  { label: "Least Used Vehicle", value: "MH-04 BX 4482", icon: TrendingDown },
  { label: "Driver With Most Trips", value: "Arjun Patel", icon: UserCheck },
  { label: "Highest ROI Vehicle", value: "MH-04 BX 2210", icon: Star },
  { label: "Vehicles Due For Maintenance", value: "5 vehicles", icon: Wrench },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Vehicles", icon: Truck },
  { label: "Drivers", icon: Users },
  { label: "Trips", icon: MapPin },
  { label: "Maintenance", icon: Wrench },
  { label: "Fuel Logs", icon: Fuel },
  { label: "Reports", icon: FileBarChart, active: true },
];

/* ---------------- component ---------------- */

export default function ReportsAnalytics() {
  const [vehicleType, setVehicleType] = useState("All Types");
  const [region, setRegion] = useState("All Regions");
  const [driver, setDriver] = useState("All Drivers");
  const [dateRange, setDateRange] = useState("This Month");
  const [showEmptyState, setShowEmptyState] = useState(false);

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
        .to-kpi-value{ font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:700; color:#101F38; }
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

        .to-charts-grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .to-charts-grid .to-full{ grid-column:1 / -1; }

        .to-table{ width:100%; border-collapse:collapse; font-size:13px; }
        .to-table th{
          text-align:left; padding:10px 12px; font-size:11px; letter-spacing:.04em;
          color:#8291A8; font-weight:600; border-bottom:1px solid #ECEFF3; text-transform:uppercase;
          white-space:nowrap;
        }
        .to-table td{ padding:12px; border-bottom:1px solid #F1F3F7; color:#1C2431; white-space:nowrap; }
        .to-table tr:last-child td{ border-bottom:none; }
        .to-mono{ font-family:'JetBrains Mono',monospace; font-size:12.5px; color:#5A6478; }
        .to-table-scroll{ overflow-x:auto; }

        .to-roi-pos{ color:#1FA871; font-weight:600; }
        .to-roi-low{ color:#E0941C; font-weight:600; }

        /* ---------- PERFORMANCE / INSIGHT CARDS ---------- */
        .to-perf-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:14px; margin-bottom:20px;
        }
        .to-perf-card{
          background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px;
          display:flex; gap:12px; align-items:flex-start;
        }
        .to-perf-icon{
          width:36px;height:36px;border-radius:9px; background:#FEF4E4; color:#E0941C;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .to-perf-label{ font-size:11.5px; color:#8291A8; font-weight:500; }
        .to-perf-value{ font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:700; color:#101F38; margin-top:3px; }
        .to-perf-sub{ font-size:11.5px; color:#8291A8; margin-top:3px; }

        .to-insight-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr));
          gap:12px; margin-bottom:20px;
        }
        .to-insight-card{
          background:#FBFCFE; border:1px solid #E7EAF0; border-radius:10px; padding:14px;
          display:flex; flex-direction:column; gap:8px;
        }
        .to-insight-top{ display:flex; align-items:center; gap:8px; color:#8291A8; font-size:11.5px; font-weight:600; }
        .to-insight-value{ font-family:'Space Grotesk',sans-serif; font-size:14.5px; font-weight:700; color:#101F38; }

        .to-summary-band{
          background:linear-gradient(160deg,#0B1526 0%,#101F38 100%);
          border-radius:12px; padding:22px 24px;
          display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:20px;
          margin-bottom:20px;
        }
        .to-summary-item{ color:#E8ECF3; }
        .to-summary-item .val{ font-family:'Space Grotesk',sans-serif; font-size:19px; font-weight:700; }
        .to-summary-item .lbl{
          font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.06em;
          color:#8291A8; margin-top:5px; text-transform:uppercase;
        }
        .to-summary-item.accent .val{ color:#F5A623; }

        .to-export-row{ display:flex; gap:12px; flex-wrap:wrap; }

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

        @media (max-width: 1000px){
          .to-charts-grid{ grid-template-columns:1fr; }
        }
        @media (max-width: 860px){
          .to-sidebar{ width:76px; padding:22px 10px; }
          .to-sidebar-logo span, .to-nav-item span, .to-live-badge span{ display:none; }
          .to-nav-item{ justify-content:center; }
          .to-search{ display:none; }
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
              <h1>Reports &amp; Analytics</h1>
              <p>Analyze fleet performance and operational insights.</p>
            </div>
            <div className="to-toggle-row">
              Preview empty state
              <div className={`to-toggle ${showEmptyState ? "on" : ""}`} onClick={() => setShowEmptyState(!showEmptyState)}>
                <div className="to-toggle-dot" />
              </div>
            </div>
          </div>

          {/* ---------- FILTERS ---------- */}
          <div className="to-filters">
            <div className="to-filter">
              <label>Vehicle Type</label>
              <div className="to-filter-select">
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                  <option>All Types</option><option>Bus</option><option>Mini Bus</option>
                  <option>Van</option><option>Truck</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="to-filter">
              <label>Region</label>
              <div className="to-filter-select">
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>All Regions</option><option>Central</option><option>Fairview</option>
                  <option>Oak Street</option><option>Terminal</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="to-filter">
              <label>Driver</label>
              <div className="to-filter-select">
                <select value={driver} onChange={(e) => setDriver(e.target.value)}>
                  <option>All Drivers</option><option>Arjun Patel</option><option>Sara Khan</option>
                  <option>Ravi Shah</option><option>Neha Verma</option><option>Karan Mehta</option>
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

          {showEmptyState ? (
            <div className="to-section-card">
              <div className="to-empty-wrap">
                <div className="to-empty-icon"><Inbox size={28} /></div>
                <div className="to-empty-title">No Report Data Available</div>
                <div className="to-empty-sub">Try widening your date range or clearing filters to see fleet performance data.</div>
                <div className="to-empty-actions">
                  <button className="to-btn to-btn-secondary" onClick={() => setShowEmptyState(false)}>
                    <RefreshCw size={15} /> Reset Filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ---------- KPI CARDS ---------- */}
              <div className="to-kpi-grid">
                {kpis.map((k) => (
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

              {/* ---------- CHARTS ---------- */}
              <div className="to-charts-grid">
                <div className="to-section-card">
                  <div className="to-section-title">
                    Trips Overview
                    <span className="to-section-sub">Scheduled vs completed, last 7 days</span>
                  </div>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={tripsOverview} barGap={4}>
                      <CartesianGrid vertical={false} stroke="#EEF1F5" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                      <Bar dataKey="scheduled" fill="#E2E6ED" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" fill="#F5A623" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="to-section-card">
                  <div className="to-section-title">Vehicle Status Distribution</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={statusDistribution} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
                        {statusDistribution.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#5A6478" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="to-section-card">
                  <div className="to-section-title">Fuel Cost Trend</div>
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
                  <div className="to-section-title">Maintenance Cost Trend</div>
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
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={expenseBreakdown} dataKey="value" innerRadius={0} outerRadius={80} paddingAngle={1}>
                        {expenseBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#5A6478" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="to-section-card">
                  <div className="to-section-title">
                    Fleet Utilization Trend
                    <span className="to-section-sub">Last 6 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={utilizationTrend}>
                      <defs>
                        <linearGradient id="utilFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F5A623" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#F5A623" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#EEF1F5" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} width={34} />
                      <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                      <Area type="monotone" dataKey="utilization" stroke="#F5A623" strokeWidth={2.5} fill="url(#utilFill)" name="Utilization %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ---------- REPORTS TABLE ---------- */}
              <div className="to-section-card">
                <div className="to-section-title">
                  Vehicle Performance Reports
                  <span className="to-section-sub">This month, all regions</span>
                </div>
                <div className="to-table-scroll">
                  <table className="to-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th><th>Distance</th><th>Fuel Consumed</th><th>Efficiency</th>
                        <th>Maintenance Cost</th><th>Total Operational Cost</th><th>Revenue</th><th>ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsTable.map((r) => (
                        <tr key={r.vehicle}>
                          <td>{r.vehicle}</td>
                          <td className="to-mono">{r.distance}</td>
                          <td className="to-mono">{r.fuel}</td>
                          <td className="to-mono">{r.efficiency}</td>
                          <td className="to-mono">{r.maintenance}</td>
                          <td className="to-mono">{r.total}</td>
                          <td className="to-mono">{r.revenue}</td>
                          <td className={`to-mono ${parseFloat(r.roi) >= 15 ? "to-roi-pos" : "to-roi-low"}`}>{r.roi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ---------- PERFORMANCE CARDS ---------- */}
              <div className="to-section-card">
                <div className="to-section-title">Performance Highlights</div>
                <div className="to-perf-grid">
                  {performanceCards.map((p) => (
                    <div className="to-perf-card" key={p.label}>
                      <div className="to-perf-icon"><p.icon size={17} /></div>
                      <div>
                        <div className="to-perf-label">{p.label}</div>
                        <div className="to-perf-value">{p.value}</div>
                        <div className="to-perf-sub">{p.sub}</div>
                      </div>
                    </div>
                  ))}
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

              {/* ---------- EXPORT ---------- */}
              <div className="to-section-card">
                <div className="to-section-title">Export Report</div>
                <div className="to-export-row">
                  <button className="to-btn to-btn-secondary"><Download size={15} /> Export CSV</button>
                  <button className="to-btn to-btn-primary"><FileText size={15} /> Export PDF</button>
                </div>
              </div>

              {/* ---------- ANALYTICS INSIGHTS ---------- */}
              <div className="to-section-card">
                <div className="to-section-title">Analytics Insights</div>
                <div className="to-insight-grid">
                  {insights.map((i) => (
                    <div className="to-insight-card" key={i.label}>
                      <div className="to-insight-top"><i.icon size={13} /> {i.label}</div>
                      <div className="to-insight-value">{i.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
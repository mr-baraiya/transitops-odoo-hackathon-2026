import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  Search, Bell, ChevronDown, Truck, Users, Wrench, MapPin, Fuel, Plus,
  AlertTriangle, TrendingUp, TrendingDown, Car, ClipboardList, CircleDot,
  LayoutDashboard, Settings, FileBarChart, LogOut,
} from "lucide-react";

/* ---------------- mock data ---------------- */

const kpis = [
  { label: "Active Vehicles", value: "96", icon: Truck, delta: "+4", up: true },
  { label: "Available Vehicles", value: "22", icon: CircleDot, delta: "-2", up: false },
  { label: "In Maintenance", value: "8", icon: Wrench, delta: "+1", up: true, warn: true },
  { label: "Active Trips", value: "41", icon: MapPin, delta: "+9", up: true },
  { label: "Pending Trips", value: "13", icon: ClipboardList, delta: "-3", up: false },
  { label: "Drivers On Duty", value: "88", icon: Users, delta: "+5", up: true },
  { label: "Fleet Utilization", value: "82%", icon: TrendingUp, delta: "+3.1%", up: true },
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

const statusDistribution = [
  { name: "Available", value: 22, color: "#3DDC97" },
  { name: "On Trip", value: 96, color: "#F5A623" },
  { name: "Maintenance", value: 8, color: "#E5594D" },
  { name: "Retired", value: 4, color: "#3B5175" },
];

const costTrend = [
  { month: "Feb", fuel: 4200, maintenance: 1800 },
  { month: "Mar", fuel: 4600, maintenance: 2100 },
  { month: "Apr", fuel: 4300, maintenance: 1600 },
  { month: "May", fuel: 5000, maintenance: 2400 },
  { month: "Jun", fuel: 4800, maintenance: 1900 },
  { month: "Jul", fuel: 5200, maintenance: 2600 },
];

const recentTrips = [
  { id: "TRP-3391", vehicle: "MH-04 BX 2210", driver: "Arjun Patel", from: "Central", to: "Terminal", status: "On Time", eta: "14:22" },
  { id: "TRP-3390", vehicle: "MH-04 BX 1187", driver: "Sara Khan", from: "Fairview", to: "Oak St", status: "Delayed", eta: "14:45" },
  { id: "TRP-3389", vehicle: "MH-04 BX 0925", driver: "Ravi Shah", from: "Terminal", to: "Central", status: "On Time", eta: "13:58" },
  { id: "TRP-3388", vehicle: "MH-04 BX 3342", driver: "Neha Verma", from: "Oak St", to: "Fairview", status: "Dispatched", eta: "15:10" },
  { id: "TRP-3387", vehicle: "MH-04 BX 1765", driver: "Karan Mehta", from: "Central", to: "Fairview", status: "On Time", eta: "13:40" },
];

const recentMaintenance = [
  { vehicle: "MH-04 BX 2210", service: "Brake Inspection", status: "Completed", cost: "₹3,200", date: "10 Jul" },
  { vehicle: "MH-04 BX 0925", service: "Oil Change", status: "Completed", cost: "₹1,450", date: "09 Jul" },
  { vehicle: "MH-04 BX 3342", service: "Tyre Replacement", status: "In Progress", cost: "₹6,800", date: "11 Jul" },
  { vehicle: "MH-04 BX 1187", service: "AC Servicing", status: "Scheduled", cost: "₹2,100", date: "13 Jul" },
];

const alerts = [
  { text: "3 drivers have licenses expiring within 7 days", level: "high" },
  { text: "5 vehicles are due for scheduled maintenance", level: "medium" },
  { text: "8 trips are pending dispatch approval", level: "medium" },
  { text: "Operational cost is up 12% versus last week", level: "low" },
];

const quickActions = [
  { label: "Add Vehicle", icon: Car },
  { label: "Add Driver", icon: Users },
  { label: "Create Trip", icon: MapPin },
  { label: "Add Maintenance", icon: Wrench },
  { label: "Record Fuel Log", icon: Fuel },
];

const opsSummary = [
  { label: "Total Fuel Cost", value: "₹5,20,400" },
  { label: "Total Maintenance Cost", value: "₹1,84,900" },
  { label: "Avg Fuel Efficiency", value: "11.4 km/l" },
  { label: "Fleet Utilization", value: "82%" },
  { label: "Total Operational Cost", value: "₹7,05,300" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Vehicles", icon: Truck },
  { label: "Drivers", icon: Users },
  { label: "Trips", icon: MapPin },
  { label: "Maintenance", icon: Wrench },
  { label: "Fuel Logs", icon: Fuel },
  { label: "Reports", icon: FileBarChart },
];

const statusBadgeClass = (status) => {
  const s = status.toLowerCase();
  if (s.includes("time") || s.includes("completed") || s.includes("available")) return "badge badge-green";
  if (s.includes("delay") || s.includes("progress")) return "badge badge-amber";
  if (s.includes("dispatch") || s.includes("scheduled")) return "badge badge-slate";
  return "badge badge-slate";
};

/* ---------------- component ---------------- */

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState("All Types");
  const [vehicleStatus, setVehicleStatus] = useState("All Status");
  const [region, setRegion] = useState("All Regions");
  const [dateRange, setDateRange] = useState("This Week");

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
        .to-sync-badge{
          display:inline-flex; align-items:center; gap:8px;
          font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.1em;
          color:#3DDC97; background:rgba(61,220,151,.08);
          border:1px solid rgba(61,220,151,.3); padding:6px 12px; border-radius:999px;
          white-space:nowrap;
        }
        .to-sync-badge .to-live-dot{ margin:0; }

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
        .to-kpi-value{ font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:#101F38; }
        .to-kpi-label{ font-size:12.5px; color:#8291A8; margin-top:4px; }

        /* ---------- SECTION CARD ---------- */
        .to-section-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:20px; margin-bottom:20px; }
        .to-section-title{
          font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:#101F38;
          margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;
        }
        .to-section-sub{ font-size:11.5px; color:#8291A8; font-weight:400; font-family:'Inter',sans-serif; }

        .to-analytics-grid{ display:grid; grid-template-columns:1.2fr 1fr; gap:20px; margin-bottom:20px; }
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
        .badge-green{ background:rgba(61,220,151,.12); color:#1FA871; }
        .badge-amber{ background:rgba(245,166,35,.12); color:#B9760F; }
        .badge-slate{ background:rgba(59,81,117,.10); color:#5A6478; }
        .badge-red{ background:rgba(229,89,77,.12); color:#C4392E; }

        .to-two-col{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .to-status-row{ display:flex; align-items:center; gap:12px; padding:10px 0; }
        .to-status-row + .to-status-row{ border-top:1px solid #F1F3F7; }
        .to-status-dot{ width:9px;height:9px;border-radius:50%; flex-shrink:0; }
        .to-status-label{ flex:1; font-size:13px; color:#33394A; }
        .to-status-count{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:#101F38; }
        .to-status-bar{ width:100%; height:5px; border-radius:4px; background:#EEF1F5; margin-top:6px; overflow:hidden; }
        .to-status-bar-fill{ height:100%; border-radius:4px; }
        .to-status-item{ width:100%; }

        .to-alert{ display:flex; align-items:flex-start; gap:10px; padding:11px 0; font-size:13px; color:#33394A; }
        .to-alert + .to-alert{ border-top:1px solid #F1F3F7; }
        .to-alert-icon{
          width:26px;height:26px;border-radius:7px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; margin-top:1px;
        }
        .to-alert.high .to-alert-icon{ background:#FDECEA; color:#E5594D; }
        .to-alert.medium .to-alert-icon{ background:#FEF4E4; color:#E0941C; }
        .to-alert.low .to-alert-icon{ background:rgba(61,220,151,.12); color:#1FA871; }

        .to-actions-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; }
        .to-action-btn{
          display:flex; flex-direction:column; align-items:flex-start; gap:10px;
          background:#FBFCFE; border:1px solid #E7EAF0; border-radius:10px;
          padding:14px; cursor:pointer; transition:.15s border-color, .15s background;
          font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:#1C2431;
        }
        .to-action-btn:hover{ border-color:#F5A623; background:#FFFBF3; }
        .to-action-btn .to-action-icon{
          width:32px;height:32px;border-radius:8px; background:#101F38; color:#F5A623;
          display:flex; align-items:center; justify-content:center;
        }

        .to-summary-band{
          background:linear-gradient(160deg,#0B1526 0%,#101F38 100%);
          border-radius:12px; padding:22px 24px;
          display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:20px;
        }
        .to-summary-item{ color:#E8ECF3; }
        .to-summary-item .val{ font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; }
        .to-summary-item .lbl{
          font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.06em;
          color:#8291A8; margin-top:5px; text-transform:uppercase;
        }
        .to-summary-item.accent .val{ color:#F5A623; }

        @media (max-width: 1000px){
          .to-analytics-grid, .to-two-col{ grid-template-columns:1fr; }
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
          <div className="to-header">
            <div>
              <h1>Fleet Operations Dashboard</h1>
              <p>Monitoring 128 vehicles across 4 regions today.</p>
            </div>
            <span className="to-sync-badge"><span className="to-live-dot" /> SYNCED 2 MIN AGO</span>
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
              <label>Vehicle Status</label>
              <div className="to-filter-select">
                <select value={vehicleStatus} onChange={(e) => setVehicleStatus(e.target.value)}>
                  <option>All Status</option><option>Available</option><option>On Trip</option>
                  <option>Maintenance</option><option>Retired</option>
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
              <label>Date Range</label>
              <div className="to-filter-select">
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option>Today</option><option>This Week</option><option>This Month</option><option>Custom Range</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

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

          {/* ---------- ANALYTICS ---------- */}
          <div className="to-analytics-grid">
            <div className="to-section-card">
              <div className="to-section-title">
                Trips Overview
                <span className="to-section-sub">Scheduled vs completed, last 7 days</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
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
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {statusDistribution.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#5A6478" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="to-section-card to-full">
              <div className="to-section-title">
                Fuel &amp; Maintenance Cost Trend
                <span className="to-section-sub">Last 6 months, in ₹</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={costTrend}>
                  <CartesianGrid vertical={false} stroke="#EEF1F5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8291A8" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "#101F38", border: "none", borderRadius: 8, fontSize: 12, color: "#E8ECF3" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#5A6478" }} />
                  <Line type="monotone" dataKey="fuel" stroke="#F5A623" strokeWidth={2.5} dot={false} name="Fuel" />
                  <Line type="monotone" dataKey="maintenance" stroke="#3B5175" strokeWidth={2.5} dot={false} name="Maintenance" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ---------- RECENT TRIPS TABLE ---------- */}
          <div className="to-section-card">
            <div className="to-section-title">Recent Trips</div>
            <table className="to-table">
              <thead>
                <tr>
                  <th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Source</th>
                  <th>Destination</th><th>Status</th><th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((t) => (
                  <tr key={t.id}>
                    <td className="to-mono">{t.id}</td>
                    <td>{t.vehicle}</td>
                    <td>{t.driver}</td>
                    <td>{t.from}</td>
                    <td>{t.to}</td>
                    <td><span className={statusBadgeClass(t.status)}>{t.status}</span></td>
                    <td className="to-mono">{t.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- STATUS SUMMARY + ALERTS ---------- */}
          <div className="to-two-col">
            <div className="to-section-card">
              <div className="to-section-title">Vehicle Status Summary</div>
              {statusDistribution.map((s) => {
                const total = statusDistribution.reduce((a, b) => a + b.value, 0);
                const pct = Math.round((s.value / total) * 100);
                return (
                  <div className="to-status-row" key={s.name}>
                    <span className="to-status-dot" style={{ background: s.color }} />
                    <div className="to-status-item">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="to-status-label">{s.name}</span>
                        <span className="to-status-count">{s.value}</span>
                      </div>
                      <div className="to-status-bar">
                        <div className="to-status-bar-fill" style={{ width: `${pct}%`, background: s.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="to-section-card">
              <div className="to-section-title">Alerts &amp; Notifications</div>
              {alerts.map((a, i) => (
                <div className={`to-alert ${a.level}`} key={i}>
                  <span className="to-alert-icon"><AlertTriangle size={13} /></span>
                  {a.text}
                </div>
              ))}
            </div>
          </div>

          {/* ---------- RECENT MAINTENANCE ---------- */}
          <div className="to-section-card">
            <div className="to-section-title">Recent Maintenance</div>
            <table className="to-table">
              <thead>
                <tr><th>Vehicle</th><th>Service Type</th><th>Status</th><th>Cost</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentMaintenance.map((m, i) => (
                  <tr key={i}>
                    <td>{m.vehicle}</td>
                    <td>{m.service}</td>
                    <td><span className={statusBadgeClass(m.status)}>{m.status}</span></td>
                    <td className="to-mono">{m.cost}</td>
                    <td className="to-mono">{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- QUICK ACTIONS ---------- */}
          <div className="to-section-card">
            <div className="to-section-title">Quick Actions</div>
            <div className="to-actions-grid">
              {quickActions.map((a) => (
                <button className="to-action-btn" key={a.label}>
                  <span className="to-action-icon"><a.icon size={16} /></span>
                  {a.label}
                </button>
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
        </div>
      </div>
    </div>
  );
}
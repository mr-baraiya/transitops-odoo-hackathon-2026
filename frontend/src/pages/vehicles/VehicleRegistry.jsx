import React, { useMemo, useState } from "react";
import {
  Search, Bell, ChevronDown, Truck, Users, Wrench, MapPin, Fuel,
  LayoutDashboard, Settings, FileBarChart, LogOut, Plus, Eye, Pencil,
  Trash2, X, Gauge, Weight, IndianRupee, MapPinned, Car,
} from "lucide-react";

/* ---------------- mock data ---------------- */

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Vehicles", icon: Truck, active: true },
  { label: "Drivers", icon: Users },
  { label: "Trips", icon: MapPin },
  { label: "Maintenance", icon: Wrench },
  { label: "Fuel Logs", icon: Fuel },
  { label: "Reports", icon: FileBarChart },
];

const summary = [
  { label: "Total Vehicles", value: "128", icon: Truck, tone: "slate" },
  { label: "Available", value: "22", icon: Car, tone: "green" },
  { label: "On Trip", value: "96", icon: MapPin, tone: "blue" },
  { label: "In Maintenance", value: "8", icon: Wrench, tone: "amber" },
  { label: "Retired", value: "4", icon: X, tone: "red" },
];

const vehicles = [
  { reg: "MH-04 BX 2210", name: "Tata Starbus", model: "Ultra 12m", type: "Bus", load: "45 seats", odo: "1,42,300 km", cost: "₹32,50,000", region: "Central", status: "Available" },
  { reg: "MH-04 BX 1187", name: "Ashok Leyland", model: "Falcon Mini", type: "Mini Bus", load: "26 seats", odo: "88,450 km", cost: "₹18,20,000", region: "Fairview", status: "On Trip" },
  { reg: "MH-04 BX 0925", name: "Force Traveller", model: "3350", type: "Van", load: "1,200 kg", odo: "56,900 km", cost: "₹11,40,000", region: "Terminal", status: "On Trip" },
  { reg: "MH-04 BX 3342", name: "Tata Ultra", model: "T.7", type: "Truck", load: "3,500 kg", odo: "2,05,600 km", cost: "₹24,80,000", region: "Oak St", status: "In Shop" },
  { reg: "MH-04 BX 1765", name: "Eicher Skyline", model: "Pro 1049", type: "Truck", load: "4,000 kg", odo: "3,10,200 km", cost: "₹27,00,000", region: "Central", status: "Retired" },
  { reg: "MH-04 BX 4410", name: "Volvo B11R", model: "Multi-Axle", type: "Bus", load: "49 seats", odo: "76,120 km", cost: "₹1,05,00,000", region: "Terminal", status: "Available" },
];

const activity = [
  { reg: "MH-04 BX 2210", vehicle: "Tata Starbus", activity: "Trip completed — Central to Terminal", time: "12 Jul, 14:22", status: "On Time" },
  { reg: "MH-04 BX 3342", vehicle: "Tata Ultra T.7", activity: "Moved to maintenance bay", time: "12 Jul, 11:05", status: "In Progress" },
  { reg: "MH-04 BX 1187", vehicle: "Ashok Leyland Falcon", activity: "Dispatched — Fairview to Oak St", time: "12 Jul, 09:40", status: "Dispatched" },
  { reg: "MH-04 BX 1765", vehicle: "Eicher Skyline Pro", activity: "Marked as retired", time: "10 Jul, 16:00", status: "Completed" },
];

const statusMeta = {
  Available: { cls: "badge-green" },
  "On Trip": { cls: "badge-blue" },
  "In Shop": { cls: "badge-amber" },
  Retired: { cls: "badge-red" },
};

const activityStatusClass = (s) => {
  const l = s.toLowerCase();
  if (l.includes("time") || l.includes("completed")) return "badge badge-green";
  if (l.includes("progress")) return "badge badge-amber";
  return "badge badge-blue";
};

const emptyForm = {
  reg: "", name: "", model: "", type: "Bus", load: "", odo: "", cost: "", region: "Central", status: "Available",
};

/* ---------------- component ---------------- */

export default function VehicleRegistry() {
  const [regQuery, setRegQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Status");
  const [region, setRegion] = useState("All Regions");
  const [sortBy, setSortBy] = useState("Name (A–Z)");

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) => {
      const matchesReg = v.reg.toLowerCase().includes(regQuery.toLowerCase());
      const matchesName = (v.name + " " + v.model).toLowerCase().includes(nameQuery.toLowerCase());
      const matchesType = type === "All Types" || v.type === type;
      const matchesStatus = status === "All Status" || v.status === status;
      const matchesRegion = region === "All Regions" || v.region === region;
      return matchesReg && matchesName && matchesType && matchesStatus && matchesRegion;
    });
    if (sortBy === "Name (A–Z)") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "Odometer (High–Low)") {
      list = [...list].sort((a, b) => parseInt(b.odo) - parseInt(a.odo));
    }
    return list;
  }, [regQuery, nameQuery, type, status, region, sortBy]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAddSubmit = (e) => {
    e.preventDefault();
    console.log("New vehicle:", form);
    setShowAddModal(false);
    setForm(emptyForm);
  };

  return (
    <div className="to-dash">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .to-dash *{ box-sizing:border-box; }
        .to-dash{
          font-family:'Inter',sans-serif; background:#F4F6FA; color:#1C2431;
          width:100%; height:100vh; display:flex; overflow:hidden;
        }

        /* ---------- SIDEBAR (shared shell) ---------- */
        .to-sidebar{
          width:240px; flex-shrink:0; height:100vh;
          background:linear-gradient(180deg,#0B1526 0%,#101F38 100%);
          color:#E8ECF3; display:flex; flex-direction:column; padding:22px 16px;
        }
        .to-sidebar-logo{
          display:flex; align-items:center; gap:9px;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px;
          padding:0 8px; margin-bottom:30px;
        }
        .to-sidebar-logo i{ width:9px;height:9px;border-radius:50%;background:#F5A623; box-shadow:0 0 0 4px rgba(245,166,35,.18); }
        .to-nav{ display:flex; flex-direction:column; gap:2px; flex:1; }
        .to-nav-item{
          display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:8px;
          font-size:13.5px; font-weight:500; color:#9AA6BA; cursor:pointer;
          border-left:2px solid transparent; transition:.15s background, .15s color;
        }
        .to-nav-item:hover{ background:rgba(255,255,255,.05); color:#E8ECF3; }
        .to-nav-item.active{ background:rgba(245,166,35,.10); color:#F5A623; border-left:2px solid #F5A623; }
        .to-sidebar-footer{ display:flex; flex-direction:column; gap:2px; }
        .to-live-badge{
          display:inline-flex; align-items:center; gap:8px;
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.1em;
          color:#3DDC97; background:rgba(61,220,151,.08);
          border:1px solid rgba(61,220,151,.3); padding:7px 11px; border-radius:8px; margin-bottom:12px;
        }
        .to-live-dot{ width:6px;height:6px;border-radius:50%;background:#3DDC97; animation:to-pulse 1.8s infinite; }
        @keyframes to-pulse{
          0%{ box-shadow:0 0 0 0 rgba(61,220,151,.55); }
          70%{ box-shadow:0 0 0 7px rgba(61,220,151,0); }
          100%{ box-shadow:0 0 0 0 rgba(61,220,151,0); }
        }
        .to-nav-item.logout{ color:#8291A8; }
        .to-nav-item.logout:hover{ color:#E5594D; background:rgba(229,89,77,.08); }

        /* ---------- MAIN ---------- */
        .to-main{ flex:1; display:flex; flex-direction:column; min-width:0; height:100vh; }
        .to-topbar{
          display:flex; align-items:center; justify-content:space-between; gap:24px;
          padding:14px 28px; background:#fff; border-bottom:1px solid #E7EAF0; flex-shrink:0;
        }
        .to-search-top{
          flex:1; max-width:420px; display:flex; align-items:center; gap:10px;
          background:#F4F6FA; border:1px solid #E7EAF0; border-radius:10px; padding:0 14px; height:38px;
        }
        .to-search-top input{ background:transparent; border:none; outline:none; color:#1C2431; font-size:13.5px; width:100%; }
        .to-search-top input::placeholder{ color:#9AA3B2; }
        .to-search-top svg{ color:#8291A8; flex-shrink:0; }
        .to-nav-right{ display:flex; align-items:center; gap:18px; }
        .to-bell{ position:relative; color:#5A6478; cursor:pointer; }
        .to-bell-dot{ position:absolute; top:-3px; right:-3px; width:8px;height:8px;border-radius:50%; background:#F5A623; border:2px solid #fff; }
        .to-top-divider{ width:1px; height:26px; background:#E7EAF0; }
        .to-profile{ display:flex; align-items:center; gap:10px; }
        .to-avatar{
          width:34px;height:34px;border-radius:50%; background:linear-gradient(135deg,#F5A623,#E0941C);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; color:#181008;
        }
        .to-profile-name{ font-size:13.5px; font-weight:600; line-height:1.2; color:#1C2431; }
        .to-role-tag{ font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.06em; color:#1FA871; margin-top:2px; }

        .to-content{ flex:1; overflow-y:auto; padding:26px 28px 40px; }

        /* ---------- PAGE HEADER ---------- */
        .to-header{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; flex-wrap:wrap; gap:14px; }
        .to-header h1{ font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:600; color:#101F38; }
        .to-header p{ color:#8291A8; font-size:13.5px; margin-top:5px; }
        .to-add-btn{
          display:flex; align-items:center; gap:8px;
          background:#F5A623; color:#181008; border:none; border-radius:10px;
          padding:0 18px; height:42px; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px;
          cursor:pointer; transition:.2s background, .2s transform;
        }
        .to-add-btn:hover{ background:#E0941C; transform:translateY(-1px); }

        /* ---------- SEARCH ROW ---------- */
        .to-search-row{ display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
        .to-search-box{
          flex:1; min-width:220px; display:flex; align-items:center; gap:10px;
          background:#fff; border:1px solid #E7EAF0; border-radius:10px; padding:0 14px; height:44px;
        }
        .to-search-box svg{ color:#8291A8; flex-shrink:0; }
        .to-search-box input{ border:none; outline:none; background:transparent; font-size:13.5px; width:100%; color:#1C2431; }
        .to-search-box input::placeholder{ color:#9AA3B2; }

        /* ---------- FILTERS ---------- */
        .to-filters{ display:flex; gap:12px; flex-wrap:wrap; background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:14px; margin-bottom:22px; }
        .to-filter{ display:flex; flex-direction:column; gap:5px; min-width:150px; }
        .to-filter label{ font-size:11px; font-weight:600; color:#5A6478; letter-spacing:.02em; }
        .to-filter-select{ position:relative; display:flex; align-items:center; }
        .to-filter select{
          width:100%; height:40px; appearance:none; cursor:pointer;
          border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE; padding:0 30px 0 12px; font-size:13px; color:#1C2431;
        }
        .to-filter select:focus{ outline:none; border-color:#F5A623; }
        .to-filter-select svg{ position:absolute; right:10px; pointer-events:none; color:#8291A8; }

        /* ---------- SUMMARY CARDS ---------- */
        .to-kpi-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:24px; }
        .to-kpi-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px; }
        .to-kpi-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .to-kpi-icon{ width:34px;height:34px;border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .to-kpi-icon.slate{ background:rgba(59,81,117,.10); color:#3B5175; }
        .to-kpi-icon.green{ background:rgba(61,220,151,.12); color:#1FA871; }
        .to-kpi-icon.blue{ background:rgba(76,130,247,.12); color:#3E6FE0; }
        .to-kpi-icon.amber{ background:#FEF4E4; color:#E0941C; }
        .to-kpi-icon.red{ background:#FDECEA; color:#E5594D; }
        .to-kpi-value{ font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:#101F38; }
        .to-kpi-label{ font-size:12.5px; color:#8291A8; margin-top:4px; }

        /* ---------- VEHICLE GRID ---------- */
        .to-vehicle-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:16px; margin-bottom:26px; }
        .to-vehicle-card{
          background:#fff; border:1px solid #E7EAF0; border-radius:14px; overflow:hidden;
          display:flex; flex-direction:column; transition:.2s box-shadow, .2s border-color;
        }
        .to-vehicle-card:hover{ box-shadow:0 12px 28px rgba(16,31,56,.08); border-color:#DCE1EA; }
        .to-vehicle-image{
          height:130px; position:relative;
          background:linear-gradient(155deg,#0B1526 0%,#101F38 100%);
          display:flex; align-items:center; justify-content:center;
        }
        .to-vehicle-image svg{ color:rgba(245,166,35,.85); }
        .to-vehicle-image .badge{ position:absolute; top:10px; right:10px; }
        .to-vehicle-body{ padding:16px; display:flex; flex-direction:column; gap:10px; flex:1; }
        .to-vehicle-name{ font-family:'Space Grotesk',sans-serif; font-size:15.5px; font-weight:600; color:#101F38; }
        .to-vehicle-reg{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:#8291A8; margin-top:2px; }
        .to-vehicle-meta{ display:grid; grid-template-columns:1fr 1fr; gap:8px 12px; margin-top:4px; }
        .to-meta-item{ display:flex; align-items:center; gap:6px; font-size:12px; color:#5A6478; }
        .to-meta-item svg{ color:#AEB6C3; flex-shrink:0; }
        .to-vehicle-footer{ display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid #F1F3F7; }
        .to-icon-btn{
          width:32px;height:32px; border-radius:8px; border:1px solid #E2E6ED; background:#fff;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5A6478;
          transition:.15s border-color, .15s color, .15s background;
        }
        .to-icon-btn:hover{ border-color:#F5A623; color:#E0941C; background:#FFFBF3; }
        .to-icon-btn.danger:hover{ border-color:#E5594D; color:#E5594D; background:#FDECEA; }
        .to-vehicle-actions{ display:flex; gap:8px; }

        .badge{
          display:inline-flex; align-items:center; gap:5px;
          font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:600;
          letter-spacing:.03em; padding:4px 9px; border-radius:6px;
        }
        .badge-green{ background:rgba(61,220,151,.14); color:#1FA871; }
        .badge-blue{ background:rgba(76,130,247,.14); color:#3E6FE0; }
        .badge-amber{ background:rgba(245,166,35,.16); color:#B9760F; }
        .badge-red{ background:rgba(229,89,77,.14); color:#C4392E; }

        /* ---------- SECTION CARD / TABLE ---------- */
        .to-section-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:20px; margin-bottom:20px; }
        .to-section-title{ font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:#101F38; margin-bottom:16px; }
        .to-table{ width:100%; border-collapse:collapse; font-size:13px; }
        .to-table th{
          text-align:left; padding:10px 12px; font-size:11px; letter-spacing:.04em; color:#8291A8;
          font-weight:600; border-bottom:1px solid #ECEFF3; text-transform:uppercase;
        }
        .to-table td{ padding:12px; border-bottom:1px solid #F1F3F7; color:#1C2431; }
        .to-table tr:last-child td{ border-bottom:none; }
        .to-mono{ font-family:'JetBrains Mono',monospace; font-size:12.5px; color:#5A6478; }

        /* ---------- EMPTY STATE ---------- */
        .to-empty{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; text-align:center; }
        .to-empty h3{ font-family:'Space Grotesk',sans-serif; font-size:17px; color:#101F38; margin:18px 0 6px; }
        .to-empty p{ color:#8291A8; font-size:13px; margin-bottom:18px; max-width:320px; }

        /* ---------- MODAL ---------- */
        .to-modal-overlay{
          position:fixed; inset:0; background:rgba(11,21,38,.55); backdrop-filter:blur(2px);
          display:flex; align-items:center; justify-content:center; z-index:100; padding:20px;
        }
        .to-modal{
          background:#fff; border-radius:14px; width:100%; max-width:560px;
          max-height:88vh; overflow-y:auto; box-shadow:0 30px 60px rgba(10,20,35,.3);
        }
        .to-modal-header{
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 22px; border-bottom:1px solid #ECEFF3; position:sticky; top:0; background:#fff; z-index:1;
        }
        .to-modal-header h2{ font-family:'Space Grotesk',sans-serif; font-size:17px; color:#101F38; }
        .to-modal-close{ width:30px;height:30px;border-radius:8px; border:none; background:#F4F6FA; color:#5A6478; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .to-modal-close:hover{ background:#ECEFF3; }
        .to-modal-body{ padding:22px; }

        .to-dropzone{
          border:1.5px dashed #D6DCE5; border-radius:10px; padding:22px; text-align:center;
          color:#8291A8; font-size:12.5px; cursor:pointer; margin-bottom:18px; transition:.15s border-color;
        }
        .to-dropzone:hover{ border-color:#F5A623; color:#E0941C; }

        .to-form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .to-field{ display:flex; flex-direction:column; gap:6px; }
        .to-field.full{ grid-column:1 / -1; }
        .to-field label{ font-size:12px; font-weight:600; color:#5A6478; }
        .to-field input, .to-field select{
          height:44px; border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 12px; font-size:13.5px; color:#1C2431;
        }
        .to-field input:focus, .to-field select:focus{ outline:none; border-color:#F5A623; background:#fff; }

        .to-modal-footer{ display:flex; justify-content:flex-end; gap:10px; margin-top:22px; }
        .to-btn-secondary{
          height:42px; padding:0 18px; border-radius:10px; border:1px solid #E2E6ED; background:#fff;
          font-size:13.5px; font-weight:600; color:#5A6478; cursor:pointer;
        }
        .to-btn-secondary:hover{ background:#F4F6FA; }
        .to-btn-primary{
          height:42px; padding:0 20px; border-radius:10px; border:none; background:#F5A623;
          font-size:13.5px; font-weight:700; color:#181008; cursor:pointer; font-family:'Space Grotesk',sans-serif;
        }
        .to-btn-primary:hover{ background:#E0941C; }

        /* ---------- DETAILS MODAL ---------- */
        .to-details-image{
          height:200px; border-radius:10px; margin-bottom:18px;
          background:linear-gradient(155deg,#0B1526 0%,#101F38 100%);
          display:flex; align-items:center; justify-content:center;
        }
        .to-details-image svg{ color:rgba(245,166,35,.85); }
        .to-details-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px 20px; margin-bottom:18px; }
        .to-details-item .lbl{ font-size:11px; color:#8291A8; text-transform:uppercase; letter-spacing:.04em; margin-bottom:3px; }
        .to-details-item .val{ font-size:14px; color:#1C2431; font-weight:600; }
        .to-details-item .val.mono{ font-family:'JetBrains Mono',monospace; font-weight:500; }
        .to-details-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; background:#F7F8FA; border-radius:10px; padding:16px; }
        .to-details-stats .stat .val{ font-family:'Space Grotesk',sans-serif; font-size:17px; font-weight:700; color:#101F38; }
        .to-details-stats .stat .lbl{ font-size:11px; color:#8291A8; margin-top:4px; }

        @media (max-width: 1000px){ .to-form-grid, .to-details-grid{ grid-template-columns:1fr; } }
        @media (max-width: 860px){
          .to-sidebar{ width:76px; padding:22px 10px; }
          .to-sidebar-logo span, .to-nav-item span, .to-live-badge span{ display:none; }
          .to-nav-item{ justify-content:center; }
          .to-search-top{ display:none; }
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
          <div className="to-nav-item"><Settings size={17} /> <span>Settings</span></div>
          <div className="to-nav-item logout"><LogOut size={17} /> <span>Log Out</span></div>
        </div>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="to-main">
        <div className="to-topbar">
          <div className="to-search-top">
            <Search size={15} />
            <input placeholder="Search vehicles, drivers, trip IDs…" />
          </div>
          <div className="to-nav-right">
            <div className="to-bell"><Bell size={19} /><span className="to-bell-dot" /></div>
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
          {/* ---------- PAGE HEADER ---------- */}
          <div className="to-header">
            <div>
              <h1>Vehicle Registry</h1>
              <p>Manage and monitor all fleet vehicles.</p>
            </div>
            <button className="to-add-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Vehicle
            </button>
          </div>

          {/* ---------- SEARCH ---------- */}
          <div className="to-search-row">
            <div className="to-search-box">
              <Search size={15} />
              <input
                placeholder="Search by registration number…"
                value={regQuery}
                onChange={(e) => setRegQuery(e.target.value)}
              />
            </div>
            <div className="to-search-box">
              <Search size={15} />
              <input
                placeholder="Search by vehicle name or model…"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
              />
            </div>
          </div>

          {/* ---------- FILTERS ---------- */}
          <div className="to-filters">
            <div className="to-filter">
              <label>Vehicle Type</label>
              <div className="to-filter-select">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option>All Types</option><option>Bus</option><option>Mini Bus</option>
                  <option>Van</option><option>Truck</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="to-filter">
              <label>Vehicle Status</label>
              <div className="to-filter-select">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option>All Status</option><option>Available</option><option>On Trip</option>
                  <option>In Shop</option><option>Retired</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="to-filter">
              <label>Region</label>
              <div className="to-filter-select">
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>All Regions</option><option>Central</option><option>Fairview</option>
                  <option>Oak St</option><option>Terminal</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="to-filter">
              <label>Sort By</label>
              <div className="to-filter-select">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option>Name (A–Z)</option>
                  <option>Odometer (High–Low)</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* ---------- FLEET SUMMARY ---------- */}
          <div className="to-kpi-grid">
            {summary.map((s) => (
              <div className="to-kpi-card" key={s.label}>
                <div className="to-kpi-top">
                  <div className={`to-kpi-icon ${s.tone}`}><s.icon size={17} /></div>
                </div>
                <div className="to-kpi-value">{s.value}</div>
                <div className="to-kpi-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ---------- VEHICLE GRID ---------- */}
          {filtered.length > 0 ? (
            <div className="to-vehicle-grid">
              {filtered.map((v) => (
                <div className="to-vehicle-card" key={v.reg}>
                  <div className="to-vehicle-image">
                    <Truck size={40} strokeWidth={1.4} />
                    <span className={`badge ${statusMeta[v.status].cls}`}>{v.status}</span>
                  </div>
                  <div className="to-vehicle-body">
                    <div>
                      <div className="to-vehicle-name">{v.name} {v.model}</div>
                      <div className="to-vehicle-reg">{v.reg}</div>
                    </div>
                    <div className="to-vehicle-meta">
                      <div className="to-meta-item"><Car size={13} /> {v.type}</div>
                      <div className="to-meta-item"><MapPinned size={13} /> {v.region}</div>
                      <div className="to-meta-item"><Weight size={13} /> {v.load}</div>
                      <div className="to-meta-item"><Gauge size={13} /> {v.odo}</div>
                      <div className="to-meta-item" style={{ gridColumn: "1 / -1" }}>
                        <IndianRupee size={13} /> {v.cost}
                      </div>
                    </div>
                  </div>
                  <div className="to-vehicle-footer">
                    <button className="to-icon-btn" onClick={() => setSelectedVehicle(v)} title="View">
                      <Eye size={15} />
                    </button>
                    <div className="to-vehicle-actions">
                      <button className="to-icon-btn" title="Edit"><Pencil size={15} /></button>
                      <button className="to-icon-btn danger" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="to-section-card">
              <div className="to-empty">
                <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
                  <path d="M10,70 C 35,70 35,35 60,35 S 95,70 110,70" stroke="#DCE1EA" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 10" fill="none" />
                  <circle cx="10" cy="70" r="5" fill="#EDF0F5" stroke="#C7CFDC" strokeWidth="2" />
                  <circle cx="110" cy="70" r="5" fill="#EDF0F5" stroke="#C7CFDC" strokeWidth="2" />
                  <circle cx="60" cy="35" r="16" fill="#F4F6FA" stroke="#DCE1EA" strokeWidth="2" />
                </svg>
                <h3>No Vehicles Found</h3>
                <p>No vehicles match your current search and filters. Try clearing them, or add a new vehicle to the registry.</p>
                <button className="to-add-btn" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} /> Add Vehicle
                </button>
              </div>
            </div>
          )}

          {/* ---------- RECENT ACTIVITY ---------- */}
          <div className="to-section-card">
            <div className="to-section-title">Recent Vehicle Activity</div>
            <table className="to-table">
              <thead>
                <tr><th>Registration Number</th><th>Vehicle</th><th>Activity</th><th>Date &amp; Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i}>
                    <td className="to-mono">{a.reg}</td>
                    <td>{a.vehicle}</td>
                    <td>{a.activity}</td>
                    <td className="to-mono">{a.time}</td>
                    <td><span className={activityStatusClass(a.status)}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------- ADD VEHICLE MODAL ---------- */}
      {showAddModal && (
        <div className="to-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="to-modal" onClick={(e) => e.stopPropagation()}>
            <div className="to-modal-header">
              <h2>Add Vehicle</h2>
              <button className="to-modal-close" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <div className="to-modal-body">
              <div className="to-dropzone">Drop a vehicle image here, or click to upload</div>
              <form onSubmit={handleAddSubmit}>
                <div className="to-form-grid">
                  <div className="to-field">
                    <label>Registration Number</label>
                    <input name="reg" placeholder="MH-04 BX 5521" value={form.reg} onChange={handleFormChange} required />
                  </div>
                  <div className="to-field">
                    <label>Vehicle Name</label>
                    <input name="name" placeholder="Tata Starbus" value={form.name} onChange={handleFormChange} required />
                  </div>
                  <div className="to-field">
                    <label>Vehicle Model</label>
                    <input name="model" placeholder="Ultra 12m" value={form.model} onChange={handleFormChange} required />
                  </div>
                  <div className="to-field">
                    <label>Vehicle Type</label>
                    <select name="type" value={form.type} onChange={handleFormChange}>
                      <option>Bus</option><option>Mini Bus</option><option>Van</option><option>Truck</option>
                    </select>
                  </div>
                  <div className="to-field">
                    <label>Maximum Load Capacity</label>
                    <input name="load" placeholder="45 seats / 3,500 kg" value={form.load} onChange={handleFormChange} />
                  </div>
                  <div className="to-field">
                    <label>Current Odometer</label>
                    <input name="odo" placeholder="0 km" value={form.odo} onChange={handleFormChange} />
                  </div>
                  <div className="to-field">
                    <label>Acquisition Cost</label>
                    <input name="cost" placeholder="₹0" value={form.cost} onChange={handleFormChange} />
                  </div>
                  <div className="to-field">
                    <label>Region</label>
                    <select name="region" value={form.region} onChange={handleFormChange}>
                      <option>Central</option><option>Fairview</option><option>Oak St</option><option>Terminal</option>
                    </select>
                  </div>
                  <div className="to-field full">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleFormChange}>
                      <option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
                    </select>
                  </div>
                </div>
                <div className="to-modal-footer">
                  <button type="button" className="to-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="to-btn-primary">Save Vehicle</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- VEHICLE DETAILS MODAL ---------- */}
      {selectedVehicle && (
        <div className="to-modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="to-modal" onClick={(e) => e.stopPropagation()}>
            <div className="to-modal-header">
              <h2>{selectedVehicle.name} {selectedVehicle.model}</h2>
              <button className="to-modal-close" onClick={() => setSelectedVehicle(null)}><X size={16} /></button>
            </div>
            <div className="to-modal-body">
              <div className="to-details-image"><Truck size={56} strokeWidth={1.3} /></div>

              <div className="to-details-grid">
                <div className="to-details-item"><div className="lbl">Registration Number</div><div className="val mono">{selectedVehicle.reg}</div></div>
                <div className="to-details-item"><div className="lbl">Status</div><div className="val"><span className={`badge ${statusMeta[selectedVehicle.status].cls}`}>{selectedVehicle.status}</span></div></div>
                <div className="to-details-item"><div className="lbl">Vehicle Type</div><div className="val">{selectedVehicle.type}</div></div>
                <div className="to-details-item"><div className="lbl">Region</div><div className="val">{selectedVehicle.region}</div></div>
                <div className="to-details-item"><div className="lbl">Max Load Capacity</div><div className="val">{selectedVehicle.load}</div></div>
                <div className="to-details-item"><div className="lbl">Current Odometer</div><div className="val mono">{selectedVehicle.odo}</div></div>
                <div className="to-details-item"><div className="lbl">Acquisition Cost</div><div className="val mono">{selectedVehicle.cost}</div></div>
                <div className="to-details-item"><div className="lbl">Assigned Driver</div><div className="val">Arjun Patel</div></div>
                <div className="to-details-item"><div className="lbl">Current Trip</div><div className="val">{selectedVehicle.status === "On Trip" ? "TRP-3391 · Central → Terminal" : "—"}</div></div>
                <div className="to-details-item"><div className="lbl">Last Maintenance Date</div><div className="val mono">28 Jun 2026</div></div>
              </div>

              <div className="to-details-stats">
                <div className="stat"><div className="val">142</div><div className="lbl">TOTAL TRIPS</div></div>
                <div className="stat"><div className="val">₹86,200</div><div className="lbl">TOTAL FUEL COST</div></div>
                <div className="stat"><div className="val">₹24,600</div><div className="lbl">TOTAL MAINTENANCE COST</div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
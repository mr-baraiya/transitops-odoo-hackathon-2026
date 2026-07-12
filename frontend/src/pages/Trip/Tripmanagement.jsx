import React, { useState, useMemo } from "react";
import {
  Search, Bell, ChevronDown, Truck, Users, Wrench, MapPin, Fuel, Plus,
  LayoutDashboard, Settings, FileBarChart, LogOut, Eye, Pencil, X,
  Send, CheckCircle2, XCircle, Route, Clock, Package, Navigation,
  Circle, CheckCircle, PauseCircle, FileText,
} from "lucide-react";

/* ---------------- mock data ---------------- */

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Vehicles", icon: Truck },
  { label: "Drivers", icon: Users },
  { label: "Trips", icon: MapPin, active: true },
  { label: "Maintenance", icon: Wrench },
  { label: "Fuel Logs", icon: Fuel },
  { label: "Reports", icon: FileBarChart },
];

const summaryCards = [
  { label: "Total Trips", value: "312", icon: Route },
  { label: "Draft", value: "9", icon: FileText, tone: "slate" },
  { label: "Active", value: "41", icon: Navigation, tone: "blue" },
  { label: "Completed", value: "248", icon: CheckCircle2, tone: "green" },
  { label: "Cancelled", value: "14", icon: XCircle, tone: "red" },
  { label: "Total Distance Covered", value: "18,420 km", icon: MapPin, tone: "amber" },
];

const liveStatus = [
  { label: "Active Trips", value: "41", icon: Navigation },
  { label: "Vehicles On Trip", value: "38", icon: Truck },
  { label: "Drivers On Trip", value: "41", icon: Users },
  { label: "Waiting for Dispatch", value: "9", icon: PauseCircle },
];

const availableVehicles = ["MH-04 BX 1120", "MH-04 BX 4488", "MH-04 BX 2760", "MH-04 BX 3392"];
const availableDrivers = ["Priya Nair", "Arjun Patel", "Ishita Rao", "Devika Kulkarni"];

const trips = [
  {
    id: "TRP-3391", vehicle: "MH-04 BX 2210", driver: "Arjun Patel", source: "Central", dest: "Terminal",
    cargo: "1.8 t", distance: "14 km", departure: "12 Jul, 14:22", eta: "12 Jul, 14:55", status: "Dispatched",
  },
  {
    id: "TRP-3390", vehicle: "MH-04 BX 1187", driver: "Sara Khan", source: "Fairview", dest: "Oak St",
    cargo: "2.4 t", distance: "9 km", departure: "12 Jul, 13:40", eta: "12 Jul, 14:05", status: "Dispatched",
  },
  {
    id: "TRP-3389", vehicle: "MH-04 BX 0925", driver: "Ravi Shah", source: "Terminal", dest: "Central",
    cargo: "0.9 t", distance: "14 km", departure: "12 Jul, 12:10", eta: "12 Jul, 12:45", status: "Completed",
  },
  {
    id: "TRP-3388", vehicle: "MH-04 BX 3342", driver: "Neha Verma", source: "Oak St", dest: "Fairview",
    cargo: "3.1 t", distance: "9 km", departure: "13 Jul, 08:00", eta: "13 Jul, 08:25", status: "Draft",
  },
  {
    id: "TRP-3387", vehicle: "MH-04 BX 1765", driver: "Karan Mehta", source: "Central", dest: "Fairview",
    cargo: "1.2 t", distance: "11 km", departure: "11 Jul, 09:40", eta: "11 Jul, 10:10", status: "Cancelled",
  },
  {
    id: "TRP-3386", vehicle: "MH-04 BX 4410", driver: "Ishita Rao", source: "Fairview", dest: "Terminal",
    cargo: "2.0 t", distance: "17 km", departure: "12 Jul, 10:15", eta: "12 Jul, 10:58", status: "Completed",
  },
  {
    id: "TRP-3385", vehicle: "MH-04 BX 1120", driver: "Priya Nair", source: "Terminal", dest: "Oak St",
    cargo: "1.5 t", distance: "12 km", departure: "13 Jul, 07:30", eta: "13 Jul, 08:02", status: "Draft",
  },
];

const recentActivity = [
  { id: "TRP-3391", vehicle: "MH-04 BX 2210", driver: "Arjun Patel", activity: "Trip dispatched", time: "Today, 14:22" },
  { id: "TRP-3389", vehicle: "MH-04 BX 0925", driver: "Ravi Shah", activity: "Trip completed", time: "Today, 12:45" },
  { id: "TRP-3387", vehicle: "MH-04 BX 1765", driver: "Karan Mehta", activity: "Trip cancelled — driver suspended", time: "Yesterday, 09:52" },
  { id: "TRP-3386", vehicle: "MH-04 BX 4410", driver: "Ishita Rao", activity: "Trip completed", time: "Today, 10:58" },
  { id: "TRP-3388", vehicle: "MH-04 BX 3342", driver: "Neha Verma", activity: "Draft trip created", time: "Today, 08:41" },
];

const statusMeta = {
  Draft: { badge: "badge-slate", dot: "#5A6478", step: 0 },
  Dispatched: { badge: "badge-blue", dot: "#4C8DFF", step: 1 },
  "In Progress": { badge: "badge-blue", dot: "#4C8DFF", step: 2 },
  Completed: { badge: "badge-green", dot: "#3DDC97", step: 3 },
  Cancelled: { badge: "badge-red", dot: "#E5594D", step: -1 },
};

const timelineSteps = ["Draft", "Dispatched", "In Progress", "Completed"];

const emptyStr = (v) => v.trim().length === 0;

/* ---------------- component ---------------- */

export default function TripManagement() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("All Types");
  const [driverFilter, setDriverFilter] = useState("All Drivers");
  const [region, setRegion] = useState("All Regions");
  const [dateRange, setDateRange] = useState("This Week");
  const [showCreate, setShowCreate] = useState(false);
  const [viewTrip, setViewTrip] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [tripList, setTripList] = useState(trips);
  const [form, setForm] = useState({
    source: "", dest: "", vehicle: "", driver: "", cargo: "", distance: "",
    departure: "", eta: "", notes: "",
  });

  const nextId = `TRP-${3392 + tripList.filter((t) => t.id.startsWith("TRP-339")).length}`;

  const filtered = useMemo(() => {
    return tripList.filter((t) => {
      const q = query.toLowerCase();
      const matchesQuery =
        emptyStr(query) ||
        t.id.toLowerCase().includes(q) ||
        t.vehicle.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.dest.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All Status" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [tripList, query, statusFilter]);

  const setTripStatus = (id, status) => {
    setTripList((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handleCancel = () => {
    setTripStatus(cancelTarget.id, "Cancelled");
    setCancelTarget(null);
  };

  const handleCreateTrip = (e) => {
    e.preventDefault();
    const newTrip = {
      id: nextId,
      vehicle: form.vehicle || availableVehicles[0],
      driver: form.driver || availableDrivers[0],
      source: form.source || "—",
      dest: form.dest || "—",
      cargo: form.cargo ? `${form.cargo} t` : "—",
      distance: form.distance ? `${form.distance} km` : "—",
      departure: form.departure || "—",
      eta: form.eta || "—",
      status: "Draft",
    };
    setTripList((prev) => [newTrip, ...prev]);
    setShowCreate(false);
    setForm({ source: "", dest: "", vehicle: "", driver: "", cargo: "", distance: "", departure: "", eta: "", notes: "" });
  };

  return (
    <div className="tp-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .tp-app *{ box-sizing:border-box; }
        .tp-app{
          font-family:'Inter',sans-serif;
          background:#F4F6FA;
          color:#1C2431;
          width:100%;
          height:100vh;
          display:flex;
          overflow:hidden;
        }

        /* ---------- SIDEBAR ---------- */
        .tp-sidebar{
          width:240px; flex-shrink:0; height:100vh;
          background:linear-gradient(180deg,#0B1526 0%,#101F38 100%);
          color:#E8ECF3;
          display:flex; flex-direction:column;
          padding:22px 16px;
        }
        .tp-sidebar-logo{
          display:flex; align-items:center; gap:9px;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px;
          padding:0 8px; margin-bottom:30px;
        }
        .tp-sidebar-logo i{
          width:9px;height:9px;border-radius:50%;background:#F5A623;
          box-shadow:0 0 0 4px rgba(245,166,35,.18);
        }
        .tp-nav{ display:flex; flex-direction:column; gap:2px; flex:1; }
        .tp-nav-item{
          display:flex; align-items:center; gap:11px;
          padding:10px 12px; border-radius:8px;
          font-size:13.5px; font-weight:500; color:#9AA6BA;
          cursor:pointer; border-left:2px solid transparent;
          transition:.15s background, .15s color;
        }
        .tp-nav-item:hover{ background:rgba(255,255,255,.05); color:#E8ECF3; }
        .tp-nav-item.active{
          background:rgba(245,166,35,.10); color:#F5A623;
          border-left:2px solid #F5A623;
        }
        .tp-nav-item svg{ flex-shrink:0; }

        .tp-sidebar-footer{ display:flex; flex-direction:column; gap:2px; }
        .tp-live-badge{
          display:inline-flex; align-items:center; gap:8px;
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.1em;
          color:#3DDC97; background:rgba(61,220,151,.08);
          border:1px solid rgba(61,220,151,.3); padding:7px 11px; border-radius:8px;
          margin-bottom:12px;
        }
        .tp-live-dot{
          width:6px;height:6px;border-radius:50%;background:#3DDC97;
          animation:tp-pulse 1.8s infinite;
        }
        @keyframes tp-pulse{
          0%{ box-shadow:0 0 0 0 rgba(61,220,151,.55); }
          70%{ box-shadow:0 0 0 7px rgba(61,220,151,0); }
          100%{ box-shadow:0 0 0 0 rgba(61,220,151,0); }
        }
        .tp-nav-item.logout{ color:#8291A8; }
        .tp-nav-item.logout:hover{ color:#E5594D; background:rgba(229,89,77,.08); }

        /* ---------- MAIN COLUMN ---------- */
        .tp-main{ flex:1; display:flex; flex-direction:column; min-width:0; height:100vh; }

        .tp-topbar{
          display:flex; align-items:center; justify-content:space-between;
          gap:24px; padding:14px 28px;
          background:#fff; border-bottom:1px solid #E7EAF0; flex-shrink:0;
        }
        .tp-search-top{
          flex:1; max-width:420px;
          display:flex; align-items:center; gap:10px;
          background:#F4F6FA; border:1px solid #E7EAF0; border-radius:10px;
          padding:0 14px; height:38px;
        }
        .tp-search-top input{
          background:transparent; border:none; outline:none;
          color:#1C2431; font-size:13.5px; width:100%;
        }
        .tp-search-top input::placeholder{ color:#9AA3B2; }
        .tp-search-top svg{ color:#8291A8; flex-shrink:0; }

        .tp-nav-right{ display:flex; align-items:center; gap:18px; }
        .tp-bell{ position:relative; color:#5A6478; cursor:pointer; }
        .tp-bell-dot{
          position:absolute; top:-3px; right:-3px;
          width:8px;height:8px;border-radius:50%;
          background:#F5A623; border:2px solid #fff;
        }
        .tp-top-divider{ width:1px; height:26px; background:#E7EAF0; }
        .tp-profile{ display:flex; align-items:center; gap:10px; }
        .tp-avatar{
          width:34px;height:34px;border-radius:50%;
          background:linear-gradient(135deg,#F5A623,#E0941C);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; color:#181008;
        }
        .tp-profile-name{ font-size:13.5px; font-weight:600; line-height:1.2; color:#1C2431; }
        .tp-role-tag{
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.06em;
          color:#1FA871; margin-top:2px;
        }

        .tp-content{ flex:1; overflow-y:auto; padding:26px 28px 40px; }

        .tp-header{
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:22px; flex-wrap:wrap; gap:14px;
        }
        .tp-header h1{
          font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:600; color:#101F38;
        }
        .tp-header p{ color:#8291A8; font-size:13.5px; margin-top:5px; }

        .tp-add-btn{
          display:inline-flex; align-items:center; gap:8px;
          background:#F5A623; color:#181008; border:none; border-radius:10px;
          padding:11px 18px; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600;
          cursor:pointer; transition:.15s background;
          white-space:nowrap;
        }
        .tp-add-btn:hover{ background:#E0941C; }

        /* ---------- SEARCH & FILTERS ---------- */
        .tp-searchbar{
          display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
          background:#fff; border:1px solid #E7EAF0; border-radius:12px;
          padding:14px; margin-bottom:14px;
        }
        .tp-search-field{
          display:flex; align-items:center; gap:9px;
          background:#FBFCFE; border:1px solid #E2E6ED; border-radius:8px;
          padding:0 12px; height:40px;
        }
        .tp-search-field svg{ color:#8291A8; flex-shrink:0; }
        .tp-search-field input{
          border:none; outline:none; background:transparent; width:100%;
          font-size:13px; color:#1C2431;
        }
        .tp-search-field input::placeholder{ color:#9AA3B2; }

        .tp-filters{
          display:flex; gap:12px; flex-wrap:wrap;
          background:#fff; border:1px solid #E7EAF0; border-radius:12px;
          padding:14px; margin-bottom:22px;
        }
        .tp-filter{ display:flex; flex-direction:column; gap:5px; min-width:160px; flex:1; }
        .tp-filter label{ font-size:11px; font-weight:600; color:#5A6478; letter-spacing:.02em; }
        .tp-filter-select{ position:relative; display:flex; align-items:center; }
        .tp-filter select{
          width:100%; height:40px; appearance:none; cursor:pointer;
          border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 30px 0 12px; font-size:13px; color:#1C2431;
        }
        .tp-filter select:focus{ outline:none; border-color:#F5A623; }
        .tp-filter-select svg{ position:absolute; right:10px; pointer-events:none; color:#8291A8; }

        /* ---------- KPI + LIVE STATUS ---------- */
        .tp-kpi-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
          gap:14px; margin-bottom:20px;
        }
        .tp-kpi-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px; }
        .tp-kpi-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .tp-kpi-icon{
          width:34px;height:34px;border-radius:8px; background:#EEF2FB; color:#3B5175;
          display:flex; align-items:center; justify-content:center;
        }
        .tp-kpi-icon.green{ background:rgba(61,220,151,.12); color:#1FA871; }
        .tp-kpi-icon.blue{ background:rgba(76,141,255,.12); color:#3568C4; }
        .tp-kpi-icon.amber{ background:#FEF4E4; color:#E0941C; }
        .tp-kpi-icon.red{ background:#FDECEA; color:#E5594D; }
        .tp-kpi-icon.slate{ background:rgba(59,81,117,.10); color:#5A6478; }
        .tp-kpi-value{ font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:#101F38; }
        .tp-kpi-label{ font-size:12.5px; color:#8291A8; margin-top:4px; }

        .tp-live-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
          gap:14px; margin-bottom:22px;
        }
        .tp-live-card{
          background:linear-gradient(160deg,#0B1526 0%,#101F38 100%);
          border-radius:12px; padding:16px; display:flex; align-items:center; gap:12px;
        }
        .tp-live-card-icon{
          width:38px; height:38px; border-radius:9px; background:rgba(245,166,35,.14); color:#F5A623;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .tp-live-card .val{ font-family:'Space Grotesk',sans-serif; font-size:19px; font-weight:700; color:#E8ECF3; }
        .tp-live-card .lbl{ font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.06em; color:#8291A8; text-transform:uppercase; margin-top:2px; }

        /* ---------- SECTION CARD ---------- */
        .tp-section-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:20px; margin-bottom:20px; }
        .tp-section-title{
          font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:#101F38;
          margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;
        }
        .tp-section-sub{ font-size:11.5px; color:#8291A8; font-weight:400; font-family:'Inter',sans-serif; }

        /* ---------- TABLE ---------- */
        .tp-table-wrap{ overflow-x:auto; }
        .tp-table{ width:100%; border-collapse:collapse; font-size:12.8px; min-width:1080px; }
        .tp-table th{
          text-align:left; padding:10px 12px; font-size:11px; letter-spacing:.04em;
          color:#8291A8; font-weight:600; border-bottom:1px solid #ECEFF3; text-transform:uppercase;
          white-space:nowrap;
        }
        .tp-table td{ padding:12px; border-bottom:1px solid #F1F3F7; color:#1C2431; white-space:nowrap; }
        .tp-table tr:last-child td{ border-bottom:none; }
        .tp-mono{ font-family:'JetBrains Mono',monospace; font-size:12.3px; color:#5A6478; }
        .tp-route-cell{ display:flex; align-items:center; gap:6px; }
        .tp-route-cell svg{ color:#8291A8; }

        .tp-actions-cell{ display:flex; gap:6px; }
        .tp-icon-btn{
          width:28px; height:28px; border-radius:7px; border:1px solid #E7EAF0; background:#FBFCFE;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5A6478;
          transition:.15s border-color, .15s color, .15s background; flex-shrink:0;
        }
        .tp-icon-btn:hover{ border-color:#F5A623; color:#E0941C; background:#FFFBF3; }
        .tp-icon-btn.green:hover{ border-color:#3DDC97; color:#1FA871; background:rgba(61,220,151,.08); }
        .tp-icon-btn.blue:hover{ border-color:#4C8DFF; color:#3568C4; background:rgba(76,141,255,.08); }
        .tp-icon-btn.danger:hover{ border-color:#E5594D; color:#E5594D; background:#FDECEA; }
        .tp-icon-btn:disabled{ opacity:.35; cursor:not-allowed; }
        .tp-icon-btn:disabled:hover{ border-color:#E7EAF0; color:#5A6478; background:#FBFCFE; }

        .badge{
          display:inline-flex; align-items:center; gap:5px;
          font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:600;
          letter-spacing:.03em; padding:4px 9px; border-radius:6px; white-space:nowrap;
        }
        .badge-green{ background:rgba(61,220,151,.12); color:#1FA871; }
        .badge-amber{ background:rgba(245,166,35,.12); color:#B9760F; }
        .badge-slate{ background:rgba(59,81,117,.10); color:#5A6478; }
        .badge-red{ background:rgba(229,89,77,.12); color:#C4392E; }
        .badge-blue{ background:rgba(76,141,255,.12); color:#3568C4; }
        .badge-dot{ width:6px; height:6px; border-radius:50%; }

        /* ---------- QUICK ACTIONS ---------- */
        .tp-actions-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
        .tp-action-btn{
          display:flex; flex-direction:column; align-items:flex-start; gap:10px;
          background:#FBFCFE; border:1px solid #E7EAF0; border-radius:10px;
          padding:14px; cursor:pointer; transition:.15s border-color, .15s background;
          font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:#1C2431;
        }
        .tp-action-btn:hover{ border-color:#F5A623; background:#FFFBF3; }
        .tp-action-btn .tp-action-icon{
          width:32px;height:32px;border-radius:8px; background:#101F38; color:#F5A623;
          display:flex; align-items:center; justify-content:center;
        }

        /* ---------- EMPTY STATE ---------- */
        .tp-empty{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:60px 20px; gap:14px;
        }
        .tp-empty h3{ font-family:'Space Grotesk',sans-serif; font-size:16px; color:#101F38; font-weight:600; }
        .tp-empty p{ font-size:13px; color:#8291A8; max-width:320px; }

        /* ---------- MODAL ---------- */
        .tp-modal-overlay{
          position:fixed; inset:0; background:rgba(11,21,38,.55);
          display:flex; align-items:center; justify-content:center; z-index:50; padding:24px;
        }
        .tp-modal{
          background:#fff; border-radius:16px; width:100%; max-width:560px;
          max-height:88vh; overflow-y:auto; box-shadow:0 20px 60px rgba(11,21,38,.35);
        }
        .tp-modal.wide{ max-width:660px; }
        .tp-modal-header{
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 22px; border-bottom:1px solid #ECEFF3; position:sticky; top:0; background:#fff; z-index:1;
        }
        .tp-modal-header h2{ font-family:'Space Grotesk',sans-serif; font-size:16.5px; font-weight:600; color:#101F38; }
        .tp-modal-close{
          width:30px; height:30px; border-radius:8px; border:1px solid #E7EAF0; background:#FBFCFE;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5A6478;
        }
        .tp-modal-close:hover{ border-color:#E5594D; color:#E5594D; }
        .tp-modal-body{ padding:22px; }

        .tp-form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .tp-form-field{ display:flex; flex-direction:column; gap:6px; }
        .tp-form-field.full{ grid-column:1 / -1; }
        .tp-form-field label{ font-size:11.5px; font-weight:600; color:#5A6478; }
        .tp-form-field input, .tp-form-field select, .tp-form-field textarea{
          height:40px; border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 12px; font-size:13px; color:#1C2431; font-family:'Inter',sans-serif;
        }
        .tp-form-field textarea{ height:70px; padding:10px 12px; resize:none; }
        .tp-form-field input:focus, .tp-form-field select:focus, .tp-form-field textarea:focus{
          outline:none; border-color:#F5A623;
        }
        .tp-form-field input:disabled{ color:#8291A8; background:#F1F3F7; }

        .tp-modal-footer{
          display:flex; justify-content:flex-end; gap:10px; margin-top:20px;
          padding-top:16px; border-top:1px solid #ECEFF3;
        }
        .tp-btn-secondary{
          height:40px; padding:0 16px; border-radius:9px; border:1px solid #E2E6ED; background:#fff;
          font-size:13px; font-weight:600; color:#5A6478; cursor:pointer;
        }
        .tp-btn-secondary:hover{ border-color:#C7CEDC; }
        .tp-btn-primary{
          height:40px; padding:0 18px; border-radius:9px; border:none; background:#F5A623;
          font-size:13px; font-weight:600; color:#181008; cursor:pointer;
        }
        .tp-btn-primary:hover{ background:#E0941C; }
        .tp-btn-danger{
          height:40px; padding:0 18px; border-radius:9px; border:none; background:#E5594D;
          font-size:13px; font-weight:600; color:#fff; cursor:pointer;
        }
        .tp-btn-danger:hover{ background:#C4392E; }

        /* ---------- VIEW MODAL ---------- */
        .tp-view-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; }
        .tp-view-stat{ background:#FBFCFE; border:1px solid #ECEFF3; border-radius:10px; padding:12px 14px; }
        .tp-view-stat .k{ font-size:11px; color:#8291A8; text-transform:uppercase; letter-spacing:.04em; }
        .tp-view-stat .v{ font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:700; color:#101F38; margin-top:4px; }

        .tp-view-list{ display:flex; flex-direction:column; gap:0; }
        .tp-view-row{ display:flex; justify-content:space-between; padding:9px 0; font-size:13px; border-bottom:1px solid #F1F3F7; }
        .tp-view-row:last-child{ border-bottom:none; }
        .tp-view-row .k{ color:#8291A8; }
        .tp-view-row .v{ color:#1C2431; font-weight:500; }

        .tp-route-line{ display:flex; align-items:center; gap:8px; font-family:'JetBrains Mono',monospace; font-size:13px; color:#101F38; margin-bottom:18px; }
        .tp-route-line b{ font-weight:600; }
        .tp-route-line .arrow{ color:#F5A623; }

        /* ---------- TIMELINE ---------- */
        .tp-timeline{ display:flex; align-items:center; margin-bottom:18px; }
        .tp-timeline-step{ display:flex; flex-direction:column; align-items:center; flex:1; position:relative; }
        .tp-timeline-dot{
          width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          background:#EEF1F5; color:#8291A8; border:2px solid #E2E6ED; z-index:1; flex-shrink:0;
        }
        .tp-timeline-dot.done{ background:#3DDC97; color:#fff; border-color:#3DDC97; }
        .tp-timeline-dot.current{ background:#F5A623; color:#181008; border-color:#F5A623; }
        .tp-timeline-dot.cancelled{ background:#E5594D; color:#fff; border-color:#E5594D; }
        .tp-timeline-label{ font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.04em; color:#5A6478; margin-top:6px; text-transform:uppercase; text-align:center; }
        .tp-timeline-line{ position:absolute; top:13px; left:50%; width:100%; height:2px; background:#E2E6ED; z-index:0; }
        .tp-timeline-line.done{ background:#3DDC97; }
        .tp-timeline-step:last-child .tp-timeline-line{ display:none; }

        @media (max-width: 1000px){
          .tp-searchbar{ grid-template-columns:1fr 1fr; }
          .tp-form-grid{ grid-template-columns:1fr; }
          .tp-view-grid{ grid-template-columns:1fr; }
        }
        @media (max-width: 860px){
          .tp-sidebar{ width:76px; padding:22px 10px; }
          .tp-sidebar-logo span, .tp-nav-item span, .tp-live-badge span{ display:none; }
          .tp-nav-item{ justify-content:center; }
          .tp-search-top{ display:none; }
          .tp-searchbar{ grid-template-columns:1fr; }
        }
      `}</style>

      {/* ---------- SIDEBAR ---------- */}
      <div className="tp-sidebar">
        <div className="tp-sidebar-logo"><i /> <span>TransitOps</span></div>

        <div className="tp-nav">
          {navItems.map((n) => (
            <div className={`tp-nav-item ${n.active ? "active" : ""}`} key={n.label}>
              <n.icon size={17} /> <span>{n.label}</span>
            </div>
          ))}
        </div>

        <div className="tp-sidebar-footer">
          <span className="tp-live-badge"><span className="tp-live-dot" /> <span>LIVE NETWORK</span></span>
          <div className="tp-nav-item">
            <Settings size={17} /> <span>Settings</span>
          </div>
          <div className="tp-nav-item logout">
            <LogOut size={17} /> <span>Log Out</span>
          </div>
        </div>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="tp-main">
        <div className="tp-topbar">
          <div className="tp-search-top">
            <Search size={15} />
            <input placeholder="Search vehicles, drivers, trip IDs…" />
          </div>

          <div className="tp-nav-right">
            <div className="tp-bell">
              <Bell size={19} />
              <span className="tp-bell-dot" />
            </div>
            <div className="tp-top-divider" />
            <div className="tp-profile">
              <div className="tp-avatar">RM</div>
              <div>
                <div className="tp-profile-name">Rhea Malhotra</div>
                <div className="tp-role-tag">FLEET MANAGER</div>
              </div>
            </div>
          </div>
        </div>

        <div className="tp-content">
          <div className="tp-header">
            <div>
              <h1>Trip Management</h1>
              <p>Create, dispatch, monitor, and complete transport trips.</p>
            </div>
            <button className="tp-add-btn" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create Trip
            </button>
          </div>

          {/* ---------- SEARCH ---------- */}
          <div className="tp-searchbar">
            <div className="tp-search-field">
              <Route size={15} />
              <input placeholder="Search by trip ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="tp-search-field">
              <Truck size={15} />
              <input placeholder="Search by vehicle…" />
            </div>
            <div className="tp-search-field">
              <Users size={15} />
              <input placeholder="Search by driver…" />
            </div>
            <div className="tp-search-field">
              <MapPin size={15} />
              <input placeholder="Search by source/destination…" />
            </div>
          </div>

          {/* ---------- FILTERS ---------- */}
          <div className="tp-filters">
            <div className="tp-filter">
              <label>Trip Status</label>
              <div className="tp-filter-select">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Status</option><option>Draft</option><option>Dispatched</option>
                  <option>Completed</option><option>Cancelled</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="tp-filter">
              <label>Vehicle Type</label>
              <div className="tp-filter-select">
                <select value={vehicleTypeFilter} onChange={(e) => setVehicleTypeFilter(e.target.value)}>
                  <option>All Types</option><option>Bus</option><option>Mini Bus</option>
                  <option>Van</option><option>Truck</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="tp-filter">
              <label>Driver</label>
              <div className="tp-filter-select">
                <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}>
                  <option>All Drivers</option>
                  {availableDrivers.map((d) => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="tp-filter">
              <label>Region</label>
              <div className="tp-filter-select">
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>All Regions</option><option>Central</option><option>Fairview</option>
                  <option>Oak Street</option><option>Terminal</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="tp-filter">
              <label>Date Range</label>
              <div className="tp-filter-select">
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option>Today</option><option>This Week</option><option>This Month</option><option>Custom Range</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* ---------- SUMMARY CARDS ---------- */}
          <div className="tp-kpi-grid">
            {summaryCards.map((k) => (
              <div className="tp-kpi-card" key={k.label}>
                <div className="tp-kpi-top">
                  <div className={`tp-kpi-icon ${k.tone || ""}`}><k.icon size={17} /></div>
                </div>
                <div className="tp-kpi-value">{k.value}</div>
                <div className="tp-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* ---------- LIVE TRIP STATUS ---------- */}
          <div className="tp-live-grid">
            {liveStatus.map((s) => (
              <div className="tp-live-card" key={s.label}>
                <div className="tp-live-card-icon"><s.icon size={18} /></div>
                <div>
                  <div className="val">{s.value}</div>
                  <div className="lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- TRIP LIST ---------- */}
          <div className="tp-section-card">
            <div className="tp-section-title">
              Trips
              <span className="tp-section-sub">{filtered.length} of {tripList.length} shown</span>
            </div>

            {filtered.length === 0 ? (
              <div className="tp-empty">
                <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
                  <path d="M15 65 Q40 30 60 65 T105 65" stroke="#E2E6ED" strokeWidth="3" fill="none" strokeDasharray="6 6" />
                  <circle cx="15" cy="65" r="5" fill="#C7CEDC" />
                  <circle cx="60" cy="65" r="5" fill="#C7CEDC" />
                  <circle cx="105" cy="65" r="5" fill="#F5A623" opacity="0.5" />
                  <rect x="44" y="20" width="32" height="22" rx="5" fill="#F4F6FA" stroke="#E2E6ED" />
                </svg>
                <h3>No Trips Found</h3>
                <p>Try adjusting your search or filters, or create a new trip to get started.</p>
                <button className="tp-add-btn" onClick={() => setShowCreate(true)}>
                  <Plus size={16} /> Create Trip
                </button>
              </div>
            ) : (
              <div className="tp-table-wrap">
                <table className="tp-table">
                  <thead>
                    <tr>
                      <th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Route</th>
                      <th>Cargo</th><th>Distance</th><th>Departure</th><th>ETA</th>
                      <th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => {
                      const meta = statusMeta[t.status];
                      return (
                        <tr key={t.id}>
                          <td className="tp-mono">{t.id}</td>
                          <td>{t.vehicle}</td>
                          <td>{t.driver}</td>
                          <td>
                            <span className="tp-route-cell">
                              {t.source} <Navigation size={11} style={{ transform: "rotate(90deg)" }} /> {t.dest}
                            </span>
                          </td>
                          <td>{t.cargo}</td>
                          <td className="tp-mono">{t.distance}</td>
                          <td className="tp-mono">{t.departure}</td>
                          <td className="tp-mono">{t.eta}</td>
                          <td>
                            <span className={`badge ${meta.badge}`}>
                              <span className="badge-dot" style={{ background: meta.dot }} /> {t.status}
                            </span>
                          </td>
                          <td>
                            <div className="tp-actions-cell">
                              <button className="tp-icon-btn" title="View" onClick={() => setViewTrip(t)}>
                                <Eye size={14} />
                              </button>
                              <button className="tp-icon-btn" title="Edit">
                                <Pencil size={14} />
                              </button>
                              <button
                                className="tp-icon-btn blue" title="Dispatch"
                                disabled={t.status !== "Draft"}
                                onClick={() => setTripStatus(t.id, "Dispatched")}
                              >
                                <Send size={14} />
                              </button>
                              <button
                                className="tp-icon-btn green" title="Complete"
                                disabled={t.status !== "Dispatched" && t.status !== "In Progress"}
                                onClick={() => setTripStatus(t.id, "Completed")}
                              >
                                <CheckCircle2 size={14} />
                              </button>
                              <button
                                className="tp-icon-btn danger" title="Cancel"
                                disabled={t.status === "Completed" || t.status === "Cancelled"}
                                onClick={() => setCancelTarget(t)}
                              >
                                <XCircle size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ---------- RECENT ACTIVITY ---------- */}
          <div className="tp-section-card">
            <div className="tp-section-title">Recent Trip Activity</div>
            <table className="tp-table" style={{ minWidth: "auto" }}>
              <thead>
                <tr>
                  <th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Activity</th><th>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((r, i) => (
                  <tr key={i}>
                    <td className="tp-mono">{r.id}</td>
                    <td className="tp-mono">{r.vehicle}</td>
                    <td>{r.driver}</td>
                    <td>{r.activity}</td>
                    <td className="tp-mono">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- QUICK ACTIONS ---------- */}
          <div className="tp-section-card">
            <div className="tp-section-title">Quick Actions</div>
            <div className="tp-actions-grid">
              <button className="tp-action-btn"><span className="tp-action-icon"><Send size={16} /></span>Dispatch Trip</button>
              <button className="tp-action-btn"><span className="tp-action-icon"><CheckCircle2 size={16} /></span>Complete Trip</button>
              <button className="tp-action-btn"><span className="tp-action-icon"><XCircle size={16} /></span>Cancel Trip</button>
              <button className="tp-action-btn"><span className="tp-action-icon"><Route size={16} /></span>View Route</button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- CREATE TRIP MODAL ---------- */}
      {showCreate && (
        <div className="tp-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="tp-modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h2>Create Trip</h2>
              <div className="tp-modal-close" onClick={() => setShowCreate(false)}><X size={16} /></div>
            </div>
            <div className="tp-modal-body">
              <form onSubmit={handleCreateTrip}>
                <div className="tp-form-grid">
                  <div className="tp-form-field">
                    <label>Trip ID (Auto Generated)</label>
                    <input value={nextId} disabled />
                  </div>
                  <div className="tp-form-field">
                    <label>Cargo Weight (tonnes)</label>
                    <input type="number" step="0.1" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="1.5" />
                  </div>

                  <div className="tp-form-field">
                    <label>Source</label>
                    <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. Central" required />
                  </div>
                  <div className="tp-form-field">
                    <label>Destination</label>
                    <input value={form.dest} onChange={(e) => setForm({ ...form, dest: e.target.value })} placeholder="e.g. Terminal" required />
                  </div>

                  <div className="tp-form-field">
                    <label>Available Vehicle</label>
                    <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
                      <option value="">Select a vehicle…</option>
                      {availableVehicles.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="tp-form-field">
                    <label>Available Driver</label>
                    <select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required>
                      <option value="">Select a driver…</option>
                      {availableDrivers.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="tp-form-field">
                    <label>Planned Distance (km)</label>
                    <input type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="14" />
                  </div>
                  <div className="tp-form-field" />

                  <div className="tp-form-field">
                    <label>Departure Date &amp; Time</label>
                    <input type="datetime-local" value={form.departure} onChange={(e) => setForm({ ...form, departure: e.target.value })} />
                  </div>
                  <div className="tp-form-field">
                    <label>Expected Arrival Time</label>
                    <input type="datetime-local" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
                  </div>

                  <div className="tp-form-field full">
                    <label>Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special handling instructions…" />
                  </div>
                </div>

                <div className="tp-modal-footer">
                  <button type="button" className="tp-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="tp-btn-primary">Create Trip</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- VIEW TRIP MODAL ---------- */}
      {viewTrip && (
        <div className="tp-modal-overlay" onClick={() => setViewTrip(null)}>
          <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h2>Trip Details</h2>
              <div className="tp-modal-close" onClick={() => setViewTrip(null)}><X size={16} /></div>
            </div>
            <div className="tp-modal-body">
              <div className="tp-route-line">
                <b>{viewTrip.source}</b> <span className="arrow">→</span> <b>{viewTrip.dest}</b>
                <span className={`badge ${statusMeta[viewTrip.status].badge}`} style={{ marginLeft: "auto" }}>
                  <span className="badge-dot" style={{ background: statusMeta[viewTrip.status].dot }} /> {viewTrip.status}
                </span>
              </div>

              {/* Timeline */}
              <div className="tp-timeline">
                {viewTrip.status === "Cancelled" ? (
                  <div className="tp-timeline-step">
                    <div className="tp-timeline-dot cancelled"><XCircle size={14} /></div>
                    <div className="tp-timeline-label">Cancelled</div>
                  </div>
                ) : (
                  timelineSteps.map((step, i) => {
                    const currentStep = statusMeta[viewTrip.status].step;
                    const done = i < currentStep;
                    const current = i === currentStep;
                    return (
                      <div className="tp-timeline-step" key={step}>
                        <div className={`tp-timeline-line ${done ? "done" : ""}`} />
                        <div className={`tp-timeline-dot ${done ? "done" : current ? "current" : ""}`}>
                          {done ? <CheckCircle size={14} /> : <Circle size={10} fill="currentColor" />}
                        </div>
                        <div className="tp-timeline-label">{step}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="tp-view-grid">
                <div className="tp-view-stat">
                  <div className="k">Assigned Vehicle</div>
                  <div className="v">{viewTrip.vehicle}</div>
                </div>
                <div className="tp-view-stat">
                  <div className="k">Assigned Driver</div>
                  <div className="v">{viewTrip.driver}</div>
                </div>
                <div className="tp-view-stat">
                  <div className="k">Cargo Weight</div>
                  <div className="v">{viewTrip.cargo}</div>
                </div>
                <div className="tp-view-stat">
                  <div className="k">Planned Distance</div>
                  <div className="v">{viewTrip.distance}</div>
                </div>
                <div className="tp-view-stat">
                  <div className="k">Actual Distance</div>
                  <div className="v">{viewTrip.status === "Completed" ? viewTrip.distance : "—"}</div>
                </div>
                <div className="tp-view-stat">
                  <div className="k">Fuel Consumed</div>
                  <div className="v">{viewTrip.status === "Completed" ? "3.2 L" : "—"}</div>
                </div>
              </div>

              <div className="tp-section-title" style={{ fontSize: 13, marginBottom: 8 }}>Trip Information</div>
              <div className="tp-view-list" style={{ marginBottom: 18 }}>
                <div className="tp-view-row"><span className="k">Departure Time</span><span className="v">{viewTrip.departure}</span></div>
                <div className="tp-view-row"><span className="k">Arrival Time (ETA)</span><span className="v">{viewTrip.eta}</span></div>
                <div className="tp-view-row"><span className="k">Current Status</span><span className="v">{viewTrip.status}</span></div>
              </div>

              <div className="tp-section-title" style={{ fontSize: 13, marginBottom: 8 }}>Timeline of Events</div>
              <div className="tp-view-list">
                <div className="tp-view-row"><span className="k">{viewTrip.departure}</span><span className="v">Trip created as draft</span></div>
                {statusMeta[viewTrip.status].step >= 1 && (
                  <div className="tp-view-row"><span className="k">{viewTrip.departure}</span><span className="v">Dispatched to {viewTrip.driver}</span></div>
                )}
                {viewTrip.status === "Completed" && (
                  <div className="tp-view-row"><span className="k">{viewTrip.eta}</span><span className="v">Trip marked complete</span></div>
                )}
                {viewTrip.status === "Cancelled" && (
                  <div className="tp-view-row"><span className="k">{viewTrip.departure}</span><span className="v">Trip cancelled</span></div>
                )}
              </div>

              <div className="tp-modal-footer">
                <button className="tp-btn-secondary" onClick={() => setViewTrip(null)}>Close</button>
                <button className="tp-btn-primary">Edit Trip</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- CANCEL CONFIRM MODAL ---------- */}
      {cancelTarget && (
        <div className="tp-modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="tp-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h2>Cancel Trip</h2>
              <div className="tp-modal-close" onClick={() => setCancelTarget(null)}><X size={16} /></div>
            </div>
            <div className="tp-modal-body">
              <p style={{ fontSize: 13.5, color: "#33394A", lineHeight: 1.6 }}>
                Are you sure you want to cancel <b>{cancelTarget.id}</b> ({cancelTarget.source} → {cancelTarget.dest})? This cannot be undone.
              </p>
              <div className="tp-modal-footer">
                <button className="tp-btn-secondary" onClick={() => setCancelTarget(null)}>Keep Trip</button>
                <button className="tp-btn-danger" onClick={handleCancel}>Cancel Trip</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
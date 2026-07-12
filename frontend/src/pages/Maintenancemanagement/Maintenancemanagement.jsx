import React, { useState, useMemo } from "react";
import {
  Search, Bell, ChevronDown, Truck, Users, Wrench, MapPin, Fuel, Plus,
  LayoutDashboard, Settings, FileBarChart, LogOut, Eye, Pencil, X,
  CheckCircle2, Clock, AlertTriangle, IndianRupee, ClipboardList,
  CircleDot, Circle, CheckCircle, Info, Package,
} from "lucide-react";

/* ---------------- mock data ---------------- */

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Vehicles", icon: Truck },
  { label: "Drivers", icon: Users },
  { label: "Trips", icon: MapPin },
  { label: "Maintenance", icon: Wrench, active: true },
  { label: "Fuel Logs", icon: Fuel },
  { label: "Reports", icon: FileBarChart },
];

const summaryCards = [
  { label: "Total Maintenance Records", value: "164", icon: ClipboardList },
  { label: "Vehicles In Shop", value: "8", icon: Wrench, tone: "red" },
  { label: "Scheduled Maintenance", value: "12", icon: Clock, tone: "amber" },
  { label: "Completed Maintenance", value: "144", icon: CheckCircle2, tone: "green" },
  { label: "Total Maintenance Cost", value: "₹18,42,600", icon: IndianRupee, tone: "blue" },
];

const availableVehicles = ["MH-04 BX 1120", "MH-04 BX 4488", "MH-04 BX 2760", "MH-04 BX 3392"];
const technicians = ["Vikram Solanki", "Anita Desai", "Rajesh Iyer", "Meera Pillai"];

const records = [
  {
    id: "MNT-5041", vehicle: "MH-04 BX 2210", reg: "MH-04 BX 2210", service: "Brake Inspection",
    description: "Front and rear brake pad check, rotor inspection", technician: "Vikram Solanki",
    estCost: 3000, actCost: 3200, start: "10 Jul 2026", end: "10 Jul 2026", status: "Completed",
    parts: ["Brake pads (front)", "Brake fluid"],
  },
  {
    id: "MNT-5042", vehicle: "MH-04 BX 0925", reg: "MH-04 BX 0925", service: "Oil Change",
    description: "Engine oil and filter replacement", technician: "Anita Desai",
    estCost: 1400, actCost: 1450, start: "09 Jul 2026", end: "09 Jul 2026", status: "Completed",
    parts: ["Engine oil 5W-30", "Oil filter"],
  },
  {
    id: "MNT-5043", vehicle: "MH-04 BX 3342", reg: "MH-04 BX 3342", service: "Tyre Replacement",
    description: "Replace two rear tyres, wheel alignment", technician: "Rajesh Iyer",
    estCost: 6500, actCost: 6800, start: "11 Jul 2026", end: "—", status: "In Progress",
    parts: ["Tyre (rear, x2)"],
  },
  {
    id: "MNT-5044", vehicle: "MH-04 BX 1187", reg: "MH-04 BX 1187", service: "AC Servicing",
    description: "AC gas top-up and cabin filter replacement", technician: "Meera Pillai",
    estCost: 2100, actCost: null, start: "13 Jul 2026", end: "—", status: "Scheduled",
    parts: [],
  },
  {
    id: "MNT-5045", vehicle: "MH-04 BX 1765", reg: "MH-04 BX 1765", service: "Engine Diagnostics",
    description: "Check engine light — running diagnostics scan", technician: "Vikram Solanki",
    estCost: 1800, actCost: null, start: "12 Jul 2026", end: "—", status: "In Progress",
    parts: [],
  },
  {
    id: "MNT-5046", vehicle: "MH-04 BX 4410", reg: "MH-04 BX 4410", service: "Battery Replacement",
    description: "Battery testing and replacement", technician: "Anita Desai",
    estCost: 4200, actCost: null, start: "14 Jul 2026", end: "—", status: "Scheduled",
    parts: [],
  },
  {
    id: "MNT-5047", vehicle: "MH-04 BX 0925", reg: "MH-04 BX 0925", service: "Suspension Check",
    description: "Front suspension noise inspection", technician: "Rajesh Iyer",
    estCost: 2600, actCost: 2550, start: "05 Jul 2026", end: "06 Jul 2026", status: "Completed",
    parts: ["Bushings (front)"],
  },
];

const alerts = [
  { label: "Vehicles Due for Maintenance", count: 6, icon: Clock, tone: "amber", note: "Within the next 7 days" },
  { label: "Overdue Maintenance", count: 2, icon: AlertTriangle, tone: "red", note: "Past scheduled service date" },
  { label: "Vehicles Currently In Shop", count: 8, icon: Wrench, tone: "blue", note: "Unavailable for dispatch" },
];

const businessRules = [
  "Vehicle status automatically changes to \"In Shop\" when maintenance starts.",
  "Vehicles in \"In Shop\" status cannot be assigned to trips.",
  "Completing maintenance changes vehicle status back to \"Available\" unless retired.",
];

const statusMeta = {
  Scheduled: { badge: "badge-amber", dot: "#F5A623", step: 0 },
  "In Progress": { badge: "badge-blue", dot: "#4C8DFF", step: 1 },
  Completed: { badge: "badge-green", dot: "#3DDC97", step: 2 },
};

const timelineSteps = ["Scheduled", "In Progress", "Completed"];

const emptyStr = (v) => v.trim().length === 0;
const fmtCost = (v) => (v == null ? "—" : `₹${v.toLocaleString("en-IN")}`);

/* ---------------- component ---------------- */

export default function MaintenanceManagement() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("All Types");
  const [serviceFilter, setServiceFilter] = useState("All Service Types");
  const [dateRange, setDateRange] = useState("This Week");
  const [showAdd, setShowAdd] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [recordList, setRecordList] = useState(records);
  const [form, setForm] = useState({
    vehicle: "", service: "", description: "", technician: "", estCost: "",
    start: "", expected: "", status: "Scheduled", notes: "",
  });

  const nextId = `MNT-${5041 + recordList.length}`;

  const serviceTypes = useMemo(() => [...new Set(records.map((r) => r.service))], []);

  const filtered = useMemo(() => {
    return recordList.filter((r) => {
      const q = query.toLowerCase();
      const matchesQuery =
        emptyStr(query) ||
        r.vehicle.toLowerCase().includes(q) ||
        r.reg.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All Status" || r.status === statusFilter;
      const matchesService = serviceFilter === "All Service Types" || r.service === serviceFilter;
      return matchesQuery && matchesStatus && matchesService;
    });
  }, [recordList, query, statusFilter, serviceFilter]);

  const handleAddRecord = (e) => {
    e.preventDefault();
    const newRecord = {
      id: nextId,
      vehicle: form.vehicle || availableVehicles[0],
      reg: form.vehicle || availableVehicles[0],
      service: form.service || "General Service",
      description: form.description || "—",
      technician: form.technician || technicians[0],
      estCost: Number(form.estCost) || 0,
      actCost: null,
      start: form.start || "—",
      end: form.status === "Completed" ? form.expected || "—" : "—",
      status: form.status,
      parts: [],
    };
    setRecordList((prev) => [newRecord, ...prev]);
    setShowAdd(false);
    setForm({ vehicle: "", service: "", description: "", technician: "", estCost: "", start: "", expected: "", status: "Scheduled", notes: "" });
  };

  return (
    <div className="mn-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .mn-app *{ box-sizing:border-box; }
        .mn-app{
          font-family:'Inter',sans-serif;
          background:#F4F6FA;
          color:#1C2431;
          width:100%;
          height:100vh;
          display:flex;
          overflow:hidden;
        }

        /* ---------- SIDEBAR ---------- */
        .mn-sidebar{
          width:240px; flex-shrink:0; height:100vh;
          background:linear-gradient(180deg,#0B1526 0%,#101F38 100%);
          color:#E8ECF3;
          display:flex; flex-direction:column;
          padding:22px 16px;
        }
        .mn-sidebar-logo{
          display:flex; align-items:center; gap:9px;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px;
          padding:0 8px; margin-bottom:30px;
        }
        .mn-sidebar-logo i{
          width:9px;height:9px;border-radius:50%;background:#F5A623;
          box-shadow:0 0 0 4px rgba(245,166,35,.18);
        }
        .mn-nav{ display:flex; flex-direction:column; gap:2px; flex:1; }
        .mn-nav-item{
          display:flex; align-items:center; gap:11px;
          padding:10px 12px; border-radius:8px;
          font-size:13.5px; font-weight:500; color:#9AA6BA;
          cursor:pointer; border-left:2px solid transparent;
          transition:.15s background, .15s color;
        }
        .mn-nav-item:hover{ background:rgba(255,255,255,.05); color:#E8ECF3; }
        .mn-nav-item.active{
          background:rgba(245,166,35,.10); color:#F5A623;
          border-left:2px solid #F5A623;
        }
        .mn-nav-item svg{ flex-shrink:0; }

        .mn-sidebar-footer{ display:flex; flex-direction:column; gap:2px; }
        .mn-live-badge{
          display:inline-flex; align-items:center; gap:8px;
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.1em;
          color:#3DDC97; background:rgba(61,220,151,.08);
          border:1px solid rgba(61,220,151,.3); padding:7px 11px; border-radius:8px;
          margin-bottom:12px;
        }
        .mn-live-dot{
          width:6px;height:6px;border-radius:50%;background:#3DDC97;
          animation:mn-pulse 1.8s infinite;
        }
        @keyframes mn-pulse{
          0%{ box-shadow:0 0 0 0 rgba(61,220,151,.55); }
          70%{ box-shadow:0 0 0 7px rgba(61,220,151,0); }
          100%{ box-shadow:0 0 0 0 rgba(61,220,151,0); }
        }
        .mn-nav-item.logout{ color:#8291A8; }
        .mn-nav-item.logout:hover{ color:#E5594D; background:rgba(229,89,77,.08); }

        /* ---------- MAIN COLUMN ---------- */
        .mn-main{ flex:1; display:flex; flex-direction:column; min-width:0; height:100vh; }

        .mn-topbar{
          display:flex; align-items:center; justify-content:space-between;
          gap:24px; padding:14px 28px;
          background:#fff; border-bottom:1px solid #E7EAF0; flex-shrink:0;
        }
        .mn-search-top{
          flex:1; max-width:420px;
          display:flex; align-items:center; gap:10px;
          background:#F4F6FA; border:1px solid #E7EAF0; border-radius:10px;
          padding:0 14px; height:38px;
        }
        .mn-search-top input{
          background:transparent; border:none; outline:none;
          color:#1C2431; font-size:13.5px; width:100%;
        }
        .mn-search-top input::placeholder{ color:#9AA3B2; }
        .mn-search-top svg{ color:#8291A8; flex-shrink:0; }

        .mn-nav-right{ display:flex; align-items:center; gap:18px; }
        .mn-bell{ position:relative; color:#5A6478; cursor:pointer; }
        .mn-bell-dot{
          position:absolute; top:-3px; right:-3px;
          width:8px;height:8px;border-radius:50%;
          background:#F5A623; border:2px solid #fff;
        }
        .mn-top-divider{ width:1px; height:26px; background:#E7EAF0; }
        .mn-profile{ display:flex; align-items:center; gap:10px; }
        .mn-avatar{
          width:34px;height:34px;border-radius:50%;
          background:linear-gradient(135deg,#F5A623,#E0941C);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; color:#181008;
        }
        .mn-profile-name{ font-size:13.5px; font-weight:600; line-height:1.2; color:#1C2431; }
        .mn-role-tag{
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.06em;
          color:#1FA871; margin-top:2px;
        }

        .mn-content{ flex:1; overflow-y:auto; padding:26px 28px 40px; }

        .mn-header{
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:22px; flex-wrap:wrap; gap:14px;
        }
        .mn-header h1{
          font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:600; color:#101F38;
        }
        .mn-header p{ color:#8291A8; font-size:13.5px; margin-top:5px; }

        .mn-add-btn{
          display:inline-flex; align-items:center; gap:8px;
          background:#F5A623; color:#181008; border:none; border-radius:10px;
          padding:11px 18px; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600;
          cursor:pointer; transition:.15s background;
          white-space:nowrap;
        }
        .mn-add-btn:hover{ background:#E0941C; }

        /* ---------- SEARCH & FILTERS ---------- */
        .mn-searchbar{
          display:grid; grid-template-columns:repeat(3,1fr); gap:12px;
          background:#fff; border:1px solid #E7EAF0; border-radius:12px;
          padding:14px; margin-bottom:14px;
        }
        .mn-search-field{
          display:flex; align-items:center; gap:9px;
          background:#FBFCFE; border:1px solid #E2E6ED; border-radius:8px;
          padding:0 12px; height:40px;
        }
        .mn-search-field svg{ color:#8291A8; flex-shrink:0; }
        .mn-search-field input{
          border:none; outline:none; background:transparent; width:100%;
          font-size:13px; color:#1C2431;
        }
        .mn-search-field input::placeholder{ color:#9AA3B2; }

        .mn-filters{
          display:flex; gap:12px; flex-wrap:wrap;
          background:#fff; border:1px solid #E7EAF0; border-radius:12px;
          padding:14px; margin-bottom:22px;
        }
        .mn-filter{ display:flex; flex-direction:column; gap:5px; min-width:170px; flex:1; }
        .mn-filter label{ font-size:11px; font-weight:600; color:#5A6478; letter-spacing:.02em; }
        .mn-filter-select{ position:relative; display:flex; align-items:center; }
        .mn-filter select{
          width:100%; height:40px; appearance:none; cursor:pointer;
          border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 30px 0 12px; font-size:13px; color:#1C2431;
        }
        .mn-filter select:focus{ outline:none; border-color:#F5A623; }
        .mn-filter-select svg{ position:absolute; right:10px; pointer-events:none; color:#8291A8; }

        /* ---------- SUMMARY CARDS ---------- */
        .mn-kpi-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:14px; margin-bottom:22px;
        }
        .mn-kpi-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px; }
        .mn-kpi-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .mn-kpi-icon{
          width:34px;height:34px;border-radius:8px; background:#EEF2FB; color:#3B5175;
          display:flex; align-items:center; justify-content:center;
        }
        .mn-kpi-icon.green{ background:rgba(61,220,151,.12); color:#1FA871; }
        .mn-kpi-icon.blue{ background:rgba(76,141,255,.12); color:#3568C4; }
        .mn-kpi-icon.amber{ background:#FEF4E4; color:#E0941C; }
        .mn-kpi-icon.red{ background:#FDECEA; color:#E5594D; }
        .mn-kpi-value{ font-family:'Space Grotesk',sans-serif; font-size:25px; font-weight:700; color:#101F38; }
        .mn-kpi-label{ font-size:12.5px; color:#8291A8; margin-top:4px; }

        /* ---------- SECTION CARD ---------- */
        .mn-section-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:20px; margin-bottom:20px; }
        .mn-section-title{
          font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:#101F38;
          margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;
        }
        .mn-section-sub{ font-size:11.5px; color:#8291A8; font-weight:400; font-family:'Inter',sans-serif; }

        /* ---------- TABLE ---------- */
        .mn-table-wrap{ overflow-x:auto; }
        .mn-table{ width:100%; border-collapse:collapse; font-size:12.6px; min-width:1220px; }
        .mn-table th{
          text-align:left; padding:10px 12px; font-size:11px; letter-spacing:.04em;
          color:#8291A8; font-weight:600; border-bottom:1px solid #ECEFF3; text-transform:uppercase;
          white-space:nowrap;
        }
        .mn-table td{ padding:12px; border-bottom:1px solid #F1F3F7; color:#1C2431; white-space:nowrap; }
        .mn-table td.wrap{ white-space:normal; max-width:220px; }
        .mn-table tr:last-child td{ border-bottom:none; }
        .mn-mono{ font-family:'JetBrains Mono',monospace; font-size:12.2px; color:#5A6478; }

        .mn-actions-cell{ display:flex; gap:6px; }
        .mn-icon-btn{
          width:28px; height:28px; border-radius:7px; border:1px solid #E7EAF0; background:#FBFCFE;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5A6478;
          transition:.15s border-color, .15s color, .15s background; flex-shrink:0;
        }
        .mn-icon-btn:hover{ border-color:#F5A623; color:#E0941C; background:#FFFBF3; }

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

        /* ---------- ALERTS ---------- */
        .mn-alert-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:14px; margin-bottom:20px;
        }
        .mn-alert-card{
          background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px;
          display:flex; align-items:flex-start; gap:12px;
        }
        .mn-alert-card-icon{
          width:38px; height:38px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .mn-alert-card-icon.amber{ background:#FEF4E4; color:#E0941C; }
        .mn-alert-card-icon.red{ background:#FDECEA; color:#E5594D; }
        .mn-alert-card-icon.blue{ background:rgba(76,141,255,.12); color:#3568C4; }
        .mn-alert-card-count{ font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:700; color:#101F38; }
        .mn-alert-card-label{ font-size:12.5px; color:#33394A; font-weight:600; margin-top:2px; }
        .mn-alert-card-note{ font-size:11.5px; color:#8291A8; margin-top:2px; }

        /* ---------- BUSINESS RULES ---------- */
        .mn-rules-card{
          background:linear-gradient(160deg,#0B1526 0%,#101F38 100%);
          border-radius:12px; padding:20px 22px; margin-bottom:24px;
        }
        .mn-rules-title{
          display:flex; align-items:center; gap:8px;
          font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:600; color:#E8ECF3;
          margin-bottom:14px;
        }
        .mn-rules-title svg{ color:#F5A623; }
        .mn-rule-row{
          display:flex; align-items:flex-start; gap:10px; padding:8px 0;
          font-size:12.8px; color:#B7C0D1; border-top:1px solid rgba(255,255,255,.06);
        }
        .mn-rule-row:first-child{ border-top:none; }
        .mn-rule-dot{ width:5px; height:5px; border-radius:50%; background:#F5A623; margin-top:6px; flex-shrink:0; }

        /* ---------- EMPTY STATE ---------- */
        .mn-empty{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:60px 20px; gap:14px;
        }
        .mn-empty h3{ font-family:'Space Grotesk',sans-serif; font-size:16px; color:#101F38; font-weight:600; }
        .mn-empty p{ font-size:13px; color:#8291A8; max-width:320px; }

        /* ---------- MODAL ---------- */
        .mn-modal-overlay{
          position:fixed; inset:0; background:rgba(11,21,38,.55);
          display:flex; align-items:center; justify-content:center; z-index:50; padding:24px;
        }
        .mn-modal{
          background:#fff; border-radius:16px; width:100%; max-width:560px;
          max-height:88vh; overflow-y:auto; box-shadow:0 20px 60px rgba(11,21,38,.35);
        }
        .mn-modal.wide{ max-width:640px; }
        .mn-modal-header{
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 22px; border-bottom:1px solid #ECEFF3; position:sticky; top:0; background:#fff; z-index:1;
        }
        .mn-modal-header h2{ font-family:'Space Grotesk',sans-serif; font-size:16.5px; font-weight:600; color:#101F38; }
        .mn-modal-close{
          width:30px; height:30px; border-radius:8px; border:1px solid #E7EAF0; background:#FBFCFE;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5A6478;
        }
        .mn-modal-close:hover{ border-color:#E5594D; color:#E5594D; }
        .mn-modal-body{ padding:22px; }

        .mn-form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .mn-form-field{ display:flex; flex-direction:column; gap:6px; }
        .mn-form-field.full{ grid-column:1 / -1; }
        .mn-form-field label{ font-size:11.5px; font-weight:600; color:#5A6478; }
        .mn-form-field input, .mn-form-field select, .mn-form-field textarea{
          height:40px; border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 12px; font-size:13px; color:#1C2431; font-family:'Inter',sans-serif;
        }
        .mn-form-field textarea{ height:70px; padding:10px 12px; resize:none; }
        .mn-form-field input:focus, .mn-form-field select:focus, .mn-form-field textarea:focus{
          outline:none; border-color:#F5A623;
        }

        .mn-modal-footer{
          display:flex; justify-content:flex-end; gap:10px; margin-top:20px;
          padding-top:16px; border-top:1px solid #ECEFF3;
        }
        .mn-btn-secondary{
          height:40px; padding:0 16px; border-radius:9px; border:1px solid #E2E6ED; background:#fff;
          font-size:13px; font-weight:600; color:#5A6478; cursor:pointer;
        }
        .mn-btn-secondary:hover{ border-color:#C7CEDC; }
        .mn-btn-primary{
          height:40px; padding:0 18px; border-radius:9px; border:none; background:#F5A623;
          font-size:13px; font-weight:600; color:#181008; cursor:pointer;
        }
        .mn-btn-primary:hover{ background:#E0941C; }

        /* ---------- VIEW MODAL ---------- */
        .mn-view-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; }
        .mn-view-stat{ background:#FBFCFE; border:1px solid #ECEFF3; border-radius:10px; padding:12px 14px; }
        .mn-view-stat .k{ font-size:11px; color:#8291A8; text-transform:uppercase; letter-spacing:.04em; }
        .mn-view-stat .v{ font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:700; color:#101F38; margin-top:4px; }

        .mn-view-list{ display:flex; flex-direction:column; gap:0; }
        .mn-view-row{ display:flex; justify-content:space-between; padding:9px 0; font-size:13px; border-bottom:1px solid #F1F3F7; }
        .mn-view-row:last-child{ border-bottom:none; }
        .mn-view-row .k{ color:#8291A8; }
        .mn-view-row .v{ color:#1C2431; font-weight:500; }

        .mn-parts-list{ display:flex; flex-direction:column; gap:8px; }
        .mn-part-row{ display:flex; align-items:center; gap:8px; font-size:13px; color:#1C2431; }
        .mn-part-row svg{ color:#8291A8; flex-shrink:0; }

        /* ---------- TIMELINE ---------- */
        .mn-timeline{ display:flex; align-items:center; margin-bottom:18px; }
        .mn-timeline-step{ display:flex; flex-direction:column; align-items:center; flex:1; position:relative; }
        .mn-timeline-dot{
          width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          background:#EEF1F5; color:#8291A8; border:2px solid #E2E6ED; z-index:1; flex-shrink:0;
        }
        .mn-timeline-dot.done{ background:#3DDC97; color:#fff; border-color:#3DDC97; }
        .mn-timeline-dot.current{ background:#F5A623; color:#181008; border-color:#F5A623; }
        .mn-timeline-label{ font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.04em; color:#5A6478; margin-top:6px; text-transform:uppercase; text-align:center; }
        .mn-timeline-line{ position:absolute; top:13px; left:50%; width:100%; height:2px; background:#E2E6ED; z-index:0; }
        .mn-timeline-line.done{ background:#3DDC97; }
        .mn-timeline-step:last-child .mn-timeline-line{ display:none; }

        @media (max-width: 1000px){
          .mn-searchbar{ grid-template-columns:1fr; }
          .mn-form-grid{ grid-template-columns:1fr; }
          .mn-view-grid{ grid-template-columns:1fr; }
        }
        @media (max-width: 860px){
          .mn-sidebar{ width:76px; padding:22px 10px; }
          .mn-sidebar-logo span, .mn-nav-item span, .mn-live-badge span{ display:none; }
          .mn-nav-item{ justify-content:center; }
          .mn-search-top{ display:none; }
        }
      `}</style>

      {/* ---------- SIDEBAR ---------- */}
      <div className="mn-sidebar">
        <div className="mn-sidebar-logo"><i /> <span>TransitOps</span></div>

        <div className="mn-nav">
          {navItems.map((n) => (
            <div className={`mn-nav-item ${n.active ? "active" : ""}`} key={n.label}>
              <n.icon size={17} /> <span>{n.label}</span>
            </div>
          ))}
        </div>

        <div className="mn-sidebar-footer">
          <span className="mn-live-badge"><span className="mn-live-dot" /> <span>LIVE NETWORK</span></span>
          <div className="mn-nav-item">
            <Settings size={17} /> <span>Settings</span>
          </div>
          <div className="mn-nav-item logout">
            <LogOut size={17} /> <span>Log Out</span>
          </div>
        </div>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="mn-main">
        <div className="mn-topbar">
          <div className="mn-search-top">
            <Search size={15} />
            <input placeholder="Search vehicles, drivers, trip IDs…" />
          </div>

          <div className="mn-nav-right">
            <div className="mn-bell">
              <Bell size={19} />
              <span className="mn-bell-dot" />
            </div>
            <div className="mn-top-divider" />
            <div className="mn-profile">
              <div className="mn-avatar">RM</div>
              <div>
                <div className="mn-profile-name">Rhea Malhotra</div>
                <div className="mn-role-tag">FLEET MANAGER</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mn-content">
          <div className="mn-header">
            <div>
              <h1>Maintenance Management</h1>
              <p>Track vehicle maintenance, repairs, and service history.</p>
            </div>
            <button className="mn-add-btn" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Maintenance
            </button>
          </div>

          {/* ---------- SEARCH ---------- */}
          <div className="mn-searchbar">
            <div className="mn-search-field">
              <Truck size={15} />
              <input placeholder="Search by vehicle…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="mn-search-field">
              <ClipboardList size={15} />
              <input placeholder="Search by registration number…" />
            </div>
            <div className="mn-search-field">
              <Wrench size={15} />
              <input placeholder="Search by maintenance ID…" />
            </div>
          </div>

          {/* ---------- FILTERS ---------- */}
          <div className="mn-filters">
            <div className="mn-filter">
              <label>Maintenance Status</label>
              <div className="mn-filter-select">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Status</option><option>Scheduled</option><option>In Progress</option><option>Completed</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="mn-filter">
              <label>Vehicle Type</label>
              <div className="mn-filter-select">
                <select value={vehicleTypeFilter} onChange={(e) => setVehicleTypeFilter(e.target.value)}>
                  <option>All Types</option><option>Bus</option><option>Mini Bus</option>
                  <option>Van</option><option>Truck</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="mn-filter">
              <label>Service Type</label>
              <div className="mn-filter-select">
                <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                  <option>All Service Types</option>
                  {serviceTypes.map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="mn-filter">
              <label>Date Range</label>
              <div className="mn-filter-select">
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option>Today</option><option>This Week</option><option>This Month</option><option>Custom Range</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* ---------- SUMMARY CARDS ---------- */}
          <div className="mn-kpi-grid">
            {summaryCards.map((k) => (
              <div className="mn-kpi-card" key={k.label}>
                <div className="mn-kpi-top">
                  <div className={`mn-kpi-icon ${k.tone || ""}`}><k.icon size={17} /></div>
                </div>
                <div className="mn-kpi-value">{k.value}</div>
                <div className="mn-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* ---------- ALERTS ---------- */}
          <div className="mn-alert-grid">
            {alerts.map((a) => (
              <div className="mn-alert-card" key={a.label}>
                <div className={`mn-alert-card-icon ${a.tone}`}><a.icon size={18} /></div>
                <div>
                  <div className="mn-alert-card-count">{a.count}</div>
                  <div className="mn-alert-card-label">{a.label}</div>
                  <div className="mn-alert-card-note">{a.note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- BUSINESS RULES ---------- */}
          <div className="mn-rules-card">
            <div className="mn-rules-title"><Info size={16} /> Business Rules</div>
            {businessRules.map((r, i) => (
              <div className="mn-rule-row" key={i}>
                <span className="mn-rule-dot" />
                <span>{r}</span>
              </div>
            ))}
          </div>

          {/* ---------- MAINTENANCE TABLE ---------- */}
          <div className="mn-section-card">
            <div className="mn-section-title">
              Maintenance Records
              <span className="mn-section-sub">{filtered.length} of {recordList.length} shown</span>
            </div>

            {filtered.length === 0 ? (
              <div className="mn-empty">
                <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
                  <rect x="28" y="34" width="64" height="40" rx="8" fill="#F4F6FA" stroke="#E2E6ED" />
                  <path d="M50 34 L58 20 L70 20 L62 34 Z" fill="#EEF1F5" stroke="#E2E6ED" />
                  <circle cx="44" cy="76" r="6" fill="#C7CEDC" />
                  <circle cx="76" cy="76" r="6" fill="#C7CEDC" />
                  <path d="M55 50 l6 6 10 -12" stroke="#F5A623" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                </svg>
                <h3>No Maintenance Records Found</h3>
                <p>Try adjusting your search or filters, or add a new maintenance record to get started.</p>
                <button className="mn-add-btn" onClick={() => setShowAdd(true)}>
                  <Plus size={16} /> Add Maintenance
                </button>
              </div>
            ) : (
              <div className="mn-table-wrap">
                <table className="mn-table">
                  <thead>
                    <tr>
                      <th>Maintenance ID</th><th>Vehicle</th><th>Reg. Number</th><th>Service Type</th>
                      <th>Description</th><th>Technician</th><th>Est. Cost</th><th>Actual Cost</th>
                      <th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const meta = statusMeta[r.status];
                      return (
                        <tr key={r.id}>
                          <td className="mn-mono">{r.id}</td>
                          <td>{r.vehicle}</td>
                          <td className="mn-mono">{r.reg}</td>
                          <td>{r.service}</td>
                          <td className="wrap">{r.description}</td>
                          <td>{r.technician}</td>
                          <td className="mn-mono">{fmtCost(r.estCost)}</td>
                          <td className="mn-mono">{fmtCost(r.actCost)}</td>
                          <td className="mn-mono">{r.start}</td>
                          <td className="mn-mono">{r.end}</td>
                          <td>
                            <span className={`badge ${meta.badge}`}>
                              <span className="badge-dot" style={{ background: meta.dot }} /> {r.status}
                            </span>
                          </td>
                          <td>
                            <div className="mn-actions-cell">
                              <button className="mn-icon-btn" title="View" onClick={() => setViewRecord(r)}>
                                <Eye size={14} />
                              </button>
                              <button className="mn-icon-btn" title="Edit">
                                <Pencil size={14} />
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
        </div>
      </div>

      {/* ---------- ADD MAINTENANCE MODAL ---------- */}
      {showAdd && (
        <div className="mn-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="mn-modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="mn-modal-header">
              <h2>Add Maintenance</h2>
              <div className="mn-modal-close" onClick={() => setShowAdd(false)}><X size={16} /></div>
            </div>
            <div className="mn-modal-body">
              <form onSubmit={handleAddRecord}>
                <div className="mn-form-grid">
                  <div className="mn-form-field">
                    <label>Vehicle (Available Only)</label>
                    <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
                      <option value="">Select a vehicle…</option>
                      {availableVehicles.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="mn-form-field">
                    <label>Service Type</label>
                    <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g. Brake Inspection" required />
                  </div>

                  <div className="mn-form-field full">
                    <label>Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What work is being done…" />
                  </div>

                  <div className="mn-form-field">
                    <label>Assigned Technician</label>
                    <select value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })}>
                      <option value="">Select a technician…</option>
                      {technicians.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="mn-form-field">
                    <label>Estimated Cost (₹)</label>
                    <input type="number" value={form.estCost} onChange={(e) => setForm({ ...form, estCost: e.target.value })} placeholder="3000" />
                  </div>

                  <div className="mn-form-field">
                    <label>Start Date</label>
                    <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                  </div>
                  <div className="mn-form-field">
                    <label>Expected Completion Date</label>
                    <input type="date" value={form.expected} onChange={(e) => setForm({ ...form, expected: e.target.value })} />
                  </div>

                  <div className="mn-form-field">
                    <label>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option>Scheduled</option><option>In Progress</option><option>Completed</option>
                    </select>
                  </div>
                  <div className="mn-form-field" />

                  <div className="mn-form-field full">
                    <label>Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes…" />
                  </div>
                </div>

                <div className="mn-modal-footer">
                  <button type="button" className="mn-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="mn-btn-primary">Add Maintenance</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MAINTENANCE DETAILS MODAL ---------- */}
      {viewRecord && (
        <div className="mn-modal-overlay" onClick={() => setViewRecord(null)}>
          <div className="mn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mn-modal-header">
              <h2>Maintenance Details</h2>
              <div className="mn-modal-close" onClick={() => setViewRecord(null)}><X size={16} /></div>
            </div>
            <div className="mn-modal-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700, color: "#101F38" }}>{viewRecord.vehicle}</div>
                  <div className="mn-mono" style={{ fontSize: 11.5, marginTop: 2 }}>{viewRecord.id} · Reg. {viewRecord.reg}</div>
                </div>
                <span className={`badge ${statusMeta[viewRecord.status].badge}`}>
                  <span className="badge-dot" style={{ background: statusMeta[viewRecord.status].dot }} /> {viewRecord.status}
                </span>
              </div>

              {/* Timeline */}
              <div className="mn-timeline">
                {timelineSteps.map((step, i) => {
                  const currentStep = statusMeta[viewRecord.status].step;
                  const done = i < currentStep;
                  const current = i === currentStep;
                  return (
                    <div className="mn-timeline-step" key={step}>
                      <div className={`mn-timeline-line ${done ? "done" : ""}`} />
                      <div className={`mn-timeline-dot ${done ? "done" : current ? "current" : ""}`}>
                        {done ? <CheckCircle size={14} /> : <Circle size={10} fill="currentColor" />}
                      </div>
                      <div className="mn-timeline-label">{step}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mn-view-grid">
                <div className="mn-view-stat">
                  <div className="k">Estimated Cost</div>
                  <div className="v">{fmtCost(viewRecord.estCost)}</div>
                </div>
                <div className="mn-view-stat">
                  <div className="k">Actual Cost</div>
                  <div className="v">{fmtCost(viewRecord.actCost)}</div>
                </div>
                <div className="mn-view-stat">
                  <div className="k">Start Date</div>
                  <div className="v">{viewRecord.start}</div>
                </div>
                <div className="mn-view-stat">
                  <div className="k">End Date</div>
                  <div className="v">{viewRecord.end}</div>
                </div>
              </div>

              <div className="mn-section-title" style={{ fontSize: 13, marginBottom: 8 }}>Vehicle Information</div>
              <div className="mn-view-list" style={{ marginBottom: 18 }}>
                <div className="mn-view-row"><span className="k">Registration Number</span><span className="v">{viewRecord.reg}</span></div>
                <div className="mn-view-row"><span className="k">Service Type</span><span className="v">{viewRecord.service}</span></div>
                <div className="mn-view-row"><span className="k">Assigned Technician</span><span className="v">{viewRecord.technician}</span></div>
                <div className="mn-view-row"><span className="k">Description</span><span className="v" style={{ textAlign: "right", maxWidth: 260 }}>{viewRecord.description}</span></div>
              </div>

              <div className="mn-section-title" style={{ fontSize: 13, marginBottom: 8 }}>Parts Replaced</div>
              <div className="mn-parts-list" style={{ marginBottom: 18 }}>
                {viewRecord.parts.length === 0 ? (
                  <div className="mn-section-sub">No parts recorded yet.</div>
                ) : (
                  viewRecord.parts.map((p, i) => (
                    <div className="mn-part-row" key={i}><Package size={14} /> {p}</div>
                  ))
                )}
              </div>

              <div className="mn-section-title" style={{ fontSize: 13, marginBottom: 8 }}>Service History</div>
              <div className="mn-view-list">
                <div className="mn-view-row"><span className="k">{viewRecord.start}</span><span className="v">Maintenance scheduled</span></div>
                {statusMeta[viewRecord.status].step >= 1 && (
                  <div className="mn-view-row"><span className="k">{viewRecord.start}</span><span className="v">Vehicle moved to In Shop status</span></div>
                )}
                {viewRecord.status === "Completed" && (
                  <div className="mn-view-row"><span className="k">{viewRecord.end}</span><span className="v">Maintenance completed, vehicle returned to Available</span></div>
                )}
              </div>

              <div className="mn-modal-footer">
                <button className="mn-btn-secondary" onClick={() => setViewRecord(null)}>Close</button>
                <button className="mn-btn-primary">Edit Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
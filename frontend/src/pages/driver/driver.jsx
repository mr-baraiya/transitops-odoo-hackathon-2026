import React, { useState, useMemo } from "react";
import {
  Search, Bell, ChevronDown, Truck, Users, Wrench, MapPin, Fuel, Plus,
  AlertTriangle, TrendingUp, TrendingDown, Car, ClipboardList, CircleDot,
  LayoutDashboard, Settings, FileBarChart, LogOut, Eye, Pencil, Trash2,
  Phone, ShieldCheck, X, Upload, Clock, CheckCircle2, BadgeAlert,
  UserX, IdCard, CalendarClock,
} from "lucide-react";

/* ---------------- mock data ---------------- */

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Vehicles", icon: Truck },
  { label: "Drivers", icon: Users, active: true },
  { label: "Trips", icon: MapPin },
  { label: "Maintenance", icon: Wrench },
  { label: "Fuel Logs", icon: Fuel },
  { label: "Reports", icon: FileBarChart },
];

const summaryCards = [
  { label: "Total Drivers", value: "88", icon: Users },
  { label: "Available", value: "22", icon: CircleDot, tone: "green" },
  { label: "On Trip", value: "41", icon: MapPin, tone: "blue" },
  { label: "Off Duty", value: "19", icon: Clock, tone: "amber" },
  { label: "Suspended", value: "3", icon: UserX, tone: "red" },
  { label: "Licenses Expiring Soon", value: "5", icon: BadgeAlert, tone: "amber" },
];

const drivers = [
  {
    id: "EMP-1042", name: "Arjun Patel", photo: "https://i.pravatar.cc/150?img=12",
    license: "GJ-04 2019 0044201", category: "HMV", expiry: "18 Jul 2026",
    phone: "+91 98250 11234", safety: 94, vehicle: "MH-04 BX 2210", status: "Available",
  },
  {
    id: "EMP-1043", name: "Sara Khan", photo: "https://i.pravatar.cc/150?img=32",
    license: "GJ-04 2020 0091173", category: "LMV", expiry: "02 Sep 2026",
    phone: "+91 98250 22981", safety: 88, vehicle: "MH-04 BX 1187", status: "On Trip",
  },
  {
    id: "EMP-1044", name: "Ravi Shah", photo: "https://i.pravatar.cc/150?img=51",
    license: "GJ-04 2017 0033789", category: "HMV", expiry: "22 Jul 2026",
    phone: "+91 98250 33456", safety: 76, vehicle: "MH-04 BX 0925", status: "On Trip",
  },
  {
    id: "EMP-1045", name: "Neha Verma", photo: "https://i.pravatar.cc/150?img=45",
    license: "GJ-04 2021 0012044", category: "LMV", expiry: "11 Nov 2026",
    phone: "+91 98250 44012", safety: 91, vehicle: "MH-04 BX 3342", status: "Off Duty",
  },
  {
    id: "EMP-1046", name: "Karan Mehta", photo: "https://i.pravatar.cc/150?img=14",
    license: "GJ-04 2016 0027650", category: "HMV", expiry: "05 Aug 2026",
    phone: "+91 98250 55298", safety: 62, vehicle: "—", status: "Suspended",
  },
  {
    id: "EMP-1047", name: "Priya Nair", photo: "https://i.pravatar.cc/150?img=47",
    license: "GJ-04 2022 0056812", category: "LMV", expiry: "30 Jul 2026",
    phone: "+91 98250 66701", safety: 97, vehicle: "MH-04 BX 1765", status: "Available",
  },
  {
    id: "EMP-1048", name: "Devang Joshi", photo: "https://i.pravatar.cc/150?img=15",
    license: "GJ-04 2018 0068221", category: "HMV", expiry: "14 Jul 2026",
    phone: "+91 98250 77340", safety: 83, vehicle: "—", status: "Off Duty",
  },
  {
    id: "EMP-1049", name: "Ishita Rao", photo: "https://i.pravatar.cc/150?img=48",
    license: "GJ-04 2023 0071902", category: "LMV", expiry: "19 Dec 2026",
    phone: "+91 98250 88129", safety: 90, vehicle: "MH-04 BX 4410", status: "On Trip",
  },
];

const recentActivity = [
  { driver: "Arjun Patel", vehicle: "MH-04 BX 2210", activity: "Trip completed — Central to Terminal", time: "Today, 14:22", status: "Completed" },
  { driver: "Sara Khan", vehicle: "MH-04 BX 1187", activity: "Trip delayed — traffic on Oak St", time: "Today, 13:58", status: "Delayed" },
  { driver: "Karan Mehta", vehicle: "—", activity: "Account suspended — safety violation", time: "Yesterday, 17:10", status: "Suspended" },
  { driver: "Neha Verma", vehicle: "MH-04 BX 3342", activity: "Shift ended, went off duty", time: "Yesterday, 16:02", status: "Off Duty" },
  { driver: "Ishita Rao", vehicle: "MH-04 BX 4410", activity: "Trip dispatched — Fairview to Central", time: "Yesterday, 11:40", status: "On Trip" },
];

const performance = [
  { label: "Total Trips Completed", value: "5,214" },
  { label: "Active Trips", value: "41" },
  { label: "Avg Fuel Efficiency", value: "11.4 km/l" },
  { label: "Avg Safety Score", value: "86 / 100" },
  { label: "On-Time Delivery Rate", value: "93.2%" },
];

const licenseAlerts = [
  { label: "Licenses Expiring Soon", count: 5, icon: CalendarClock, tone: "amber", note: "Within next 14 days" },
  { label: "Expired Licenses", count: 1, icon: BadgeAlert, tone: "red", note: "Requires immediate renewal" },
  { label: "Suspended Drivers", count: 3, icon: UserX, tone: "red", note: "Pending review" },
  { label: "Drivers Currently On Trip", count: 41, icon: MapPin, tone: "blue", note: "Live across 4 regions" },
];

const statusMeta = {
  Available: { badge: "badge-green", dot: "#3DDC97" },
  "On Trip": { badge: "badge-blue", dot: "#4C8DFF" },
  "Off Duty": { badge: "badge-amber", dot: "#F5A623" },
  Suspended: { badge: "badge-red", dot: "#E5594D" },
  Completed: { badge: "badge-green", dot: "#3DDC97" },
  Delayed: { badge: "badge-amber", dot: "#F5A623" },
};

const emptyStr = (v) => v.trim().length === 0;

/* ---------------- component ---------------- */

export default function DriverManagement() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [expiryFilter, setExpiryFilter] = useState("Any Time");
  const [region, setRegion] = useState("All Regions");
  const [sortBy, setSortBy] = useState("Name (A–Z)");
  const [showAdd, setShowAdd] = useState(false);
  const [viewDriver, setViewDriver] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [driverList, setDriverList] = useState(drivers);
  const [form, setForm] = useState({
    name: "", empId: "", email: "", phone: "", license: "", category: "LMV",
    expiry: "", address: "", emergency: "", safety: "90", status: "Available",
  });

  const filtered = useMemo(() => {
    let list = driverList.filter((d) => {
      const q = query.toLowerCase();
      const matchesQuery =
        emptyStr(query) ||
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.license.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All Status" || d.status === statusFilter;
      const matchesCategory = categoryFilter === "All Categories" || d.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
    if (sortBy === "Name (A–Z)") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "Safety Score (High–Low)") list = [...list].sort((a, b) => b.safety - a.safety);
    if (sortBy === "License Expiry (Soonest)") list = [...list].sort((a, b) => a.expiry.localeCompare(b.expiry));
    return list;
  }, [driverList, query, statusFilter, categoryFilter, sortBy]);

  const handleDelete = () => {
    setDriverList((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleAddDriver = (e) => {
    e.preventDefault();
    const newDriver = {
      id: form.empId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: form.name || "New Driver",
      photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 60) + 1}`,
      license: form.license || "—",
      category: form.category,
      expiry: form.expiry || "—",
      phone: form.phone || "—",
      safety: Number(form.safety) || 90,
      vehicle: "—",
      status: form.status,
    };
    setDriverList((prev) => [newDriver, ...prev]);
    setShowAdd(false);
    setForm({
      name: "", empId: "", email: "", phone: "", license: "", category: "LMV",
      expiry: "", address: "", emergency: "", safety: "90", status: "Available",
    });
  };

  return (
    <div className="dr-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .dr-app *{ box-sizing:border-box; }
        .dr-app{
          font-family:'Inter',sans-serif;
          background:#F4F6FA;
          color:#1C2431;
          width:100%;
          height:100vh;
          display:flex;
          overflow:hidden;
        }

        /* ---------- SIDEBAR ---------- */
        .dr-sidebar{
          width:240px; flex-shrink:0; height:100vh;
          background:linear-gradient(180deg,#0B1526 0%,#101F38 100%);
          color:#E8ECF3;
          display:flex; flex-direction:column;
          padding:22px 16px;
        }
        .dr-sidebar-logo{
          display:flex; align-items:center; gap:9px;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px;
          padding:0 8px; margin-bottom:30px;
        }
        .dr-sidebar-logo i{
          width:9px;height:9px;border-radius:50%;background:#F5A623;
          box-shadow:0 0 0 4px rgba(245,166,35,.18);
        }
        .dr-nav{ display:flex; flex-direction:column; gap:2px; flex:1; }
        .dr-nav-item{
          display:flex; align-items:center; gap:11px;
          padding:10px 12px; border-radius:8px;
          font-size:13.5px; font-weight:500; color:#9AA6BA;
          cursor:pointer; border-left:2px solid transparent;
          transition:.15s background, .15s color;
        }
        .dr-nav-item:hover{ background:rgba(255,255,255,.05); color:#E8ECF3; }
        .dr-nav-item.active{
          background:rgba(245,166,35,.10); color:#F5A623;
          border-left:2px solid #F5A623;
        }
        .dr-nav-item svg{ flex-shrink:0; }

        .dr-sidebar-footer{ display:flex; flex-direction:column; gap:2px; }
        .dr-live-badge{
          display:inline-flex; align-items:center; gap:8px;
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.1em;
          color:#3DDC97; background:rgba(61,220,151,.08);
          border:1px solid rgba(61,220,151,.3); padding:7px 11px; border-radius:8px;
          margin-bottom:12px;
        }
        .dr-live-dot{
          width:6px;height:6px;border-radius:50%;background:#3DDC97;
          animation:dr-pulse 1.8s infinite;
        }
        @keyframes dr-pulse{
          0%{ box-shadow:0 0 0 0 rgba(61,220,151,.55); }
          70%{ box-shadow:0 0 0 7px rgba(61,220,151,0); }
          100%{ box-shadow:0 0 0 0 rgba(61,220,151,0); }
        }
        .dr-nav-item.logout{ color:#8291A8; }
        .dr-nav-item.logout:hover{ color:#E5594D; background:rgba(229,89,77,.08); }

        /* ---------- MAIN COLUMN ---------- */
        .dr-main{ flex:1; display:flex; flex-direction:column; min-width:0; height:100vh; }

        .dr-topbar{
          display:flex; align-items:center; justify-content:space-between;
          gap:24px; padding:14px 28px;
          background:#fff; border-bottom:1px solid #E7EAF0; flex-shrink:0;
        }
        .dr-search-top{
          flex:1; max-width:420px;
          display:flex; align-items:center; gap:10px;
          background:#F4F6FA; border:1px solid #E7EAF0; border-radius:10px;
          padding:0 14px; height:38px;
        }
        .dr-search-top input{
          background:transparent; border:none; outline:none;
          color:#1C2431; font-size:13.5px; width:100%;
        }
        .dr-search-top input::placeholder{ color:#9AA3B2; }
        .dr-search-top svg{ color:#8291A8; flex-shrink:0; }

        .dr-nav-right{ display:flex; align-items:center; gap:18px; }
        .dr-bell{ position:relative; color:#5A6478; cursor:pointer; }
        .dr-bell-dot{
          position:absolute; top:-3px; right:-3px;
          width:8px;height:8px;border-radius:50%;
          background:#F5A623; border:2px solid #fff;
        }
        .dr-top-divider{ width:1px; height:26px; background:#E7EAF0; }
        .dr-profile{ display:flex; align-items:center; gap:10px; }
        .dr-avatar{
          width:34px;height:34px;border-radius:50%;
          background:linear-gradient(135deg,#F5A623,#E0941C);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; color:#181008;
        }
        .dr-profile-name{ font-size:13.5px; font-weight:600; line-height:1.2; color:#1C2431; }
        .dr-role-tag{
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.06em;
          color:#1FA871; margin-top:2px;
        }

        .dr-content{ flex:1; overflow-y:auto; padding:26px 28px 40px; }

        .dr-header{
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:22px; flex-wrap:wrap; gap:14px;
        }
        .dr-header h1{
          font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:600; color:#101F38;
        }
        .dr-header p{ color:#8291A8; font-size:13.5px; margin-top:5px; }

        .dr-add-btn{
          display:inline-flex; align-items:center; gap:8px;
          background:#F5A623; color:#181008; border:none; border-radius:10px;
          padding:11px 18px; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600;
          cursor:pointer; transition:.15s background;
          white-space:nowrap;
        }
        .dr-add-btn:hover{ background:#E0941C; }

        /* ---------- SEARCH & FILTERS ---------- */
        .dr-searchbar{
          display:grid; grid-template-columns:repeat(3,1fr); gap:12px;
          background:#fff; border:1px solid #E7EAF0; border-radius:12px;
          padding:14px; margin-bottom:14px;
        }
        .dr-search-field{
          display:flex; align-items:center; gap:9px;
          background:#FBFCFE; border:1px solid #E2E6ED; border-radius:8px;
          padding:0 12px; height:40px;
        }
        .dr-search-field svg{ color:#8291A8; flex-shrink:0; }
        .dr-search-field input{
          border:none; outline:none; background:transparent; width:100%;
          font-size:13px; color:#1C2431;
        }
        .dr-search-field input::placeholder{ color:#9AA3B2; }

        .dr-filters{
          display:flex; gap:12px; flex-wrap:wrap;
          background:#fff; border:1px solid #E7EAF0; border-radius:12px;
          padding:14px; margin-bottom:22px;
        }
        .dr-filter{ display:flex; flex-direction:column; gap:5px; min-width:160px; flex:1; }
        .dr-filter label{ font-size:11px; font-weight:600; color:#5A6478; letter-spacing:.02em; }
        .dr-filter-select{ position:relative; display:flex; align-items:center; }
        .dr-filter select{
          width:100%; height:40px; appearance:none; cursor:pointer;
          border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 30px 0 12px; font-size:13px; color:#1C2431;
        }
        .dr-filter select:focus{ outline:none; border-color:#F5A623; }
        .dr-filter-select svg{ position:absolute; right:10px; pointer-events:none; color:#8291A8; }

        /* ---------- SUMMARY CARDS ---------- */
        .dr-kpi-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
          gap:14px; margin-bottom:24px;
        }
        .dr-kpi-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px; }
        .dr-kpi-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .dr-kpi-icon{
          width:34px;height:34px;border-radius:8px; background:#EEF2FB; color:#3B5175;
          display:flex; align-items:center; justify-content:center;
        }
        .dr-kpi-icon.green{ background:rgba(61,220,151,.12); color:#1FA871; }
        .dr-kpi-icon.blue{ background:rgba(76,141,255,.12); color:#3568C4; }
        .dr-kpi-icon.amber{ background:#FEF4E4; color:#E0941C; }
        .dr-kpi-icon.red{ background:#FDECEA; color:#E5594D; }
        .dr-kpi-value{ font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:#101F38; }
        .dr-kpi-label{ font-size:12.5px; color:#8291A8; margin-top:4px; }

        /* ---------- SECTION CARD ---------- */
        .dr-section-card{ background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:20px; margin-bottom:20px; }
        .dr-section-title{
          font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:#101F38;
          margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;
        }
        .dr-section-sub{ font-size:11.5px; color:#8291A8; font-weight:400; font-family:'Inter',sans-serif; }

        /* ---------- DRIVER GRID ---------- */
        .dr-driver-grid{
          display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
          gap:16px; margin-bottom:24px;
        }
        .dr-driver-card{
          background:#fff; border:1px solid #E7EAF0; border-radius:14px; padding:16px;
          display:flex; flex-direction:column; gap:12px;
          transition:.15s box-shadow, .15s border-color;
        }
        .dr-driver-card:hover{ border-color:#E2E6ED; box-shadow:0 6px 18px rgba(16,31,56,.06); }
        .dr-driver-top{ display:flex; gap:12px; align-items:flex-start; }
        .dr-driver-photo{
          width:52px; height:52px; border-radius:12px; object-fit:cover; flex-shrink:0;
          border:1px solid #E7EAF0;
        }
        .dr-driver-id{ flex:1; min-width:0; }
        .dr-driver-name{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:14.5px; color:#101F38; }
        .dr-driver-empid{ font-family:'JetBrains Mono',monospace; font-size:11px; color:#8291A8; margin-top:2px; }

        .dr-driver-meta{ display:flex; flex-direction:column; gap:7px; font-size:12.5px; }
        .dr-driver-meta-row{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .dr-driver-meta-row .k{ color:#8291A8; display:flex; align-items:center; gap:6px; }
        .dr-driver-meta-row .k svg{ flex-shrink:0; }
        .dr-driver-meta-row .v{ color:#1C2431; font-weight:500; text-align:right; }
        .dr-driver-meta-row .v.mono{ font-family:'JetBrains Mono',monospace; font-size:11.5px; }

        .dr-safety-bar-wrap{ display:flex; align-items:center; gap:8px; }
        .dr-safety-bar{ flex:1; height:5px; background:#EEF1F5; border-radius:4px; overflow:hidden; }
        .dr-safety-bar-fill{ height:100%; border-radius:4px; }
        .dr-safety-val{ font-family:'JetBrains Mono',monospace; font-size:11.5px; font-weight:600; color:#1C2431; }

        .dr-driver-footer{
          display:flex; align-items:center; justify-content:space-between;
          padding-top:10px; border-top:1px solid #F1F3F7;
        }
        .dr-driver-actions{ display:flex; gap:6px; }
        .dr-icon-btn{
          width:28px; height:28px; border-radius:7px; border:1px solid #E7EAF0; background:#FBFCFE;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5A6478;
          transition:.15s border-color, .15s color, .15s background;
        }
        .dr-icon-btn:hover{ border-color:#F5A623; color:#E0941C; background:#FFFBF3; }
        .dr-icon-btn.danger:hover{ border-color:#E5594D; color:#E5594D; background:#FDECEA; }

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

        /* ---------- LICENSE ALERTS ---------- */
        .dr-alert-grid{
          display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:14px; margin-bottom:20px;
        }
        .dr-alert-card{
          background:#fff; border:1px solid #E7EAF0; border-radius:12px; padding:16px;
          display:flex; align-items:flex-start; gap:12px;
        }
        .dr-alert-card-icon{
          width:38px; height:38px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .dr-alert-card-icon.amber{ background:#FEF4E4; color:#E0941C; }
        .dr-alert-card-icon.red{ background:#FDECEA; color:#E5594D; }
        .dr-alert-card-icon.blue{ background:rgba(76,141,255,.12); color:#3568C4; }
        .dr-alert-card-count{ font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:700; color:#101F38; }
        .dr-alert-card-label{ font-size:12.5px; color:#33394A; font-weight:600; margin-top:2px; }
        .dr-alert-card-note{ font-size:11.5px; color:#8291A8; margin-top:2px; }

        /* ---------- PERFORMANCE BAND ---------- */
        .dr-summary-band{
          background:linear-gradient(160deg,#0B1526 0%,#101F38 100%);
          border-radius:12px; padding:22px 24px;
          display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:20px;
          margin-bottom:24px;
        }
        .dr-summary-item{ color:#E8ECF3; }
        .dr-summary-item .val{ font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; }
        .dr-summary-item .lbl{
          font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.06em;
          color:#8291A8; margin-top:5px; text-transform:uppercase;
        }
        .dr-summary-item.accent .val{ color:#F5A623; }

        /* ---------- TABLE ---------- */
        .dr-table{ width:100%; border-collapse:collapse; font-size:13px; }
        .dr-table th{
          text-align:left; padding:10px 12px; font-size:11px; letter-spacing:.04em;
          color:#8291A8; font-weight:600; border-bottom:1px solid #ECEFF3; text-transform:uppercase;
        }
        .dr-table td{ padding:12px; border-bottom:1px solid #F1F3F7; color:#1C2431; }
        .dr-table tr:last-child td{ border-bottom:none; }
        .dr-mono{ font-family:'JetBrains Mono',monospace; font-size:12.5px; color:#5A6478; }

        /* ---------- EMPTY STATE ---------- */
        .dr-empty{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:60px 20px; gap:14px;
        }
        .dr-empty h3{ font-family:'Space Grotesk',sans-serif; font-size:16px; color:#101F38; font-weight:600; }
        .dr-empty p{ font-size:13px; color:#8291A8; max-width:320px; }

        /* ---------- MODAL ---------- */
        .dr-modal-overlay{
          position:fixed; inset:0; background:rgba(11,21,38,.55);
          display:flex; align-items:center; justify-content:center; z-index:50; padding:24px;
        }
        .dr-modal{
          background:#fff; border-radius:16px; width:100%; max-width:560px;
          max-height:88vh; overflow-y:auto; box-shadow:0 20px 60px rgba(11,21,38,.35);
        }
        .dr-modal.wide{ max-width:640px; }
        .dr-modal-header{
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 22px; border-bottom:1px solid #ECEFF3; position:sticky; top:0; background:#fff; z-index:1;
        }
        .dr-modal-header h2{ font-family:'Space Grotesk',sans-serif; font-size:16.5px; font-weight:600; color:#101F38; }
        .dr-modal-close{
          width:30px; height:30px; border-radius:8px; border:1px solid #E7EAF0; background:#FBFCFE;
          display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5A6478;
        }
        .dr-modal-close:hover{ border-color:#E5594D; color:#E5594D; }
        .dr-modal-body{ padding:22px; }

        .dr-form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .dr-form-field{ display:flex; flex-direction:column; gap:6px; }
        .dr-form-field.full{ grid-column:1 / -1; }
        .dr-form-field label{ font-size:11.5px; font-weight:600; color:#5A6478; }
        .dr-form-field input, .dr-form-field select, .dr-form-field textarea{
          height:40px; border:1px solid #E2E6ED; border-radius:8px; background:#FBFCFE;
          padding:0 12px; font-size:13px; color:#1C2431; font-family:'Inter',sans-serif;
        }
        .dr-form-field textarea{ height:70px; padding:10px 12px; resize:none; }
        .dr-form-field input:focus, .dr-form-field select:focus, .dr-form-field textarea:focus{
          outline:none; border-color:#F5A623;
        }
        .dr-upload-box{
          grid-column:1 / -1; display:flex; align-items:center; gap:14px;
          border:1px dashed #D9DFEA; border-radius:10px; padding:14px; background:#FBFCFE;
        }
        .dr-upload-circle{
          width:56px; height:56px; border-radius:50%; background:#EEF1F5;
          display:flex; align-items:center; justify-content:center; color:#8291A8; flex-shrink:0;
        }
        .dr-upload-text{ font-size:12.5px; color:#5A6478; }
        .dr-upload-text b{ color:#1C2431; }

        .dr-modal-footer{
          display:flex; justify-content:flex-end; gap:10px; margin-top:20px;
          padding-top:16px; border-top:1px solid #ECEFF3;
        }
        .dr-btn-secondary{
          height:40px; padding:0 16px; border-radius:9px; border:1px solid #E2E6ED; background:#fff;
          font-size:13px; font-weight:600; color:#5A6478; cursor:pointer;
        }
        .dr-btn-secondary:hover{ border-color:#C7CEDC; }
        .dr-btn-primary{
          height:40px; padding:0 18px; border-radius:9px; border:none; background:#F5A623;
          font-size:13px; font-weight:600; color:#181008; cursor:pointer;
        }
        .dr-btn-primary:hover{ background:#E0941C; }
        .dr-btn-danger{
          height:40px; padding:0 18px; border-radius:9px; border:none; background:#E5594D;
          font-size:13px; font-weight:600; color:#fff; cursor:pointer;
        }
        .dr-btn-danger:hover{ background:#C4392E; }

        /* ---------- VIEW MODAL ---------- */
        .dr-view-hero{ display:flex; gap:16px; align-items:center; margin-bottom:18px; }
        .dr-view-photo{ width:76px; height:76px; border-radius:16px; object-fit:cover; border:1px solid #E7EAF0; }
        .dr-view-name{ font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; color:#101F38; }
        .dr-view-sub{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:#8291A8; margin-top:3px; }

        .dr-view-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; }
        .dr-view-stat{ background:#FBFCFE; border:1px solid #ECEFF3; border-radius:10px; padding:12px 14px; }
        .dr-view-stat .k{ font-size:11px; color:#8291A8; text-transform:uppercase; letter-spacing:.04em; }
        .dr-view-stat .v{ font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:700; color:#101F38; margin-top:4px; }

        .dr-view-list{ display:flex; flex-direction:column; gap:0; }
        .dr-view-row{ display:flex; justify-content:space-between; padding:9px 0; font-size:13px; border-bottom:1px solid #F1F3F7; }
        .dr-view-row:last-child{ border-bottom:none; }
        .dr-view-row .k{ color:#8291A8; }
        .dr-view-row .v{ color:#1C2431; font-weight:500; }

        @media (max-width: 1000px){
          .dr-searchbar{ grid-template-columns:1fr; }
          .dr-form-grid{ grid-template-columns:1fr; }
          .dr-view-grid{ grid-template-columns:1fr; }
        }
        @media (max-width: 860px){
          .dr-sidebar{ width:76px; padding:22px 10px; }
          .dr-sidebar-logo span, .dr-nav-item span, .dr-live-badge span{ display:none; }
          .dr-nav-item{ justify-content:center; }
          .dr-search-top{ display:none; }
        }
      `}</style>

      {/* ---------- SIDEBAR ---------- */}
      <div className="dr-sidebar">
        <div className="dr-sidebar-logo"><i /> <span>TransitOps</span></div>

        <div className="dr-nav">
          {navItems.map((n) => (
            <div className={`dr-nav-item ${n.active ? "active" : ""}`} key={n.label}>
              <n.icon size={17} /> <span>{n.label}</span>
            </div>
          ))}
        </div>

        <div className="dr-sidebar-footer">
          <span className="dr-live-badge"><span className="dr-live-dot" /> <span>LIVE NETWORK</span></span>
          <div className="dr-nav-item">
            <Settings size={17} /> <span>Settings</span>
          </div>
          <div className="dr-nav-item logout">
            <LogOut size={17} /> <span>Log Out</span>
          </div>
        </div>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="dr-main">
        <div className="dr-topbar">
          <div className="dr-search-top">
            <Search size={15} />
            <input placeholder="Search vehicles, drivers, trip IDs…" />
          </div>

          <div className="dr-nav-right">
            <div className="dr-bell">
              <Bell size={19} />
              <span className="dr-bell-dot" />
            </div>
            <div className="dr-top-divider" />
            <div className="dr-profile">
              <div className="dr-avatar">RM</div>
              <div>
                <div className="dr-profile-name">Rhea Malhotra</div>
                <div className="dr-role-tag">FLEET MANAGER</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dr-content">
          <div className="dr-header">
            <div>
              <h1>Driver Management</h1>
              <p>Manage driver profiles, licenses, availability, and safety.</p>
            </div>
            <button className="dr-add-btn" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Driver
            </button>
          </div>

          {/* ---------- SEARCH ---------- */}
          <div className="dr-searchbar">
            <div className="dr-search-field">
              <Users size={15} />
              <input
                placeholder="Search by driver name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="dr-search-field">
              <IdCard size={15} />
              <input placeholder="Search by employee ID…" />
            </div>
            <div className="dr-search-field">
              <ShieldCheck size={15} />
              <input placeholder="Search by license number…" />
            </div>
          </div>

          {/* ---------- FILTERS ---------- */}
          <div className="dr-filters">
            <div className="dr-filter">
              <label>Driver Status</label>
              <div className="dr-filter-select">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Status</option><option>Available</option><option>On Trip</option>
                  <option>Off Duty</option><option>Suspended</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="dr-filter">
              <label>License Category</label>
              <div className="dr-filter-select">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option>All Categories</option><option>LMV</option><option>HMV</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="dr-filter">
              <label>License Expiry</label>
              <div className="dr-filter-select">
                <select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
                  <option>Any Time</option><option>Next 7 Days</option>
                  <option>Next 30 Days</option><option>Already Expired</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="dr-filter">
              <label>Region</label>
              <div className="dr-filter-select">
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>All Regions</option><option>Central</option><option>Fairview</option>
                  <option>Oak Street</option><option>Terminal</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="dr-filter">
              <label>Sort By</label>
              <div className="dr-filter-select">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option>Name (A–Z)</option>
                  <option>Safety Score (High–Low)</option>
                  <option>License Expiry (Soonest)</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* ---------- SUMMARY CARDS ---------- */}
          <div className="dr-kpi-grid">
            {summaryCards.map((k) => (
              <div className="dr-kpi-card" key={k.label}>
                <div className="dr-kpi-top">
                  <div className={`dr-kpi-icon ${k.tone || ""}`}><k.icon size={17} /></div>
                </div>
                <div className="dr-kpi-value">{k.value}</div>
                <div className="dr-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* ---------- DRIVER GRID ---------- */}
          <div className="dr-section-card">
            <div className="dr-section-title">
              Drivers
              <span className="dr-section-sub">{filtered.length} of {driverList.length} shown</span>
            </div>

            {filtered.length === 0 ? (
              <div className="dr-empty">
                <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
                  <rect x="20" y="30" width="80" height="46" rx="10" fill="#F4F6FA" stroke="#E2E6ED" />
                  <circle cx="60" cy="46" r="12" fill="#E2E6ED" />
                  <path d="M42 70c0-10 8-16 18-16s18 6 18 16" stroke="#C7CEDC" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <circle cx="60" cy="20" r="8" fill="#F5A623" opacity="0.15" />
                </svg>
                <h3>No Drivers Found</h3>
                <p>Try adjusting your search or filters, or add a new driver to get started.</p>
                <button className="dr-add-btn" onClick={() => setShowAdd(true)}>
                  <Plus size={16} /> Add Driver
                </button>
              </div>
            ) : (
              <div className="dr-driver-grid">
                {filtered.map((d) => {
                  const meta = statusMeta[d.status];
                  const safetyColor = d.safety >= 85 ? "#1FA871" : d.safety >= 70 ? "#E0941C" : "#C4392E";
                  return (
                    <div className="dr-driver-card" key={d.id}>
                      <div className="dr-driver-top">
                        <img className="dr-driver-photo" src={d.photo} alt={d.name} />
                        <div className="dr-driver-id">
                          <div className="dr-driver-name">{d.name}</div>
                          <div className="dr-driver-empid">{d.id}</div>
                        </div>
                        <span className={`badge ${meta.badge}`}>
                          <span className="badge-dot" style={{ background: meta.dot }} /> {d.status}
                        </span>
                      </div>

                      <div className="dr-driver-meta">
                        <div className="dr-driver-meta-row">
                          <span className="k"><ShieldCheck size={13} /> License</span>
                          <span className="v mono">{d.license}</span>
                        </div>
                        <div className="dr-driver-meta-row">
                          <span className="k">Category</span>
                          <span className="v">{d.category}</span>
                        </div>
                        <div className="dr-driver-meta-row">
                          <span className="k">Expiry</span>
                          <span className="v">{d.expiry}</span>
                        </div>
                        <div className="dr-driver-meta-row">
                          <span className="k"><Phone size={13} /> Contact</span>
                          <span className="v">{d.phone}</span>
                        </div>
                        <div className="dr-driver-meta-row">
                          <span className="k">Vehicle</span>
                          <span className="v">{d.vehicle}</span>
                        </div>
                        <div className="dr-driver-meta-row">
                          <span className="k">Safety Score</span>
                          <span className="dr-safety-val" style={{ color: safetyColor }}>{d.safety}</span>
                        </div>
                        <div className="dr-safety-bar-wrap">
                          <div className="dr-safety-bar">
                            <div className="dr-safety-bar-fill" style={{ width: `${d.safety}%`, background: safetyColor }} />
                          </div>
                        </div>
                      </div>

                      <div className="dr-driver-footer">
                        <span className="dr-section-sub">ID {d.id}</span>
                        <div className="dr-driver-actions">
                          <button className="dr-icon-btn" onClick={() => setViewDriver(d)} title="View">
                            <Eye size={14} />
                          </button>
                          <button className="dr-icon-btn" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button className="dr-icon-btn danger" onClick={() => setDeleteTarget(d)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------- LICENSE ALERTS ---------- */}
          <div className="dr-alert-grid">
            {licenseAlerts.map((a) => (
              <div className="dr-alert-card" key={a.label}>
                <div className={`dr-alert-card-icon ${a.tone}`}><a.icon size={18} /></div>
                <div>
                  <div className="dr-alert-card-count">{a.count}</div>
                  <div className="dr-alert-card-label">{a.label}</div>
                  <div className="dr-alert-card-note">{a.note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- RECENT ACTIVITY ---------- */}
          <div className="dr-section-card">
            <div className="dr-section-title">Recent Driver Activity</div>
            <table className="dr-table">
              <thead>
                <tr>
                  <th>Driver</th><th>Vehicle</th><th>Activity</th><th>Date &amp; Time</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((r, i) => (
                  <tr key={i}>
                    <td>{r.driver}</td>
                    <td className="dr-mono">{r.vehicle}</td>
                    <td>{r.activity}</td>
                    <td className="dr-mono">{r.time}</td>
                    <td><span className={`badge ${statusMeta[r.status]?.badge || "badge-slate"}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- PERFORMANCE BAND ---------- */}
          <div className="dr-summary-band">
            {performance.map((p, i) => (
              <div className={`dr-summary-item ${i === performance.length - 1 ? "accent" : ""}`} key={p.label}>
                <div className="val">{p.value}</div>
                <div className="lbl">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- ADD DRIVER MODAL ---------- */}
      {showAdd && (
        <div className="dr-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="dr-modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="dr-modal-header">
              <h2>Add Driver</h2>
              <div className="dr-modal-close" onClick={() => setShowAdd(false)}><X size={16} /></div>
            </div>
            <div className="dr-modal-body">
              <form onSubmit={handleAddDriver}>
                <div className="dr-form-grid">
                  <div className="dr-upload-box">
                    <div className="dr-upload-circle"><Upload size={20} /></div>
                    <div className="dr-upload-text"><b>Upload a profile photo</b><br />PNG or JPG, up to 5MB</div>
                  </div>

                  <div className="dr-form-field">
                    <label>Full Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aditya Sharma" required />
                  </div>
                  <div className="dr-form-field">
                    <label>Employee ID</label>
                    <input value={form.empId} onChange={(e) => setForm({ ...form, empId: e.target.value })} placeholder="EMP-1050" required />
                  </div>

                  <div className="dr-form-field">
                    <label>Email Address</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@transitops.com" />
                  </div>
                  <div className="dr-form-field">
                    <label>Contact Number</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98250 00000" />
                  </div>

                  <div className="dr-form-field">
                    <label>License Number</label>
                    <input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="GJ-04 2024 0000000" />
                  </div>
                  <div className="dr-form-field">
                    <label>License Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option>LMV</option><option>HMV</option>
                    </select>
                  </div>

                  <div className="dr-form-field">
                    <label>License Expiry Date</label>
                    <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
                  </div>
                  <div className="dr-form-field">
                    <label>Safety Score</label>
                    <input type="number" min="0" max="100" value={form.safety} onChange={(e) => setForm({ ...form, safety: e.target.value })} />
                  </div>

                  <div className="dr-form-field full">
                    <label>Address</label>
                    <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Residential address" />
                  </div>

                  <div className="dr-form-field">
                    <label>Emergency Contact</label>
                    <input value={form.emergency} onChange={(e) => setForm({ ...form, emergency: e.target.value })} placeholder="Name and phone number" />
                  </div>
                  <div className="dr-form-field">
                    <label>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option>Available</option><option>On Trip</option><option>Off Duty</option><option>Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="dr-modal-footer">
                  <button type="button" className="dr-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="dr-btn-primary">Add Driver</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- VIEW DRIVER MODAL ---------- */}
      {viewDriver && (
        <div className="dr-modal-overlay" onClick={() => setViewDriver(null)}>
          <div className="dr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dr-modal-header">
              <h2>Driver Details</h2>
              <div className="dr-modal-close" onClick={() => setViewDriver(null)}><X size={16} /></div>
            </div>
            <div className="dr-modal-body">
              <div className="dr-view-hero">
                <img className="dr-view-photo" src={viewDriver.photo} alt={viewDriver.name} />
                <div>
                  <div className="dr-view-name">{viewDriver.name}</div>
                  <div className="dr-view-sub">{viewDriver.id} · {viewDriver.phone}</div>
                  <span className={`badge ${statusMeta[viewDriver.status].badge}`} style={{ marginTop: 8, display: "inline-flex" }}>
                    <span className="badge-dot" style={{ background: statusMeta[viewDriver.status].dot }} /> {viewDriver.status}
                  </span>
                </div>
              </div>

              <div className="dr-view-grid">
                <div className="dr-view-stat">
                  <div className="k">Assigned Vehicle</div>
                  <div className="v">{viewDriver.vehicle}</div>
                </div>
                <div className="dr-view-stat">
                  <div className="k">Current Trip</div>
                  <div className="v">{viewDriver.status === "On Trip" ? "TRP-3391 · Central → Terminal" : "None"}</div>
                </div>
                <div className="dr-view-stat">
                  <div className="k">Total Trips Completed</div>
                  <div className="v">642</div>
                </div>
                <div className="dr-view-stat">
                  <div className="k">Safety Score</div>
                  <div className="v">{viewDriver.safety} / 100</div>
                </div>
              </div>

              <div className="dr-section-title" style={{ fontSize: 13, marginBottom: 8 }}>Driver Information</div>
              <div className="dr-view-list" style={{ marginBottom: 18 }}>
                <div className="dr-view-row"><span className="k">License Number</span><span className="v">{viewDriver.license}</span></div>
                <div className="dr-view-row"><span className="k">License Category</span><span className="v">{viewDriver.category}</span></div>
                <div className="dr-view-row"><span className="k">License Status</span><span className="v"><CheckCircle2 size={13} style={{ verticalAlign: -2, color: "#1FA871" }} /> Valid, expires {viewDriver.expiry}</span></div>
                <div className="dr-view-row"><span className="k">Contact Number</span><span className="v">{viewDriver.phone}</span></div>
              </div>

              <div className="dr-section-title" style={{ fontSize: 13, marginBottom: 8 }}>Recent Activity</div>
              <div className="dr-view-list">
                <div className="dr-view-row"><span className="k">Today, 14:22</span><span className="v">Trip completed</span></div>
                <div className="dr-view-row"><span className="k">Yesterday, 09:10</span><span className="v">Shift started</span></div>
                <div className="dr-view-row"><span className="k">2 days ago</span><span className="v">Vehicle inspection passed</span></div>
              </div>

              <div className="dr-modal-footer">
                <button className="dr-btn-secondary" onClick={() => setViewDriver(null)}>Close</button>
                <button className="dr-btn-primary">Edit Driver</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DELETE CONFIRM MODAL ---------- */}
      {deleteTarget && (
        <div className="dr-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="dr-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="dr-modal-header">
              <h2>Remove Driver</h2>
              <div className="dr-modal-close" onClick={() => setDeleteTarget(null)}><X size={16} /></div>
            </div>
            <div className="dr-modal-body">
              <p style={{ fontSize: 13.5, color: "#33394A", lineHeight: 1.6 }}>
                Are you sure you want to remove <b>{deleteTarget.name}</b> ({deleteTarget.id}) from the driver roster? This cannot be undone.
              </p>
              <div className="dr-modal-footer">
                <button className="dr-btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="dr-btn-danger" onClick={handleDelete}>Remove Driver</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
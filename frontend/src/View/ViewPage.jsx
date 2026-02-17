import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ChevronRight, Target, BarChart3, TrendingUp,
         CalendarDays, Eye, AlertTriangle, ShieldCheck, MapPin, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, ConfigProvider } from "antd";
import useDepartmentStore from '../Store/useDepartmentStore';

// ─── UTILS ────────────────────────────────────────────────────
function getKpiType(kpi) {
  if (!kpi.threshold || kpi.threshold === 0) return "monitoring";
  return "target";
}

function getStatusStyle(status, type) {
  if (type === "monitoring")    return { bg:"bg-sky-50",     text:"text-sky-700",     dot:"bg-sky-400",     border:"border-sky-200"     };
  if (status === "ผ่าน")       return { bg:"bg-emerald-50", text:"text-emerald-700", dot:"bg-emerald-500", border:"border-emerald-200" };
  if (status === "ไม่ผ่าน")    return { bg:"bg-orange-50",  text:"text-orange-600",  dot:"bg-orange-400",  border:"border-orange-200"  };
  return                               { bg:"bg-slate-50",   text:"text-slate-500",   dot:"bg-slate-300",   border:"border-slate-200"   };
}

// ─── ORGANIC SHAPES ───────────────────────────────────────────
function OrgBlob({ className, style }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path fill="currentColor" d="M47,-57.2C59.4,-46.2,67,-29.5,70.3,-11.5C73.7,6.6,72.8,26,63.5,40.1C54.2,54.2,36.5,63,17.8,67.5C-0.9,72,-20.6,72.3,-36.6,64.4C-52.6,56.5,-64.9,40.4,-70.3,22.4C-75.7,4.4,-74.2,-15.4,-65.2,-30.8C-56.2,-46.2,-39.7,-57.2,-23,-63.5C-6.3,-69.8,12.6,-71.4,29,-65.1C45.4,-58.8,59.4,-44.7,47,-57.2Z" transform="translate(100 100)" />
    </svg>
  );
}

function OrgBlob2({ className, style }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path fill="currentColor" d="M38.5,-52.1C49.2,-41.6,56.7,-29.1,61.1,-14.8C65.5,-0.5,66.8,15.6,61.3,29.3C55.8,43,43.5,54.3,29.2,61.2C14.9,68.1,-1.4,70.6,-17.3,67C-33.2,63.4,-48.7,53.7,-57.8,40C-66.9,26.3,-69.6,8.6,-67.1,-8.5C-64.6,-25.6,-56.9,-42.1,-44.7,-52.5C-32.5,-62.9,-15.8,-67.2,-0.5,-66.6C14.8,-66,27.8,-62.6,38.5,-52.1Z" transform="translate(100 100)" />
    </svg>
  );
}

function OrgBlob3({ className, style }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path fill="currentColor" d="M53.2,-64.9C67.4,-53.1,76.1,-35.3,77.2,-17.4C78.3,0.4,71.8,18.3,61.5,33C51.2,47.7,37.1,59.2,20.6,66.1C4.1,73,-14.7,75.2,-30.3,69C-45.9,62.8,-58.3,48.1,-65.4,31.3C-72.5,14.4,-74.3,-4.6,-68.8,-21.1C-63.4,-37.6,-50.7,-51.6,-36.2,-63.2C-21.7,-74.9,-5.4,-84.3,10.5,-82C26.3,-79.7,39,-76.7,53.2,-64.9Z" transform="translate(100 100)" />
    </svg>
  );
}

// ─── SUMMARY BAR ─────────────────────────────────────────────
function SummaryBar({ departments }) {
  const all        = departments.flatMap(d => d.topic || []);
  const targets    = all.filter(k => getKpiType(k) === "target");
  const passed     = targets.filter(k => k.status === "ผ่าน").length;
  const inprogress = targets.filter(k => k.status === "ไม่ผ่าน").length;
  const monitoring = all.filter(k => getKpiType(k) === "monitoring").length;
  const pending    = targets.filter(k => k.status === "รอผล").length;

  const stats = [
    { label:"ทั้งหมด",         value: all.length,    Icon: BarChart3,     color:"text-slate-600",   bg:"bg-white",       border:"border-slate-200"   },
    { label:"ผ่านเกณฑ์",       value: passed,        Icon: ShieldCheck,   color:"text-emerald-600", bg:"bg-emerald-50",  border:"border-emerald-200" },
    { label:"ดำเนินการอยู่",   value: inprogress,    Icon: Clock,         color:"text-orange-600",  bg:"bg-orange-50",   border:"border-orange-200"  },
    { label:"ติดตาม",          value: monitoring,    Icon: Eye,           color:"text-sky-600",     bg:"bg-sky-50",      border:"border-sky-200"     },
    { label:"รอผล",            value: pending,       Icon: Target,        color:"text-amber-600",   bg:"bg-amber-50",    border:"border-amber-200"   },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm`}>
          <s.Icon size={20} className={s.color} />
          <div>
            <div className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── KPI ROW ─────────────────────────────────────────────────
function KpiRow({ kpi }) {
  const type = getKpiType(kpi);
  const s    = getStatusStyle(kpi.status, type);
  const label = type === "monitoring" ? "ติดตาม"
              : kpi.status === "ผ่าน"  ? `${kpi.percent?.toFixed(1) ?? "—"}%`
              : kpi.status === "ไม่ผ่าน" ? "ดำเนินการอยู่"
              : "—";

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${s.bg} border ${s.border}`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
      <span className="text-[11px] font-semibold text-slate-700 flex-1 leading-tight line-clamp-1">{kpi.title}</span>
      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${s.text}`}>{label}</span>
    </div>
  );
}

// ─── LEGEND ──────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-5">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">คำอธิบาย:</span>
      {[
        { dot:"bg-emerald-500", label:"ผ่านเกณฑ์"           },
        { dot:"bg-orange-400",  label:"ดำเนินการอยู่"        },
        { dot:"bg-sky-400",     label:"ติดตาม (ไม่มีเกณฑ์)" },
        { dot:"bg-slate-300",   label:"รอผล"                 },
      ].map((l) => (
        <div key={l.label} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />
          <span className="text-[10px] font-bold text-slate-500">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DEPT CARD (simplified) ───────────────────────────────────
const ICONS = [Target, BarChart3, Activity, TrendingUp, Users, Eye, ShieldCheck, MapPin, BarChart3];

function DeptCard({ dept, index }) {
  const navigate = useNavigate();
  const kpis = dept.topic || [];

  const targets = kpis.filter(k => getKpiType(k) === "target");
  const passed = targets.filter(k => k.status === "ผ่าน").length;
  const inprogress = targets.filter(k => k.status === "ไม่ผ่าน").length;
  const monitoring = kpis.filter(k => getKpiType(k) === "monitoring").length;

  const hasData = kpis.length > 0;
  const Icon = ICONS[index % ICONS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hasData ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.25 }}
      onClick={() => hasData && navigate(`/department/${dept.key}`)}
      className={`
        relative border bg-white flex flex-col rounded-2xl overflow-hidden
        ${hasData
          ? "border-slate-300 hover:border-[#0d3b2e] hover:shadow-xl transition-all cursor-pointer"
          : "border-slate-200 bg-slate-100 opacity-60"}
      `}
    >
     {/* HEADER */}
<div className="px-6 py-5 border-b border-slate-200 bg-[#0d3b2e] text-white">
  {/* ใช้ items-start เพื่อให้สัดส่วนไม่เพี้ยนเวลาพาดหัวยาว */}
  <div className="flex items-start justify-between gap-6"> 
    
    {/* ส่วนชื่อกลุ่มงาน: เพิ่ม flex-1 เพื่อให้ขยายตามจริง */}
    <div className="flex items-start gap-4 flex-1">
      <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white/10 border border-white/20 rounded-xl mt-1">
        <Icon size={20} />
      </div>

      <div className="min-w-0"> {/* min-w-0 ช่วยเรื่อง text-wrap ใน flexbox */}
        <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
          กลุ่มงาน
        </p>
        <h3 className="text-base font-bold leading-snug break-words">
          {dept.title.replace("กลุ่มงาน", "").trim()}
        </h3>
      </div>
    </div>

    {/* ส่วน KPIs: ใช้ flex-shrink-0 เพื่อไม่ให้โดนชื่อกลุ่มงานเบียดจนผอม */}
    <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-widest">
          KPIs
        </p>
        <p className="text-2xl font-bold leading-none">
          {kpis.length}
        </p>
      </div>

      {hasData && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
        </div>
      )}
    </div>
  </div>
</div>
      {/* BODY */}
      {hasData && (
        <div className="grid grid-cols-3 text-center divide-x divide-slate-200">
          
          <div className="py-5 flex flex-col items-center gap-1">
            <p className="text-lg font-bold text-emerald-700">{passed}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                ผ่าน
              </p>
            </div>
          </div>

          <div className="py-5 flex flex-col items-center gap-1">
            <p className="text-lg font-bold text-amber-600">{inprogress}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                รอดำเนินการ
              </p>
            </div>
          </div>

          <div className="py-5 flex flex-col items-center gap-1">
            <p className="text-lg font-bold text-sky-700">{monitoring}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                ติดตาม
              </p>
            </div>
          </div>

        </div>
      )}

      {/* FOOTER */}
      <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-slate-500">
          OPEN MATRIX
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </div>
    </motion.div>
  );
}




// ─── MAIN PAGE ────────────────────────────────────────────────
export default function PhayaoHub() {
  const { departments, fetchDepartments, isLoading } = useDepartmentStore();
  const [fiscalYear, setFiscalYear] = useState(2569);

  useEffect(() => { fetchDepartments(fiscalYear); }, [fiscalYear, fetchDepartments]);

  const sorted = useMemo(() =>
    [...departments].sort((a, b) => (b.topic?.length || 0) - (a.topic?.length || 0)),
    [departments]
  );
return (
  <ConfigProvider theme={{ token:{ colorPrimary:'#059669', borderRadius:12, fontFamily:'Kanit' } }}>
    <div className="min-h-screen bg-[#f0f7f4] font-kanit relative overflow-x-hidden">

      {/* ───────── DOT DEPTH BACKGROUND ───────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

        {/* small grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(13,92,58,0.25) 1px, transparent 1px)`,
            backgroundSize: '26px 26px'
          }}
        />

        {/* large soft grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(16,185,129,0.18) 2px, transparent 2px)`,
            backgroundSize: '90px 90px',
            filter: 'blur(1.2px)'
          }}
        />

        {/* ambient glow */}
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[140px]"
        />

        {/* fade bottom for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-[#f0f7f4]" />
      </div>
      {/* ──────────────────────────────────────── */}

      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 z-30 shadow-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d5c3a 0%, #0e6b44 60%, #1a7a52 100%)" }}
      >
        <OrgBlob className="absolute -top-10 -right-10 w-52 h-52 opacity-10 text-white pointer-events-none" />
        <OrgBlob2 className="absolute -bottom-14 left-10 w-44 h-44 opacity-[0.07] text-emerald-200 pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
              <OrgBlob className="absolute inset-0 w-full h-full text-emerald-400 opacity-30" />
              <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 relative z-10">
                <Activity className="text-white" size={18} />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-none tracking-tight drop-shadow">
                ศูนย์ข้อมูลสุขภาพ <span className="text-emerald-200">จังหวัดพะเยา</span>
              </h1>
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mt-0.5">
                Phayao Provincial Health Data Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
              <span className="text-[9px] font-black text-emerald-200 uppercase tracking-widest">Live</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <CalendarDays size={13} className="text-white/60" />
              <span className="text-[10px] font-bold text-white/60">ปีงบประมาณ</span>
              <Select
                defaultValue={2569}
                variant="borderless"
                size="small"
                style={{ width: 90 }}
                onChange={setFiscalYear}
                options={[{ value:2569, label:<span className="font-black text-emerald-200 text-xs">2569</span> }]}
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden leading-[0] -mb-px">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0,20 C200,40 400,0 600,20 C800,40 1000,5 1200,22 C1320,32 1400,18 1440,20 L1440,40 L0,40 Z" fill="#f0f7f4" />
          </svg>
        </div>
      </header>

      {/* ── BODY ── */}
      <main className="max-w-screen-xl mx-auto px-8 py-8 relative z-10">

        <OrgBlob className="absolute top-[-60px] right-[-80px] w-[380px] h-[380px] text-emerald-300 opacity-25 pointer-events-none" />
        <OrgBlob2 className="absolute top-[300px] left-[-100px] w-[320px] h-[320px] text-teal-300 opacity-20 pointer-events-none" />
        <OrgBlob3 className="absolute bottom-[100px] right-[-60px] w-[280px] h-[280px] text-emerald-200 opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} /> ภาพรวมตัวชี้วัด · ปีงบประมาณ {fiscalYear}
            </p>
            <h2 className="text-2xl font-black text-slate-800">
              ติดตามตัวชี้วัด <span className="text-[#0d5c3a]">กลุ่มงาน</span>
            </h2>
          </div>

          {!isLoading && <SummaryBar departments={departments} />}
          {!isLoading && <Legend />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {isLoading
                ? <div className="col-span-full py-24 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-base font-bold text-slate-400">กำลังโหลดข้อมูล...</p>
                  </div>
                : sorted.map((dept, i) => <DeptCard key={dept.id} dept={dept} index={i} />)
              }
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style global jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;900&display=swap');
      `}</style>
    </div>
  </ConfigProvider>
);

}
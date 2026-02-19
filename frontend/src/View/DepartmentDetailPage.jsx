import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Activity, ChevronRight, Globe2, Fingerprint, 
  Target, CheckCircle2, XCircle, Clock,AlertCircle, Inbox, Eye, Search
} from "lucide-react";
import { Progress, ConfigProvider } from "antd";
import useDepartmentStore from "../Store/useDepartmentStore";

// ─── ANIMATIONS ───────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  exit: { opacity: 0, filter: "blur(10px)", transition: { duration: 0.3 } }
};

const itemVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

// ─── KPI CARD (Updated Shadow & "ติดตาม" Label) ──────────────────
function KpiCard({ item, index }) {
  const isMonitor = !item.threshold || item.threshold === 0;
  const isPassed  = item.status === "ผ่าน";
  const hasValue  = item.percent !== null && item.percent !== undefined;
  
  // Dynamic Theme Logic
  let themeColor = "#94a3b8"; // Default Slate
  let StatusIcon = <AlertCircle size={10} />;
  let statusLabel = "Pending";

  if (isMonitor) {
    themeColor = "#0ea5e9"; // Sky 500
    StatusIcon = <Activity size={10} />;
    statusLabel = "ติดตาม";
  } else if (isPassed) {
    themeColor = "#10b981"; // Emerald 500
    StatusIcon = <CheckCircle2 size={10} />;
    statusLabel = "Target Met";
} else if (hasValue) {
  themeColor = "#f59e0b"; // Amber 500
  StatusIcon = <Clock size={10} />;
  statusLabel = "กำลังดำเนินการ";
}
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        y: -6, 
        transition: { duration: 0.3 },
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12)" 
      }}
      // เพิ่ม shadow ประจำการ์ดที่นี่ เพื่อไม่ให้กลืนกับพื้นหลัง
      className="group bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] hover:bg-white transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Background Decor for Monitoring */}
      {isMonitor && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
      )}

      {/* Header Badge */}
      <div className="flex items-center justify-between relative z-10">
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors"
          style={{ 
            color: themeColor, 
            backgroundColor: `${themeColor}12`, 
            borderColor: `${themeColor}30` 
          }}
        >
          {StatusIcon} {statusLabel}
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
          KPI_{String(index + 1).padStart(2, "0")}
        </span>
      </div>

     {/* Main Content */}
<div className="flex items-start gap-5 relative z-10">
  {isMonitor ? (
    // ติดตาม → ไม่มีวงกลม แสดงชื่อใหญ่เลย
    <div className="flex-1">
      <h3 className="text-base font-black text-sky-700 leading-snug group-hover:text-sky-800 transition-colors">
        {item.title}
      </h3>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        <p className="text-[10px] text-sky-600 font-bold uppercase tracking-tight">รายการติดตามผลคืบหน้า</p>
      </div>
    </div>
  ) : (
    // KPI ปกติ → มีวงกลม + ชื่อข้างๆ
    <>
      <div className="flex-shrink-0">
        <div className="drop-shadow-sm">
          <Progress
            type="circle"
            percent={item.percent || 0}
            size={76}
            strokeWidth={10}
            strokeColor={themeColor}
            trailColor={`${themeColor}15`}
            format={(p) => (
              <div className="flex flex-col items-center leading-none">
                <span className="text-[15px] font-black text-slate-800">
                  {`${p}%`}
                </span>
              </div>
            )}
          />
        </div>
      </div>
      <div className="flex-1 pt-1">
        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-3 group-hover:text-emerald-800 transition-colors">
          {item.title}
        </h3>
      </div>
    </>
  )}
</div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 relative z-10">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
          {!isMonitor ? (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Target size={12} className="text-emerald-500" />
              <span>Goal <span className="text-slate-800 font-black">{item.threshold}%</span></span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sky-600/80">
              <Search size={12} />
              <span>ติดตามการดำเนินงาน</span>
            </div>
          )}
          {item.weight && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Fingerprint size={12} className="text-teal-500" />
              <span className="text-slate-800 font-black">{item.weight}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => item.url && window.open(item.url, "_blank")}
          className="w-9 h-9 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#064e3b] group-hover:text-white group-hover:rotate-[-45deg] transition-all shadow-md flex-shrink-0"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────
export default function DepartmentDetailPage() {
  const { departmentKey } = useParams();
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const department = departments.find((dept) => dept.key === departmentKey);

  if (!department) return null;

  const topics = department.topic || [];
  const hasData = topics.length > 0;
  
  // Analytics for Header
  const monitoringCount = topics.filter(k => !k.threshold || k.threshold === 0).length;
  const targetCount = topics.length - monitoringCount;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#10b981', fontFamily: 'Kanit' } }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={departmentKey}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen w-full relative bg-[#f8faf9] font-kanit overflow-x-hidden"
        >
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, backgroundImage: `radial-gradient(circle, #065f46 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.1 }} />

          {/* Hero Section */}
          <div className="absolute top-0 left-0 w-full h-[70vh] bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f766e] overflow-hidden z-0">
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-emerald-400/10 rounded-full blur-[120px]"
            />
            <div className="absolute bottom-[-2px] left-0 w-full">
              <svg viewBox="0 0 1440 320" className="w-full h-auto" preserveAspectRatio="none">
                <path fill="#f8faf9" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,122.7C672,128,768,192,864,224C960,256,1056,256,1152,229.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">

            {/* Return Button */}
            <motion.button
              variants={itemVariants}
              onClick={() => navigate("/")}
              className="mb-14 group flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 text-white transition-all shadow-2xl"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1.5 transition-transform" />
              <span className="text-xs font-black tracking-[0.3em] uppercase">Return to Hub</span>
            </motion.button>

            {/* Hero Content */}
            <header className="mb-20 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12">
              <motion.div variants={itemVariants} className="max-w-3xl text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 w-12 bg-emerald-400 rounded-full" />
                  <span className="text-xs uppercase tracking-[0.6em] font-black text-emerald-200">Department Overview</span>
                </div>
                <h1 className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter drop-shadow-2xl leading-[0.85] uppercase italic">
                  {department.title.replace('กลุ่มงาน', '').trim()}
                </h1>
              </motion.div>

              {/* Stats Bar */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-2xl p-8 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white flex items-center gap-10">
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-black">Performance</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-emerald-600 leading-none">{targetCount}</span>
                      <span className="text-xs font-bold text-slate-300">KPIs</span>
                    </div>
                  </div>
                  <div className="w-[1px] h-12 bg-slate-100 self-center" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-sky-500 mb-2 font-black">ติดตาม</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-sky-500 leading-none">{monitoringCount}</span>
                      <span className="text-xs font-bold text-slate-300">Units</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner">
                  <Fingerprint className="text-emerald-500" size={32} />
                </div>
              </motion.div>
            </header>
<div className="bg-gradient-to-br from-emerald-950/40 to-teal-900/20 backdrop-blur-md rounded-3xl border border-emerald-800/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-6">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
    <div className="lg:col-span-12">
      <motion.div variants={itemVariants} className="flex items-center gap-5 mb-8 px-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-100">Live Matrix Stream</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-700/50 to-transparent" />
      </motion.div>

      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map((item, index) => (
            <KpiCard key={index} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-emerald-950/30 rounded-[4rem] border-4 border-dashed border-emerald-800/40 shadow-xl flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-900/40 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Inbox size={40} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-emerald-300/50 uppercase tracking-widest">No Active Matrix Found</h3>
          <p className="text-emerald-400/40 mt-2 font-medium">This unit is currently being configured.</p>
        </div>
      )}
    </div>
  </div>
</div>
          </div>
        </motion.div>
      </AnimatePresence>

      <style global jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800;900&display=swap');
        .ant-progress-circle .ant-progress-text {
          transition: all 0.3s ease;
        }
      `}</style>
    </ConfigProvider>
  );
}
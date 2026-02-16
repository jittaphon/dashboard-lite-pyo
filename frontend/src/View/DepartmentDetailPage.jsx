import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Activity, ChevronRight, Globe2, Sparkles, Fingerprint, Leaf, Inbox 
} from "lucide-react";
import useDepartmentStore from "../Store/useDepartmentStore";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  exit: { opacity: 0, filter: "blur(10px)", transition: { duration: 0.3 } }
};

const itemVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function DepartmentDetailPage() {
  const { departmentKey } = useParams();
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const department = departments.find((dept) => dept.key === departmentKey);

  if (!department) return null;

  const hasData = department.topic && department.topic.length > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={departmentKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen w-full relative bg-[#f8faf9] font-kanit overflow-x-hidden"
      >
        {/* --- 1. Background Dot Matrix (บังคับเต็มจอแน่นอน) --- */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 1, // อยู่บนสุดของพื้นหลัง แต่อยู่ใต้ Content
            backgroundImage: `radial-gradient(circle, #065f46 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            opacity: 0.15 // ปรับความชัดของจุดตรงนี้
          }}
        />

        {/* --- 2. Emerald Header Background --- */}
        <div className="absolute top-0 left-0 w-full h-[65vh] bg-emerald-600 overflow-hidden z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1], 
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-20 w-[800px] h-[800px] bg-emerald-400 rounded-full blur-[120px]" 
          />
          
          <div className="absolute bottom-[-2px] left-0 w-full fill-[#f8faf9]">
            <svg viewBox="0 0 1440 400" className="w-full h-auto" preserveAspectRatio="none">
              <path d="M0,224L80,213.3C160,203,320,181,480,197.3C640,213,800,267,960,277.3C1120,288,1280,256,1360,240L1440,224L1440,400L1360,400C1280,400,1120,400,960,400C800,400,640,400,480,400C320,400,160,400,80,400L0,400Z"></path>
            </svg>
          </div>
        </div>

        {/* --- 3. Content Area --- */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-20">
          
          {/* Back Button */}
          <motion.button 
            variants={itemVariants}
            onClick={() => navigate("/")}
            className="mb-12 group flex items-center gap-3 bg-black/10 hover:bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 text-white transition-all shadow-xl"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Gateway</span>
          </motion.button>

          {/* Header Title */}
          <header className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <motion.div variants={itemVariants} className="max-w-2xl text-white">
              <div className="flex items-center gap-3 mb-6 opacity-80">
                <div className="w-8 h-[1px] bg-white" />
                <span className="text-[10px] uppercase tracking-[0.5em] font-medium">Strategic Unit Identification</span>
              </div>
              <h1 className="text-6xl md:text-6xl font-black italic tracking-tighter drop-shadow-2xl leading-[0.85] uppercase">
                {department.title.split('|')[0]} <br/>
                <span className="text-emerald-200 drop-shadow-xl">{department.title.split('|')[1]}</span>
              </h1>
            </motion.div>

            {/* Metric Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-md p-10 rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-2xl transition-all group-hover:bg-emerald-500/10" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-800/40 mb-2 font-black">Data_KPI</p>
              <div className="flex items-end gap-5">
                <span className="text-7xl font-black text-emerald-600 leading-none">
                    {String(department.topic?.length || 0).padStart(2, '0')}
                </span>
                <Fingerprint className="text-emerald-100 mb-1" size={45} />
              </div>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* List Section with Unified Glass Cover */}
            <div className="lg:col-span-7">
              <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8 px-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-900/40">Subject Stream</span>
                <div className="h-[1px] flex-1 bg-emerald-900/10" />
              </motion.div>

              {/* กระจกครอบแบบใสเห็นจุดด้านหลัง */}
              <div className="relative p-3 sm:p-6 bg-white/20 backdrop-blur-2xl rounded-[4rem] border border-white/40 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.06)] transition-all">
                <div className="space-y-5">
                  {hasData ? (
                    department.topic.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ x: 12, scale: 1.01 }}
                        onClick={() => item.url ? window.open(item.url, "_blank") : navigate(`/department/${departmentKey}/topic/${item.key}`)}
                        className="group bg-white/95 p-8 rounded-[2.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgb(0,0,0,0.08)] border border-white hover:border-emerald-100 flex items-center gap-8 cursor-pointer transition-all duration-500"
                      >
                        <div className="w-16 h-16 rounded-[1.8rem] bg-emerald-50 text-emerald-500 flex items-center justify-center transition-all duration-500 group-hover:rounded-full group-hover:bg-emerald-500 group-hover:text-white">
                          {item.url ? <Globe2 size={28} /> : <Sparkles size={28} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 opacity-40">
                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Node_{index + 1}</p>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight">
                            {item.title}
                          </h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                          <ChevronRight size={22} />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-20 text-center text-emerald-900/20">No Data</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5">
              <motion.div 
                variants={itemVariants}
                className="sticky top-10 p-12 bg-[#011a14] rounded-[4rem] text-white shadow-[0_50px_100px_rgba(1,26,20,0.25)] overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400">Unit Intelligence</h3>
                  </div>
                  <p className="text-emerald-100/40 font-light leading-relaxed mb-12 text-lg italic">
                    "การขับเคลื่อนยุทธศาสตร์ผ่านชุดข้อมูลที่มีความเชื่อมโยงกันอย่างเป็นระบบ เพื่ออนาคตของจังหวัดพะเยาในปี 2026"
                  </p>
                  <div className="p-7 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-between group transition-all hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <Activity size={24} className="text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">Network Status</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full">OPTIMAL</span>
                  </div>
                </div>
              </motion.div>
            </aside>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
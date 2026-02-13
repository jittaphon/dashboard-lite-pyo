import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, ArrowRight, Menu, X, Home, BarChart2, Settings, Info, Image, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDepartmentStore from '../Store/useDepartmentStore';

export default function PhayaoHeatmapDashboard() {
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State สำหรับควบคุม Phayao Health Modal
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  const departmentImages = useMemo(() => ({
    cdc: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=1000",
    narcotics_and_mental_health: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000",
    health_promotion: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=1000",
     ncd_control: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=1000&auto=format&fit=crop",
    health_insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1000",
    dental_health: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1000",
    env_occ_health: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000",
    thai_traditional_medicine: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000",
    digital_health: "https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg?auto=compress&cs=tinysrgb&w=1000", 
  }), []);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const sortedDepartments = [...departments].sort((a, b) => 
    (b.topic?.length || 0) - (a.topic?.length || 0)
  ).slice(0, 9);

  return (
    <div className="h-screen w-full bg-[#0f172a] text-white font-kanit relative overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="relative z-30 p-5 flex justify-between items-center bg-gradient-to-r from-emerald-600/95 to-teal-600/95 shadow-xl border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none uppercase italic">Phayao <span className="text-emerald-200">Strategic</span></h1>
              <p className="text-[9px] font-bold text-emerald-100/60 tracking-[0.3em] uppercase mt-1">Strategic Health Data Kpi</p>
            </div>

            {/* ปุ่ม Health Modal ข้างชื่อเว็บ */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsHealthModalOpen(true)}
              className="flex items-center gap-2 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              <HeartPulse size={18} className="text-emerald-300 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-tighter">Health Modal</span>
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/30 px-5 py-2 rounded-full border border-white/20">
          <Clock size={16} className="text-emerald-300" />
          <span className="font-mono font-bold text-lg">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </header>
{/* Main Grid */}
<main className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto lg:overflow-hidden">
  {sortedDepartments.map((dept, index) => {
    const count = dept.topic?.length || 0;
    const isActive = count > 0;
    const bgImg = departmentImages[dept.key] || "https://images.unsplash.com/photo-1557683316-973673baf926";

    return (
      <motion.div
        key={dept.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ zIndex: 20 }}
        onClick={() => navigate(`/department/${dept.key}`)}
        className="relative cursor-pointer group overflow-hidden border-[0.5px] border-white/5 flex flex-col justify-end p-8 bg-slate-900 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:30px_30px]"
      >
        {/* 1. Background Image */}
        <motion.div 
          className={`absolute inset-0 z-0 transition-opacity duration-700 ${isActive ? 'opacity-30 group-hover:opacity-50' : 'opacity-10 grayscale'}`}
          style={{ 
            backgroundImage: `url(${bgImg})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          whileHover={isActive ? { scale: 1.1 } : {}}
          transition={{ duration: 0.8 }}
        />

        {/* 2. Glass Shine Effect */}
        <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 overflow-hidden">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1200ms] bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
        </div>

        {/* 3. Watermark Number */}
        <span className="absolute top-0 right-4 text-[10rem] font-black text-white/[0.1] select-none pointer-events-none transition-all duration-700 group-hover:text-emerald-500/[0.1] group-hover:-translate-y-4 italic leading-none z-0">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* 4. Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

        {/* 5. Content Layer */}
        <div className="relative z-20 w-full">
          <div className="flex justify-between items-center mb-4">
            {isActive ? (
              <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">KPI Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5 opacity-60">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No Data</span>
              </div>
            )}
          </div>

          <h3 className={`text-2xl font-black leading-tight mb-4 drop-shadow-2xl transition-all duration-500 ${isActive ? 'text-white group-hover:translate-x-1' : 'text-white/40'}`}>
            {dept.title.replace('|', '\n').split('\n').map((line, i) => (
              <span key={i} className="block">{line.trim()}</span>
            ))}
          </h3>

          <div className="flex items-end justify-between pt-4 border-t border-white/5">
            <div className="flex items-baseline gap-2">
              <span className={`text-7xl font-black tracking-tighter transition-all duration-500 ${isActive ? 'text-white' : 'text-white/10'}`}>
                {count}
              </span>
              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}>KPIs</span>
                <span className="text-[10px] font-bold uppercase text-white/20 tracking-tighter italic">Collected</span>
              </div>
            </div>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border 
              ${isActive 
                ? 'bg-white/5 border-white/10 group-hover:bg-emerald-600 group-hover:border-emerald-400 group-hover:rotate-[-10deg] shadow-xl shadow-emerald-900/20' 
                : 'bg-transparent border-white/5 opacity-20'}`}>
              <ArrowRight size={28} className={`transition-transform duration-500 ${isActive ? 'text-white group-hover:scale-110' : 'text-white/20'}`} />
            </div>
          </div>
        </div>

        {/* 6. Animated Bottom Progress Line */}
        {isActive && (
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(count * 10, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 h-[4px] z-30"
            style={{ 
              background: `linear-gradient(90deg, transparent, #10b981, transparent)`,
              boxShadow: '0 0 15px rgba(16,185,129,0.6)'
            }}
          />
        )}
      </motion.div>
    );
  })}
</main>

      {/* --- PHAYAO HEALTH MODAL (ส่วนแสดงรูปภาพ planner.jpg) --- */}
      <AnimatePresence>
        {isHealthModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/30 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <HeartPulse size={24} className="text-white" />
                  <h2 className="text-xl font-black italic uppercase tracking-tight">Phayao Health Planner</h2>
                </div>
                <button 
                  onClick={() => setIsHealthModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content - รูปภาพ Planner */}
              <div className="p-4 md:p-8 overflow-y-auto bg-[#0f172a] flex-1 flex flex-col items-center">
                <div className="relative group w-full max-w-4xl rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                  <img 
                    src="http://203.157.189.9/datahub/kpi-pyo-hub/public/images/planner.jpg" 
                    alt="Phayao Health Strategic Planner" 
                    className="w-full h-auto object-contain rounded-2xl"
                  />
                </div>
                
                <div className="mt-6 text-center">
                   <p className="text-emerald-400 font-black text-xl italic uppercase tracking-widest">
                      Digital Transformation Roadmap
                   </p>
                   <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                      Phayao Provincial Public Health Office Information System
                   </p>
                </div>
              </div>

              <div className="p-4 bg-black/40 border-t border-white/5 text-center">
                <button 
                  onClick={() => setIsHealthModalOpen(false)}
                  className="text-xs font-black uppercase text-emerald-500 hover:text-emerald-400 tracking-widest"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Menu Modal (คงเดิม) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase">Main Menu</h2>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                <MenuOption icon={<Home />} label="Dashboard" onClick={() => {navigate('/'); setIsMenuOpen(false);}} />
                <MenuOption icon={<BarChart2 />} label="Statistics" onClick={() => setIsMenuOpen(false)} />
                <MenuOption 
                  icon={<Image />} 
                  label="Planner" 
                  onClick={() => {
                    setIsHealthModalOpen(true);
                    setIsMenuOpen(false);
                  }} 
                  highlight 
                />
                <MenuOption icon={<Settings />} label="Settings" onClick={() => setIsMenuOpen(false)} />
                <MenuOption icon={<Info />} label="About" onClick={() => setIsMenuOpen(false)} />
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Phayao Provincial Public Health Office</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;900&display=swap');
        body { margin: 0; padding: 0; overflow: hidden; background: #020617; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function MenuOption({ icon, label, onClick, highlight = false }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all group border
        ${highlight 
          ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/30' 
          : 'bg-white/5 border-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/50'
        }`}
    >
      <div className={`mb-3 transition-transform group-hover:scale-110 
        ${highlight ? 'text-emerald-300' : 'text-emerald-400'}`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
    </button>
  );
}
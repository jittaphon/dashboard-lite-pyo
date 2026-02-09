import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Activity, Zap, Globe, LayoutGrid, X, Shield, Target, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDepartmentStore from '../Store/useDepartmentStore';

export default function PhayaoImageDashboard() {
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const [isLoaded, setIsLoaded] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showModel, setShowModel] = useState(false); 

  useEffect(() => {
    setIsLoaded(true);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const departmentImages = useMemo(() => ({
    cdc: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=1000",
    narcotics_and_mental_health: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000",
    health_promotion: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=1000",
    ncd_control: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=1000&auto=format&fit=crop",
    health_insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1000",
    dental_health: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1000",
    env_occ_health: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000",
    thai_traditional_medicine: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000",
  }), []);

  const mophIcon = "https://pyo.moph.go.th/datahub/dash_data/public/images/icon.png";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 50, damping: 20 } }
  };

  return (
    <div className="h-screen w-full bg-[#022c22] text-white font-kanit overflow-hidden relative selection:bg-emerald-500/30 transform-gpu">
      
      {/* 1. Grain Noise Overlay */}
      <div className="fixed inset-0 z-[60] pointer-events-none opacity-[0.03] mix-blend-overlay" 
            style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

      {/* 2. Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 left-0 w-full z-[70] p-8 flex justify-between items-start pointer-events-none"
      >
        <div className="flex items-center gap-6 pointer-events-auto group">
          <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-2xl border border-white/20 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <img src={mophIcon} alt="MOPH" className="w-16 h-16 object-contain" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-[-0.05em] uppercase leading-none">
              PHAYAO <span className="text-emerald-300 drop-shadow-[0_0_15px_rgba(110,231,183,0.5)]">STRATEGIC</span>
            </h1>
            <div className="flex items-center gap-3">
               <div className="h-[1px] w-8 bg-emerald-500/50"></div>
               <p className="text-[10px] font-mono tracking-[0.5em] text-emerald-400/60 uppercase">System Data Hub 2026</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end pointer-events-auto bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={10} className="text-emerald-400 animate-spin" />
            <span className="text-[9px] font-mono tracking-[0.2em] text-emerald-400/80 uppercase">Node-PYO: Active</span>
          </div>
          <span className="text-xl font-black font-mono tracking-widest text-white/90">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </motion.header>

      {/* --- Main Interactive Accordion --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="flex w-full h-full items-stretch relative z-10"
      >
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            variants={itemVariants}
            onClick={() => navigate(`/department/${dept.key}`)}
            className="relative flex-1 flex flex-col justify-between overflow-hidden will-change-[flex,transform] transition-[flex] duration-[700ms] ease-[cubic-bezier(0.2,1,0.2,1)] cursor-pointer border-r border-white/5 bg-[#022c22] hover:flex-[10] group"
          >
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <img 
                src={departmentImages[dept.key] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"} 
                alt={dept.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-10 group-hover:opacity-40 transition-all duration-[1000ms] group-hover:scale-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-transparent to-[#022c22]" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
              <div className="p-8 pt-48 transition-transform duration-500">
                <span className="text-6xl font-black font-mono text-white/5 group-hover:text-emerald-400/10 italic block">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                 <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
  <h3 className="text-[20px] font-black whitespace-nowrap -rotate-90 uppercase tracking-[0.5em] text-white/60 group-hover:text-emerald-400 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
    {dept.title.replace('|', ' ')}
  </h3>
</div>
              </div>

              <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-20 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 translate-y-8 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                 <div className="max-w-4xl flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                        <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/20"><LayoutGrid size={16} className="text-emerald-400" /></div>
                        <span className="text-[10px] font-mono tracking-[0.4em] text-emerald-400/80 uppercase">Cluster::{dept.key}</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.9] text-white mb-10 uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                        {dept.title.split('|').map((line, i) => (<span key={i} className="block">{line}</span>))}
                      </h2>
                      <div className="flex items-center justify-center md:justify-start gap-6">
                         <button className="flex items-center gap-4 px-10 py-5 bg-white text-[#022c22] rounded-2xl font-black text-xs hover:bg-emerald-400 hover:text-white transition-all active:scale-95 uppercase tracking-widest shadow-2xl">
                           Explore Data <ArrowUpRight size={18} />
                         </button>
                         <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-mono text-white/40 uppercase mb-1">Metrics Tracked</span>
                            <span className="text-xl font-black text-white">{dept.topic?.length || 0} Indicators</span>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6 shrink-0">
                      <div className="flex gap-2 h-24 items-end">
                        {(() => {
                          const tc = dept.topic?.length || 0;
                          if (tc === 0) return [...Array(5)].map((_, i) => <div key={i} className="w-2.5 h-4 bg-white/5 rounded-full" />);
                          return [...Array(tc)].map((_, i) => (
                            <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${30 + (i * (60 / tc))}px` }} className="w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                          ));
                        })()}
                      </div>
                      <div className="text-right leading-none">
                        <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-[0.4em] mb-2">Operational Status</p>
                        <div className="flex items-baseline justify-end gap-2">
                          <span className="text-6xl font-black italic text-white">{String(dept.topic?.length || 0).padStart(2, '0')}</span>
                          <span className="text-2xl font-bold text-white/20 italic">ACTIVE</span>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 flex justify-between items-end border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
                    <span className="text-[8px] font-mono tracking-[0.2em] text-white/30 uppercase">Node_Status: Ready</span>
                </div>
              {/* --- ส่วนปุ่ม Zap ที่เพิ่มตัวเลขแจ้งเตือน --- */}
<div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-transparent transition-all duration-700 relative">
  <Zap size={18} className="text-white/20 group-hover:text-white" />
  
  {/* ส่วนที่เพิ่ม: Badge แสดงจำนวน Topics */}
  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#022c22] transition-colors duration-500 ${
    (dept.topic?.length || 0) > 0 
      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
      : 'bg-red-500/80 text-white' // แสดงสีแดงถ้าไม่มีหัวข้อ (0)
  }`}>
    {dept.topic?.length || 0}
  </div>
</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* --- White Circle Button: Bottom Right --- */}
      <div className="absolute bottom-8 right-8 z-[120]">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowModel(true); }}
          className="group relative flex items-center justify-center w-20 h-20 bg-white hover:bg-emerald-400 transition-all rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-emerald-500/40 active:scale-90"
        >
          <Target className="text-[#022c22] group-hover:text-white transition-colors" size={32} />
          
          {/* Label Tooltip - Left Side of Circle */}
          <div className="absolute right-24 opacity-0 group-hover:opacity-100 transition-all pointer-events-none flex flex-col items-end">
            <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-[0.3em]">Phayao</span>
            <span className="text-sm font-black text-white italic uppercase whitespace-nowrap">Strategic Model</span>
          </div>
        </button>
      </div>

    {/* --- Strategic Model Central Modal --- */}
<AnimatePresence>
  {showModel && (
    <>
      {/* 1. Backdrop (พื้นหลังมืดเบลอ) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowModel(false)}
        className="fixed inset-0 z-[150] bg-emerald-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
      />

      {/* 2. Central Modal Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 m-auto z-[160] w-full max-w-5xl h-fit max-h-[90vh] bg-[#022c22] border border-white/20 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col"
      >
        {/* Header - Glassmorphism style */}
        <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-[#022c22] to-transparent">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Target size={20} className="text-white" />
            </div>
            <div>
             
           
            </div>
          </div>
          
          <button 
            onClick={() => setShowModel(false)}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 flex items-center justify-center transition-all group"
          >
            <X size={24} className="text-white group-hover:scale-110" />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative w-full h-full overflow-y-auto custom-scrollbar pt-24 p-4 md:p-8">
          <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-black/20">
            <img 
              src="https://pyo.moph.go.th/datahub/dash_data/public/images/planner.jpg" 
              alt="Phayao Strategic Planner"
              className="w-full h-auto object-contain block"
            />
            
            {/* Scanline Effect (Overlay ให้ดูเท่ขึ้น) */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </div>

         
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;900&display=swap');
        body { margin: 0; background-color: #022c22; font-family: 'Kanit', sans-serif; overflow: hidden; -webkit-font-smoothing: antialiased; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
        * { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
      `}</style>
    </div>
  );
}
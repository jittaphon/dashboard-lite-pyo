import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, ChevronRight, Target, BarChart3, 
  AlertCircle, TrendingUp, Inbox, CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, ConfigProvider, theme as antTheme } from "antd";
import useDepartmentStore from '../Store/useDepartmentStore';

export default function PhayaoCompactSeamless() {
  const navigate = useNavigate();
  const { departments, fetchDepartments, isLoading } = useDepartmentStore();
  const [fiscalYear, setFiscalYear] = useState(2569);

  useEffect(() => {
    fetchDepartments(fiscalYear);
  }, [fiscalYear, fetchDepartments]);

  const sortedDepartments = useMemo(() => {
    return [...departments].sort((a, b) => (b.topic?.length || 0) - (a.topic?.length || 0));
  }, [departments]);

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#059669', borderRadius: 12, fontFamily: 'Kanit' },
      }}
    >
      {/* BG และ Nav ใช้สีเดียวกันแบบไร้รอยต่อ */}
      <div className="min-h-screen w-full bg-[#f1f8f5] text-slate-900 font-kanit relative pb-20">
        
        {/* 🌿 Organic Backdrop Decorations */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[40%] bg-lime-200/30 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        {/* 🛰️ Seamless Navbar (No Border, Transparent) */}
        <header className="relative z-20 px-12 py-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <Activity className="text-emerald-300" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-[#064e3b] leading-none uppercase">
                Phayao<span className="text-emerald-500">Hub</span>
              </h1>
              <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-[0.3em] mt-1">Intelligence Dashboard</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 text-emerald-800/40 font-bold text-xs">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             SYSTEM ONLINE | {new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
          </div>
        </header>

        {/* 📊 Main Section */}
        <main className="relative z-10 px-12">
          
          {/* Header & Year Selector (ย้ายมาไว้ตรงนี้เพื่อให้สัมพันธ์กับข้อมูล) */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={18} className="text-emerald-600" />
                 <span className="text-xs font-black text-emerald-700/60 uppercase tracking-widest">Dashboard Priority View</span>
               </div>
               <h2 className="text-5xl font-black text-[#064e3b] tracking-tighter">
                 Strategic <span className="text-emerald-500 italic">Matrix</span>
               </h2>
            </div>

            {/* 🔥 New Year Selector Position: สวย กระชับ และหาพิกัดง่าย */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black text-emerald-800/50 uppercase ml-1 flex items-center gap-1">
                  <CalendarDays size={12} /> เลือกปีงบประมาณ
                </span>
                <div className="bg-white/60 p-1.5 rounded-2xl shadow-sm border border-emerald-100 backdrop-blur-md">
                    <Select
                      defaultValue={2569}
                      variant="borderless"
                      style={{ width: 180 }}
                      onChange={(val) => setFiscalYear(val)}
                      className="compact-select"
                      options={[
                        { value: 2569, label: <span className="font-bold text-emerald-800">ปีงบประมาณ 2569</span> },
                        { value: 2570, label: <span className="font-bold text-emerald-800">ปีงบประมาณ 2570</span> },
                      ]}
                    />
                </div>
            </div>
          </div>

          {/* 🧩 Grid Layout: ปรับ Card ให้เล็กลง (Compact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="col-span-full py-20 flex justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                sortedDepartments.map((dept, index) => {
                  const hasData = (dept.topic?.length || 0) > 0;
                  return (
                    <motion.div
                      key={dept.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => navigate(`/department/${dept.key}`)}
                      className={`group relative h-[240px] rounded-[2.5rem] p-7 cursor-pointer transition-all duration-500 border-2 overflow-hidden flex flex-col justify-between
                        ${hasData 
                          ? "bg-white border-white shadow-[0_15px_35px_-10px_rgba(5,150,105,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(5,150,105,0.18)] hover:border-emerald-400 hover:-translate-y-2" 
                          : "bg-slate-100/50 border-slate-200 grayscale-[0.8] opacity-70"}`}
                    >
                      {/* Organic Shape Decor */}
                      <div className={`absolute top-[-25%] right-[-15%] w-32 h-32 rounded-full transition-all duration-700
                        ${hasData ? "bg-emerald-50 group-hover:bg-emerald-500" : "bg-slate-200"}`} 
                      />
                      
                      <div className="relative z-10 flex justify-between items-start">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md
                          ${hasData ? "bg-[#064e3b] text-emerald-400 group-hover:scale-110" : "bg-slate-400 text-white"}`}>
                          {index % 2 === 0 ? <Target size={24} /> : <BarChart3 size={24} />}
                        </div>
                        <div className="text-right">
                          <span className={`text-4xl font-black italic leading-none transition-colors
                            ${hasData ? "text-[#064e3b] group-hover:text-emerald-700" : "text-slate-300"}`}>
                            {dept.topic?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className={`text-lg font-black leading-tight mb-4 transition-colors uppercase
                          ${hasData ? "text-[#064e3b] group-hover:text-emerald-800" : "text-slate-500"}`}>
                          {dept.title.split('|')[0]}
                        </h3>
                        
                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                           {hasData ? (
                             <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Active Matrix</span>
                           ) : (
                             <div className="flex items-center gap-1 text-rose-400 text-[9px] font-black uppercase">
                                <AlertCircle size={10} /> ไม่มีข้อมูล
                             </div>
                           )}
                           <ChevronRight size={18} className={hasData ? "text-emerald-400" : "text-slate-300"} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </main>

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;700;900&display=swap');
          body { background: #f1f8f5; }
          .compact-select .ant-select-selection-item {
            font-size: 15px !important;
            font-weight: 900 !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}
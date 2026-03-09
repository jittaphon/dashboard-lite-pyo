import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 1. import useNavigate
import { Activity, CalendarDays, LayoutDashboard, Search, ChevronDown, UserCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, ConfigProvider } from "antd";
import useDepartmentStore from '../Store/useDepartmentStore';
import AdminButton from "../components/AdminButton"; // นำเข้า AdminButton
// Components
import SummaryBar from '../components/SummaryBar';
import DeptCard from '../components/DeptCard';

export default function PhayaoHub() {
  const navigate = useNavigate(); // 2. ประกาศตัวแปร navigate
  const { departments, fetchDepartments, isLoading } = useDepartmentStore();
  const [fiscalYear, setFiscalYear] = useState(2569);

  useEffect(() => { 
    fetchDepartments(fiscalYear); 
  }, [fiscalYear, fetchDepartments]);

  const sorted = useMemo(() =>
    [...departments].sort((a, b) => (b.topic?.length || 0) - (a.topic?.length || 0)),
    [departments]
  );

  return (
    <ConfigProvider 
      theme={{ 
        token: { 
          colorPrimary: '#10b981', 
          borderRadius: 20, 
          fontFamily: 'Kanit',
          colorBgContainer: '#064e3b',
          colorText: '#ffffff',
        },
        components: {
          Select: {
            colorBgElevated: '#065f46',
            colorTextOptionSelected: '#34d399',
            controlHeight: 42,
            optionSelectedBg: 'rgba(52, 211, 153, 0.1)'
          }
        }
      }}
    >
      <div className="min-h-screen font-kanit relative overflow-x-hidden selection:bg-emerald-400/30 text-white pb-20">
        
        {/* 🟢 Background Layer */}
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900" />
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-300/10 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
  
  {/* 1. HEADER SECTION: เพิ่ม Sticky และ z-50 เพื่อไม่ให้เนื้อหา Main ทับ */}
  <header className="sticky top-0 z-50 px-4 sm:px-8 py-6 pointer-events-none">
    <nav className="max-w-[1600px] mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] px-8 py-4 flex items-center justify-between shadow-2xl pointer-events-auto">
      <div className="flex items-center gap-5 cursor-pointer" onClick={() => navigate('/')}>
        <div className="relative w-12 h-12 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <LayoutDashboard className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter leading-none">
            PHAYAO <span className="text-emerald-300">DATA HUB</span>
          </h1>
          <p className="text-[9px] font-medium text-emerald-100/40 uppercase tracking-[0.3em] mt-1">Health Intelligence Unit</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input 
            type="text" 
            placeholder="Search data..." 
            className="bg-white/5 border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 w-64 transition-all text-white placeholder:text-white/30" 
          />
        </div>
        <AdminButton />
      </div>
    </nav>
  </header>

  {/* 2. MAIN SECTION: ใส่ z-10 และจัดการระยะห่างให้สัมพันธ์กับ Sticky Header */}
  <main className="relative z-10 flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-8">
    
    {/* HERO & SUMMARY */}
    <section className="px-6 py-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-center">
        <div className="xl:col-span-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/30">
              <Activity size={12} className="animate-pulse" /> Live Metrics
            </div>
            
            <h2 className="text-5xl font-black tracking-tight leading-[1.1] mb-8">
              ระบบติดตาม <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-white">
                ตัวชี้วัดสุขภาพ จังหวัดพะเยา
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-4">
              {/* SELECT YEAR */}
              <div className="flex items-center gap-4 bg-black/30 backdrop-blur-xl border border-white/10 p-2 rounded-[1.5rem] shadow-inner">
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-400/20">
                  <CalendarDays size={18} className="text-emerald-300" />
                  <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">ปีงบ</span>
                </div>
                <Select
                  defaultValue={2569}
                  variant="borderless"
                  suffixIcon={<ChevronDown size={16} className="text-emerald-400" />}
                  className="min-w-[100px] font-black text-lg"
                  onChange={setFiscalYear}
                  options={[
                    { value: 2569, label: <span className="text-white text-lg font-black">2569</span> },
                    //{ value: 2568, label: <span className="text-white text-lg font-black">2568</span> },
                    
                  ]}
                />
              </div>

              {/* Legend Status */}
              <div className="flex items-center gap-6 bg-black/20 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2.5 group">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-40" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-300 uppercase tracking-[0.15em]">ผ่าน</span>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="flex items-center gap-2.5 group">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse opacity-50" />
                  </div>
                  <span className="text-[11px] font-black text-orange-400 uppercase tracking-[0.15em]">รอดำเนินการ</span>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="flex items-center gap-2.5 group">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span className="text-[11px] font-black text-sky-300 uppercase tracking-[0.15em]">ติดตาม</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="xl:col-span-7">
          {!isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
               <SummaryBar departments={departments} />
            </motion.div>
          )}
        </div>
      </div>
    </section>

    {/* 3. CARD LIST SECTION: เพิ่ม Margin Bottom เพื่อไม่ให้เนื้อหาชิดขอบจอเกินไป */}
    <section className="relative p-8 sm:p-12 rounded-[4rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] mb-12">
        <div className="flex items-center justify-between mb-12 px-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-emerald-400 rounded-full" />
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-300/80">
              Department Matrix Overview
            </h3>
          </div>
          <div className="hidden sm:block text-[10px] font-bold text-white/20 uppercase tracking-widest text-nowrap">
            Total {sorted.length} Units
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <LoadingState />
            ) : (
              sorted.map((dept, i) => (
                <motion.div
                  key={dept.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <DeptCard dept={dept} index={i} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
    </section>
    
  </main>
</div>
      </div>
    </ConfigProvider>
  );
}

function LoadingState() {
  return (
    <div className="col-span-full py-40 flex flex-col items-center justify-center">
      <div className="w-14 h-14 border-4 border-emerald-400/10 border-t-emerald-400 rounded-full animate-spin" />
      <p className="mt-6 font-bold text-emerald-400/40 uppercase text-[10px] tracking-[0.3em]">Processing Matrix...</p>
    </div>
  );
}
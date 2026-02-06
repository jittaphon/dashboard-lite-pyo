import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ExternalLink, Activity, Target, Zap, 
  BarChart3, ChevronRight, CheckCircle2, Globe2, AlertCircle 
} from "lucide-react";
import useDepartmentStore from "../Store/useDepartmentStore";

export default function DepartmentDetailPage() {
  const { departmentKey } = useParams();
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const [isVisible, setIsVisible] = useState(false);

  const department = departments.find((dept) => dept.key === departmentKey);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => navigate("/"), 400);
  };

  if (!department) return null;

  return (
    // 1. พื้นหลังใช้สีที่คุณส่งมา: bg-[#022c22]
    <div className="min-h-screen w-full relative overflow-hidden bg-[#022c22] font-kanit text-slate-100">
      
      {/* 2. Background Layer - Emerald Gradient Control ตามสีที่คุณเป๊ะๆ */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950 via-[#064e3b] to-[#022c22] z-0" />
      
      {/* Grid Dots Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(52,211,153,0.3) 1px, transparent 0)`, backgroundSize: '24px 24px' }} />

      <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-10 transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        
        {/* Header - Strategic Info */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-10">
          <div className="flex items-center gap-6">
            <button onClick={handleBack} className="p-4 bg-white/5 hover:bg-emerald-500/20 rounded-2xl border border-white/10 transition-all group backdrop-blur-sm">
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[2px] w-12 bg-emerald-400" />
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.4em]">Phayao Health Strategic Hub</p>
              </div>
              <h1 className="text-2xl md:text-1xl font-black italic tracking-tighter uppercase leading-none text-white">
                {department.title.replace('|', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-black/30 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
              <p className="text-[10px] text-white/40 uppercase mb-1 font-mono">Metrics_Tracked</p>
              <p className="text-3xl font-black text-white">{department.topic?.length || 0}</p>
            </div>
            <div className="flex-1 md:flex-none bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 p-5 rounded-2xl">
              <p className="text-[10px] text-emerald-400 uppercase mb-1 font-mono">Sync_Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                <p className="text-xl font-black text-emerald-400 tracking-tight">LIVE</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Indicators List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2 mb-6 text-white/60">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-emerald-400" />
                <h2 className="text-lg font-bold uppercase tracking-widest italic">Performance Node</h2>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Updated: 2026-02-06</span>
            </div>

            {department.topic?.map((item, index) => {
              // 3. Logic จัดการ URL: ถ้ามี link ให้เปิดใหม่ ถ้าไม่มีให้ไปหน้าย่อย
              const isExternal = item.url && item.url.trim() !== "";
              
              const handleClick = () => {
                if (isExternal) {
                  window.open(item.url, "_blank", "noopener,noreferrer");
                } else {
                  navigate(`/department/${departmentKey}/topic/${item.key}`);
                }
              };

              return (
                <div
                  key={index}
                  onClick={handleClick}
                  className={`group relative border transition-all duration-300 cursor-pointer flex items-center gap-6 p-5 rounded-2xl overflow-hidden
                    ${isExternal 
                      ? 'bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-400/50 shadow-lg shadow-cyan-900/10' 
                      : 'bg-white/5 border-white/10 hover:border-emerald-400/40 shadow-lg shadow-emerald-900/10'
                    }`}
                >
                  {/* Status Side Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isExternal ? 'bg-cyan-500' : 'bg-emerald-500'} opacity-50`} />

                  {/* Icon Node */}
                  <div className={`flex w-14 h-14 rounded-2xl items-center justify-center border transition-all duration-500
                    ${isExternal 
                      ? 'bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500 text-cyan-400 group-hover:text-white' 
                      : 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-white'}`}>
                    {isExternal ? <Globe2 size={24} /> : <Activity size={24} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${
                        isExternal ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      }`}>
                        {isExternal ? 'EXTERNAL_LINK' : 'INTERNAL_DATA'}
                      </span>
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter truncate">REF::{item.key}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors truncate leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Progress Preview (Visual ONLY) */}
                  <div className="hidden md:flex flex-col items-end gap-1.5 min-w-[120px]">
                    <div className="flex justify-between w-full">
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Achieved</span>
                      <span className={`text-[10px] font-black ${isExternal ? 'text-cyan-400' : 'text-emerald-400'}`}>82%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        isExternal ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      }`} style={{ width: '82%' }} />
                    </div>
                  </div>

                  {/* Action Icon */}
                  <div className={`p-2 rounded-xl border transition-all ${
                    isExternal 
                    ? 'bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500 text-cyan-400 group-hover:text-white' 
                    : 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-white'
                  }`}>
                    {isExternal ? <ExternalLink size={20} /> : <ChevronRight size={20} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-b from-white/10 to-transparent p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group/card backdrop-blur-sm">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover/card:bg-emerald-500/20 transition-all" />
              
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-emerald-400" />
                <h3 className="font-black italic uppercase tracking-widest text-sm">Strategic Insight</h3>
              </div>
              
              <p className="text-sm text-white/60 leading-relaxed mb-8">
                ชุดข้อมูลในกลุ่มงานนี้ถูกออกแบบมาเพื่อติดตามความก้าวหน้าตามยุทธศาสตร์สาธารณสุขจังหวัดพะเยา โดยเน้นผลลัพธ์ที่วัดผลได้จริง (Measurable Outcomes)
              </p>

              <div className="space-y-3">
                {[
                  { label: "Data Integrity", val: "98.2%", icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
                  { label: "Goal Consistency", val: "On Track", icon: <Zap size={14} className="text-orange-400" /> },
                  { label: "External Connect", val: "Verified", icon: <Globe2 size={14} className="text-cyan-400" /> }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-3 text-white/50">
                      {stat.icon}
                      <span className="text-[11px] font-bold uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="font-mono text-white font-black text-xs tracking-tight">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[2rem] flex items-start gap-4">
              <AlertCircle className="text-orange-400 shrink-0" size={20} />
              <div>
                <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Attention Required</h4>
                <p className="text-[11px] text-orange-200/60 leading-normal font-medium">ข้อมูลลิงก์ภายนอกเชื่อมโยงกับระบบ HDC กลาง โปรดตรวจสอบความพร้อมของอินเทอร์เน็ต</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
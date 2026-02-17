import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, ChevronRight, Target, BarChart3, 
  AlertCircle, TrendingUp, CalendarDays, CheckCircle2, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, ConfigProvider, Progress } from "antd";
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
      <div className="min-h-screen w-full bg-[#f1f8f5] text-slate-900 font-kanit relative pb-20">
        
        {/* 🌿 Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <header className="relative z-20 px-12 py-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="text-emerald-300" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#064e3b] leading-none uppercase">
                Phayao<span className="text-emerald-500">Hub</span>
              </h1>
              <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-[0.3em] mt-1">Intelligence Dashboard</p>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={18} className="text-emerald-600" />
                 <span className="text-xs font-black text-emerald-700/60 uppercase tracking-widest">Strategic Overview</span>
               </div>
               <h2 className="text-5xl font-black text-[#064e3b] tracking-tighter">
                 Strategic <span className="text-emerald-500 italic">Matrix</span>
               </h2>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black text-emerald-800/50 uppercase ml-1 flex items-center gap-1">
                  <CalendarDays size={12} /> ปีงบประมาณ
                </span>
                <div className="bg-white/60 p-1.5 rounded-2xl shadow-sm border border-emerald-100 backdrop-blur-md">
                    <Select
                      defaultValue={2569}
                      variant="borderless"
                      style={{ width: 180 }}
                      onChange={(val) => setFiscalYear(val)}
                      options={[
                        { value: 2569, label: <span className="font-bold text-emerald-800">2569</span> },
                      ]}
                    />
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="col-span-full py-20 flex justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                sortedDepartments.map((dept, index) => {
                  const kpis = dept.topic || [];
                  const passedCount = kpis.filter(k => k.status === "ผ่าน").length;
                  const totalWithData = kpis.filter(k => k.percent !== null).length;
                  const hasData = kpis.length > 0;

                  return (
                    <motion.div
                      key={dept.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate(`/department/${dept.key}`)}
                      className={`group relative min-h-[280px] rounded-[2.5rem] p-6 cursor-pointer transition-all duration-500 border-2 flex flex-col justify-between overflow-hidden
                        ${hasData ? "bg-white border-white shadow-xl hover:-translate-y-2 hover:border-emerald-400" : "bg-slate-100/50 border-slate-200 grayscale opacity-70"}`}
                    >
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasData ? "bg-emerald-900 text-emerald-400" : "bg-slate-300"}`}>
                            {index % 2 === 0 ? <Target size={20} /> : <BarChart3 size={20} />}
                          </div>
                          {hasData && (
                            <div className="text-right">
                               <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">KPIs</div>
                               <div className="text-2xl font-black text-emerald-900">{kpis.length}</div>
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-black leading-tight text-emerald-950 mb-4 line-clamp-2">
                          {dept.title.replace('กลุ่มงาน', '')}
                        </h3>

                        {hasData && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Performance</span>
                              <span className="text-xs font-black text-emerald-600">{passedCount}/{kpis.length} ผ่าน</span>
                            </div>
                            <Progress 
                              percent={kpis.length > 0 ? (passedCount / kpis.length) * 100 : 0} 
                              showInfo={false}
                              strokeColor={passedCount === kpis.length ? '#059669' : '#10b981'}
                              trailColor="#f1f5f9"
                              strokeWidth={6}
                            />
                            
                            {/* KPI Mini Status List */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {kpis.slice(0, 6).map((kpi, idx) => (
                                <div key={idx} title={kpi.title}>
                                  {kpi.status === "ผ่าน" ? (
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                  ) : kpi.status === "ไม่ผ่าน" ? (
                                    <XCircle size={14} className="text-rose-400" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />
                                  )}
                                </div>
                              ))}
                              {kpis.length > 6 && <span className="text-[9px] font-bold text-slate-400">+{kpis.length - 6}</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 pt-4 border-t border-slate-50 flex items-center justify-between">
                         <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${hasData ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                           {hasData ? "Active View" : "No Data"}
                         </span>
                         <ChevronRight size={18} className={hasData ? "text-emerald-300 group-hover:text-emerald-600" : "text-slate-300"} />
                      </div>

                      {/* Decoration Gradient */}
                      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 ${hasData ? "bg-emerald-100/50 group-hover:opacity-100 opacity-0" : "hidden"}`} />
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
        `}</style>
      </div>
    </ConfigProvider>
  );
}
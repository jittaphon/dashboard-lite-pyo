import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Activity, ChevronRight, Globe2, Sparkles, Fingerprint, 
  Target, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Progress, ConfigProvider } from "antd";
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
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#10b981', fontFamily: 'Kanit' },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={departmentKey}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen w-full relative bg-[#f8faf9] font-kanit overflow-x-hidden"
        >
          {/* Background Decor */}
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, backgroundImage: `radial-gradient(circle, #065f46 1px, transparent 1px)`, backgroundSize: '30px 30px', opacity: 0.15 }} />
          
          <div className="absolute top-0 left-0 w-full h-[65vh] bg-gradient-to-br from-emerald-600 to-teal-700 overflow-hidden z-0">
             {/* Animated Orb */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-emerald-400/30 rounded-full blur-[100px]" 
            />
            <div className="absolute bottom-[-2px] left-0 w-full fill-[#f8faf9]">
              <svg viewBox="0 0 1440 400" className="w-full h-auto" preserveAspectRatio="none">
                <path d="M0,224L80,213.3C160,203,320,181,480,197.3C640,213,800,267,960,277.3C1120,288,1280,256,1360,240L1440,224L1440,400L1360,400C1280,400,1120,400,960,400C800,400,640,400,480,400C320,400,160,400,80,400L0,400Z"></path>
              </svg>
            </div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-20">
            <motion.button 
              variants={itemVariants}
              onClick={() => navigate("/")}
              className="mb-12 group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 text-white transition-all shadow-xl"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Back to Hub</span>
            </motion.button>

            <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
              <motion.div variants={itemVariants} className="max-w-2xl text-white">
                <div className="flex items-center gap-3 mb-4 opacity-80">
                  <div className="w-8 h-[1px] bg-white" />
                  <span className="text-[10px] uppercase tracking-[0.5em] font-medium">Strategic Unit Identification</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter drop-shadow-2xl leading-[0.9] uppercase">
                  {department.title.replace('กลุ่มงาน', '')}
                </h1>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-md p-8 rounded-[3rem] shadow-2xl border border-white flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-800/40 mb-1 font-black">Total_KPIs</p>
                  <span className="text-5xl font-black text-emerald-600 leading-none">
                    {String(department.topic?.length || 0).padStart(2, '0')}
                  </span>
                </div>
                <div className="w-[1px] h-12 bg-emerald-100" />
                <Fingerprint className="text-emerald-500/20" size={40} />
              </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-6">
                <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4 px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-900/40">Performance Stream</span>
                  <div className="h-[1px] flex-1 bg-emerald-900/10" />
                </motion.div>

                {hasData ? (
                  department.topic.map((item, index) => {
                    const isPassed = item.status === "ผ่าน";
                    const hasValue = item.percent !== null;
                    
                    return (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ x: 10 }}
                        className="group bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:bg-white transition-all duration-500 flex flex-col sm:flex-row items-center gap-6"
                      >
                        {/* Donut Chart Section */}
                        <div className="relative flex-shrink-0">
                          <Progress
                            type="circle"
                            percent={item.percent || 0}
                            size={100}
                            strokeWidth={10}
                            strokeColor={isPassed ? "#10b981" : item.percent === null ? "#e2e8f0" : "#fb7185"}
                            format={(percent) => (
                              <div className="flex flex-col items-center">
                                <span className="text-lg font-black text-slate-800 leading-none">{percent}%</span>
                                <span className="text-[8px] uppercase font-bold text-slate-400">Result</span>
                              </div>
                            )}
                          />
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                             {isPassed ? (
                               <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                 <CheckCircle2 size={12} /> Target Met
                               </div>
                             ) : hasValue ? (
                               <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                 <XCircle size={12} /> Below Target
                               </div>
                             ) : (
                               <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                 <AlertCircle size={12} /> Pending
                               </div>
                             )}
                             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Node_{index + 1}</span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {item.title}
                          </h3>

                          <div className="flex items-center justify-center sm:justify-start gap-6 text-[11px] font-bold">
                             <div className="flex items-center gap-1.5 text-slate-500">
                               <Target size={14} className="text-emerald-500" />
                               <span>เป้าหมาย: <span className="text-slate-800">{item.threshold}%</span></span>
                             </div>
                             {item.weight && (
                               <div className="flex items-center gap-1.5 text-slate-500">
                                 <Activity size={14} className="text-teal-500" />
                                 <span>ค่าน้ำหนัก: <span className="text-slate-800">{item.weight}</span></span>
                               </div>
                             )}
                          </div>
                        </div>

                        {/* Action Section */}
                        <button 
                          onClick={() => item.url && window.open(item.url, "_blank")}
                          className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="p-20 text-center bg-white/40 rounded-[3rem] border border-dashed border-emerald-200">
                    <Inbox size={48} className="mx-auto mb-4 text-emerald-200" />
                    <p className="text-emerald-900/40 font-bold uppercase tracking-widest">No Active Matrix</p>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4">
                <motion.div 
                  variants={itemVariants}
                  className="sticky top-10 p-10 bg-[#011a14] rounded-[3.5rem] text-white shadow-2xl overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400">Analysis Mode</h3>
                    </div>
                    <p className="text-emerald-100/60 font-medium leading-relaxed mb-10 italic text-lg">
                      "การวิเคราะห์ข้อมูลเชิงลึกรายตัวชี้วัด เพื่อประเมินประสิทธิภาพการดำเนินงานแบบ Real-time"
                    </p>
                    
                    <div className="space-y-4">
                      <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <Globe2 size={20} className="text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Live Updates</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                      </div>
                      
                      <div className="p-6 bg-emerald-500 rounded-[2rem] text-emerald-950 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all">
                        <span className="text-xs font-black uppercase tracking-widest">Report Generator</span>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </aside>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </ConfigProvider>
  );
}
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, FileText, Plus, Search, ArrowLeft, Save, Trash2, 
  Clock, Activity, ChevronRight, Layout, Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfigProvider, InputNumber, message, Input, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import useDepartmentStore from '../../Store/useDepartmentStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    departments, 
    fetchDepartments, 
    isLoading, 
    saveKpiAction, 
    deleteKpiAction 
  } = useDepartmentStore();

  const [fiscalYear, setFiscalYear] = useState(2569);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [currentKpis, setCurrentKpis] = useState([]);

  useEffect(() => {
    fetchDepartments(fiscalYear);
  }, [fiscalYear, fetchDepartments]);

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    const preparedKpis = (dept.topic || []).map((kpi, idx) => ({
      ...kpi,
      tempKey: kpi.id ? `old-${kpi.id}` : `new-${Date.now()}-${idx}`
    }));
    setCurrentKpis(preparedKpis);
  };

  const handleDeleteKpi = async (kpiId, tempKey) => {
    try {
      if (kpiId) {
        await deleteKpiAction(kpiId);
        message.success('ลบข้อมูลเรียบร้อย');
      }
      setCurrentKpis(prev => prev.filter(k => k.tempKey !== tempKey));
      fetchDepartments(fiscalYear, true);
    } catch (error) {
      message.error('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleSaveAllKpis = async () => {
    const hasEmpty = currentKpis.some(k => !k.key || !k.title);
    if (hasEmpty) return message.warning('กรุณากรอกข้อมูลให้ครบถ้วน');

    const hide = message.loading('กำลังบันทึกข้อมูล...', 0);
    try {
      await Promise.all(currentKpis.map(kpi => 
        saveKpiAction({
          kpi_id: kpi.id, 
          group_id: selectedDept.id,
          kpi_code: kpi.key,
          kpi_name: kpi.title,
          threshold: kpi.threshold, // ปล่อยเป็น null ได้ถ้าเป็นโหมดติดตาม
          weight: kpi.weight || 1,
          year: fiscalYear,
          report_url: kpi.url || ''
        })
      ));
      message.success('อัปเดตข้อมูลสำเร็จ');
      fetchDepartments(fiscalYear, true);
    } catch (error) {
      message.error('ล้มเหลว: ' + error.message);
    } finally {
      hide();
    }
  };

  const filteredDepts = useMemo(() => 
    departments.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())),
    [departments, searchTerm]
  );

  return (
    <ConfigProvider 
      theme={{ 
        token: { colorPrimary: '#007e70', borderRadius: 12, fontFamily: 'Kanit, sans-serif' },
        components: { Input: { colorBgContainer: '#f5f5f7' } }
      }}
    >
      <div className="h-screen flex flex-col bg-[#fbfbfd] text-[#1d1d1f] overflow-hidden font-kanit">
        
        {/* 1. TOP NAVIGATION */}
        <nav className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="group p-2 hover:bg-emerald-50 rounded-full transition-all">
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-[#007e70]" />
            </button>
            <div className="flex items-center gap-3 border-l pl-4 border-gray-100">
              <div className="w-9 h-9 bg-gradient-to-br from-[#007e70] to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-black text-[15px] tracking-tight block leading-none text-slate-800">HEALTH REGISTRY</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Administrator Control</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="hidden md:block">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Live Synchronization</div>
              <div className="text-[10px] text-emerald-500 flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> ระบบพร้อมใช้งาน
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-slate-400"><Users size={20} /></div>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          
          {/* 2. LEFT SIDEBAR */}
          <aside className="w-[380px] border-r border-gray-200/60 bg-white flex flex-col z-20 shadow-sm">
            {/* Year & Search Section */}
            <div className="p-5 bg-slate-50/50 border-b border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">ปีงบประมาณ</span>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200/50">
                  {[2568, 2569].map(year => (
                    <button 
                      key={year}
                      onClick={() => setFiscalYear(year)}
                      className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                        fiscalYear === year ? 'bg-[#007e70] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      FY {year}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" placeholder="ค้นหากลุ่มงาน..." 
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Dept List */}
            <div className="flex-1 overflow-y-auto apple-scrollbar bg-white">
              {isLoading ? (
                <div className="h-full flex items-center justify-center flex-col gap-3">
                  <div className="w-6 h-6 border-2 border-[#007e70] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredDepts.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => handleSelectDept(dept)}
                      className={`w-full text-left p-5 transition-all flex items-center justify-between group relative ${
                        selectedDept?.id === dept.id ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      {selectedDept?.id === dept.id && (
                        <motion.div layoutId="active-bar" className="absolute left-0 w-1 h-3/5 bg-[#007e70] rounded-r-full" />
                      )}
                      <div className="flex-1 pr-4 ml-2">
                        <div className={`font-bold text-[14px] mb-1 ${selectedDept?.id === dept.id ? 'text-[#007e70]' : 'text-slate-700'}`}>{dept.title}</div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-black uppercase">KPIs: {dept.topic?.length || 0}</span>
                      </div>
                      <ChevronRight size={16} className={`${selectedDept?.id === dept.id ? 'text-[#007e70]' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white">
               <button className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200">
                  <Plus size={18} /> เพิ่มกลุ่มงานใหม่
               </button>
            </div>
          </aside>

          {/* 3. MAIN CONTENT (KPI EDITOR) */}
          <main className="flex-1 overflow-y-auto apple-scrollbar p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {selectedDept ? (
                <motion.div
                  key={selectedDept.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl mx-auto"
                >
                  {/* Editor Header */}
                  <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <span className="bg-[#007e70] text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-widest">FY {fiscalYear}</span>
                         <span className="text-slate-300">/</span>
                         <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Dept ID: {selectedDept.id}</span>
                      </div>
                      <h2 className="text-4xl font-black tracking-tight text-slate-800">{selectedDept.title}</h2>
                    </div>
                    <button onClick={handleSaveAllKpis} className="px-8 py-3.5 bg-[#007e70] text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition-all active:scale-95">
                      <Save size={18} /> บันทึกข้อมูล
                    </button>
                  </div>

                  {/* KPI Items */}
                  <div className="space-y-6">
                    {currentKpis.map((kpi, index) => (
                      <motion.div key={kpi.tempKey} layout className="bg-white rounded-[28px] border border-gray-200/60 p-7 shadow-sm hover:shadow-md transition-all group">
                        <div className="grid grid-cols-12 gap-6 items-start">
                          <div className="col-span-12 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">KPI Code</label>
                            <Input 
                              placeholder="CODE" value={kpi.key} className="!bg-[#f5f5f7] !border-none font-bold text-[#007e70] h-11"
                              onChange={(e) => {
                                const next = [...currentKpis];
                                next[index].key = e.target.value.toUpperCase();
                                setCurrentKpis(next);
                              }}
                            />
                          </div>
                          <div className="col-span-12 md:col-span-7">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block text-emerald-600/60">Indicator Description</label>
                            <Input 
                              placeholder="ระบุชื่อตัวชี้วัด..." value={kpi.title} className="!bg-[#f5f5f7] !border-none font-bold h-11 mb-3"
                              onChange={(e) => {
                                const next = [...currentKpis];
                                next[index].title = e.target.value;
                                setCurrentKpis(next);
                              }}
                            />
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                              <LinkIcon size={14} className="text-slate-300" />
                              <Input 
                                placeholder="Data Source URL (Public Link)" value={kpi.url} variant="borderless" className="text-[11px] text-blue-500 font-medium p-0"
                                onChange={(e) => {
                                  const next = [...currentKpis];
                                  next[index].url = e.target.value;
                                  setCurrentKpis(next);
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* ส่วนเลือก Goal (%) */}
                          <div className="col-span-12 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block text-center tracking-tighter">การวัดผล</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl mb-3 shadow-inner">
                              <button 
                                onClick={() => { const next = [...currentKpis]; next[index].threshold = 80; setCurrentKpis(next); }}
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${ (kpi.threshold || kpi.threshold === 0) ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400' }`}
                              >ตั้งเป้า</button>
                              <button 
                                onClick={() => { const next = [...currentKpis]; next[index].threshold = null; setCurrentKpis(next); }}
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${ (!kpi.threshold && kpi.threshold !== 0) ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400' }`}
                              >ติดตาม</button>
                            </div>
                            <AnimatePresence mode="wait">
                              {(kpi.threshold || kpi.threshold === 0) ? (
                                <motion.div key="goal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                  <InputNumber 
                                    min={0} max={100} value={kpi.threshold} addonAfter="%"
                                    className="!w-full font-bold h-11 rounded-xl !bg-[#f5f5f7] !border-none text-emerald-600 overflow-hidden"
                                    onChange={(val) => { const next = [...currentKpis]; next[index].threshold = val; setCurrentKpis(next); }}
                                  />
                                </motion.div>
                              ) : (
                                <motion.div key="monitor" initial={{opacity:0}} animate={{opacity:1}} className="h-11 flex items-center justify-center bg-blue-50 border border-dashed border-blue-100 rounded-xl">
                                  <span className="text-[10px] font-black text-blue-400 uppercase">Monitoring</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="col-span-12 md:col-span-1 flex justify-end">
                            <Popconfirm title="ลบตัวชี้วัด?" description="ต้องการลบข้อมูลนี้ใช่หรือไม่?" onConfirm={() => handleDeleteKpi(kpi.id, kpi.tempKey)} okText="ลบ" cancelText="ยกเลิก">
                              <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 size={18} />
                              </button>
                            </Popconfirm>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <button 
                      onClick={() => setCurrentKpis([...currentKpis, { id: null, tempKey: `new-${Date.now()}`, key: '', title: '', threshold: 80, weight: 1, url: '' }])}
                      className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[28px] text-slate-400 hover:text-[#007e70] hover:border-[#007e70] hover:bg-white transition-all flex flex-col items-center gap-2 font-bold group"
                    >
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform text-slate-400 group-hover:text-[#007e70]" />
                      </div>
                      เพิ่มตัวชี้วัดใหม่ในกลุ่มงานนี้
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-6 border-2 border-white shadow-inner">
                    <Layout size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">KPI Management System</h3>
                  <p className="text-slate-400 text-sm max-w-sm mb-10 leading-relaxed">
                    เลือกหน่วยงานจากรายการด้านซ้าย <br/>เพื่อเริ่มต้นการตั้งค่าตัวชี้วัดรายปี
                  </p>
                  <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                      <Search size={20} className="text-emerald-500 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search Dept.</span>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                      <Clock size={20} className="text-emerald-500 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Year</span>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <style>{`
          .apple-scrollbar::-webkit-scrollbar { width: 6px; }
          .apple-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e7; border-radius: 10px; }
          .apple-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .ant-input-number-handler-wrap { display: none !important; }
          .font-kanit { font-family: 'Kanit', sans-serif !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
}
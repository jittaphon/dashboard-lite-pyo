import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, Plus, Search, ArrowLeft, Save, Trash2, 
  Clock, Activity, ChevronRight, Layout, Link as LinkIcon,
  Database, Table as TableIcon, BarChart3, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfigProvider, InputNumber, message, Input, Popconfirm, Select } from "antd";
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
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDepartments(fiscalYear);
  }, [fiscalYear, fetchDepartments]);

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    console.log('Selected Department:', dept);
    const preparedKpis = (dept.topic || []).map((kpi, idx) => {
      let parsedChartTypes = ['bar'];
      if (kpi.chart_type) {
        parsedChartTypes = typeof kpi.chart_type === 'string' ? kpi.chart_type.split(',') : kpi.chart_type;
      }
      
      const rawUrl = kpi.url || kpi.report_url || '';
      const isExternal = !!rawUrl && rawUrl.trim() !== '';

      return {
        ...kpi,
        tempKey: kpi.id ? `old-${kpi.id}` : `new-${Date.now()}-${idx}`,
        target_connection: kpi.target_connection || '',
        target_table: kpi.target_table || '',
        chart_type: parsedChartTypes,
        url: rawUrl,
        source_type: isExternal ? 'external' : 'internal'
      };
    });
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
    if (hasEmpty) return message.warning('กรุณากรอกข้อมูลพื้นฐาน (Code/Name) ให้ครบถ้วน');

    setIsSaving(true);
    const hide = message.loading('กำลังบันทึกข้อมูล...', 0);
    try {
      await Promise.all(currentKpis.map(kpi => {
        const isExternal = kpi.source_type === 'external';
        
        return saveKpiAction({
          kpi_id: kpi.id, 
          group_id: selectedDept.id,
          kpi_code: kpi.key,
          kpi_name: kpi.title,
          threshold: kpi.threshold || 0, // ส่งเป็น 0 กรณีเป็น null/undefined
          weight: kpi.weight || 1,
          year: fiscalYear,
          report_url: isExternal ? (kpi.url || '') : '',
          target_connection: isExternal ? '' : kpi.target_connection,
          target_table: isExternal ? '' : kpi.target_table,
          chart_type: isExternal ? '' : (Array.isArray(kpi.chart_type) ? kpi.chart_type.join(',') : kpi.chart_type)
        });
      }));
      message.success('อัปเดตข้อมูลสำเร็จ');
      fetchDepartments(fiscalYear, true);
    } catch (error) {
      message.error('ล้มเหลว: ' + error.message);
    } finally {
      hide();
      setIsSaving(false);
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
        components: { 
          Input: { colorBgContainer: '#f5f5f7' },
          Select: { colorBgContainer: '#f5f5f7', border: 'none' }
        }
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
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-600/95 to-teal-600/95 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-black text-[15px] tracking-tight block leading-none text-slate-800 uppercase">Health Registry System</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Master KPI Management</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="hidden md:block">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Database Connected</div>
              <div className="text-[10px] text-emerald-500 flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Data Sync Active
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-slate-400"><Users size={20} /></div>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          
          {/* 2. LEFT SIDEBAR */}
          <aside className="w-[380px] border-r border-gray-200/60 bg-white flex flex-col z-20 shadow-sm">
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
                        fiscalYear === year ? 'bg-gradient-to-br from-emerald-600/95 to-teal-600/95 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
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
                        <motion.div layoutId="active-bar" className="absolute left-0 w-1 h-3/5 bg-gradient-to-b from-emerald-600/95 to-teal-600/95 rounded-r-full" />
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
            
           
          </aside>

          {/* 3. MAIN CONTENT (KPI EDITOR) */}
          <main className="flex-1 overflow-y-auto apple-scrollbar p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {selectedDept ? (
                <motion.div
                  key={selectedDept.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="max-w-5xl mx-auto"
                >
                  <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <span className="bg-gradient-to-r from-emerald-600/95 to-teal-600/95 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-widest">Fiscal Year {fiscalYear}</span>
                         <span className="text-slate-300">/</span>
                         <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Group ID: {selectedDept.id}</span>
                      </div>
                      <h2 className="text-4xl font-black tracking-tight text-slate-800">{selectedDept.title}</h2>
                    </div>
                    
                    <button 
                      onClick={handleSaveAllKpis} 
                      disabled={isSaving}
                      className={`px-8 py-3.5 bg-gradient-to-r from-emerald-600/95 to-teal-600/95 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl transition-all ${
                        isSaving 
                          ? 'opacity-75 cursor-not-allowed shadow-none' 
                          : 'shadow-emerald-900/10 hover:brightness-110 active:scale-95'
                      }`}
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      {isSaving ? 'กำลังบันทึก...' : 'บันทึกโครงสร้างใหม่'}
                    </button>

                  </div>

                  <div className="space-y-8">
                    {currentKpis.map((kpi, index) => (
                      <motion.div key={kpi.tempKey} layout className="bg-white rounded-[32px] border border-gray-200/60 p-8 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${kpi.id ? 'bg-emerald-500/20' : 'bg-orange-400'}`} />
                        
                        <div className="grid grid-cols-12 gap-8 items-start">
                          <div className="col-span-12 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">KPI Code</label>
                            <Input 
                              placeholder="K-001" value={kpi.key} className="!bg-[#f5f5f7] !border-none font-bold text-[#007e70] h-12"
                              onChange={(e) => {
                                const next = [...currentKpis];
                                next[index].key = e.target.value.toUpperCase();
                                setCurrentKpis(next);
                              }}
                            />
                          </div>
                          <div className="col-span-12 md:col-span-7">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Indicator Name</label>
                            <Input 
                              placeholder="ชื่อตัวชี้วัด..." value={kpi.title} className="!bg-[#f5f5f7] !border-none font-bold h-12 mb-3"
                              onChange={(e) => {
                                const next = [...currentKpis];
                                next[index].title = e.target.value;
                                setCurrentKpis(next);
                              }}
                            />
                          </div>
                          
                          {/* ปรับปรุงตรรกะ Measurement ตรงนี้ครับ */}
                          <div className="col-span-12 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block text-center">Measurement</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl mb-2">
                              <button 
                                onClick={() => { const next = [...currentKpis]; next[index].threshold = 80; setCurrentKpis(next); }}
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${ (kpi.threshold && kpi.threshold !== 0) ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400' }`}
                              >Goal</button>
                              <button 
                                onClick={() => { const next = [...currentKpis]; next[index].threshold = 0; setCurrentKpis(next); }}
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${ (!kpi.threshold || kpi.threshold === 0) ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400' }`}
                              >Track</button>
                            </div>
                            <AnimatePresence mode="wait">
                              {(kpi.threshold && kpi.threshold !== 0) ? (
                                <InputNumber 
                                  min={0} max={100} value={kpi.threshold} addonAfter="%"
                                  className="!w-full font-bold h-10 rounded-xl !bg-[#f5f5f7] !border-none overflow-hidden"
                                  onChange={(val) => { const next = [...currentKpis]; next[index].threshold = val; setCurrentKpis(next); }}
                                />
                              ) : (
                                <div className="h-10 flex items-center justify-center bg-blue-50 border border-dashed border-blue-100 rounded-xl">
                                  <span className="text-[9px] font-black text-blue-400 uppercase">Monitoring Only</span>
                                </div>
                              )}
                            </AnimatePresence>
                          </div>
                          {/* สิ้นสุดส่วนที่ปรับปรุง */}

                          <div className="col-span-12 md:col-span-1 flex justify-end">
                            <Popconfirm title="ลบตัวชี้วัด?" onConfirm={() => handleDeleteKpi(kpi.id, kpi.tempKey)}>
                              <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                <Trash2 size={20} />
                              </button>
                            </Popconfirm>
                          </div>

                          <div className="col-span-12 p-5 bg-slate-50 rounded-[22px] border border-slate-100 space-y-4">
                            
                            <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit">
                              <button 
                                onClick={() => { const next = [...currentKpis]; next[index].source_type = 'internal'; setCurrentKpis(next); }}
                                className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center gap-2 ${kpi.source_type === 'internal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                <Database size={14} /> ดึงข้อมูลจากฐานข้อมูล (Internal Report)
                              </button>
                              <button 
                                onClick={() => { const next = [...currentKpis]; next[index].source_type = 'external'; setCurrentKpis(next); }}
                                className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center gap-2 ${kpi.source_type === 'external' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                <Globe size={14} /> ใช้ลิงก์ภายนอก (External Web)
                              </button>
                            </div>

                            <div className="pt-2">
                              {kpi.source_type === 'external' ? (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                  className="w-full"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1.5">
                                      <Globe size={14} /> External Web Report URL
                                    </label>
                                    <span className="text-[9px] text-slate-400 font-medium">🔗 ระบบจะลิงก์ไปหน้าเว็บนี้โดยตรงเมื่อผู้ใช้กดดูรายงาน</span>
                                  </div>
                                  <Input 
                                    placeholder="เช่น https://lookerstudio.google.com/..." value={kpi.url} 
                                    className="!bg-white text-[13px] h-12 !border-blue-200 ring-4 ring-blue-50/50 transition-all font-medium text-blue-600"
                                    onChange={(e) => {
                                      const next = [...currentKpis];
                                      next[index].url = e.target.value;
                                      setCurrentKpis(next);
                                    }}
                                  />
                                </motion.div>
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                  className="grid grid-cols-1 md:grid-cols-3 gap-5"
                                >
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                                      <Database size={14} className="text-emerald-500" /> Target Connection
                                    </label>
                                    <Input 
                                      placeholder="เช่น hos_xp" value={kpi.target_connection} className="!bg-white !border-slate-200 text-[12px] h-11"
                                      onChange={(e) => {
                                        const next = [...currentKpis];
                                        next[index].target_connection = e.target.value;
                                        setCurrentKpis(next);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                                      <TableIcon size={14} className="text-emerald-500" /> Target Table
                                    </label>
                                    <Input 
                                      placeholder="ชื่อตาราง SQL" value={kpi.target_table} className="!bg-white !border-slate-200 text-[12px] h-11"
                                      onChange={(e) => {
                                        const next = [...currentKpis];
                                        next[index].target_table = e.target.value;
                                        setCurrentKpis(next);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                                      <BarChart3 size={14} className="text-emerald-500" /> Visualization (เลือกได้หลายแบบ)
                                    </label>
                                    <Select 
                                      mode="multiple"
                                      maxTagCount="responsive"
                                      value={kpi.chart_type || []}
                                      className="w-full text-[12px]"
                                      onChange={(val) => {
                                        const next = [...currentKpis];
                                        next[index].chart_type = val.length > 0 ? val : ['bar'];
                                        setCurrentKpis(next);
                                      }}
                                      options={[
                                        { value: 'bar', label: '📊 Bar Chart' },
                                        { value: 'donut', label: '🍩 Donut Chart' },
                                        { value: 'line', label: '📈 Line Chart' },
                                        { value: 'table', label: '📋 Data Table' },
                                      ]}
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <button 
                      onClick={() => setCurrentKpis([...currentKpis, { id: null, tempKey: `new-${Date.now()}`, key: '', title: '', threshold: 0, weight: 1, url: '', target_connection: '', target_table: '', chart_type: ['bar'], source_type: 'internal' }])}
                      className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 hover:text-[#007e70] hover:border-[#007e70] hover:bg-emerald-50/20 transition-all flex flex-col items-center gap-2 font-bold group"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shadow-sm">
                        <Plus size={24} className="text-slate-400 group-hover:text-[#007e70]" />
                      </div>
                      เพิ่มรายการตัวชี้วัดใน {selectedDept.title}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-slate-200 mb-6 border-2 border-slate-50 shadow-sm">
                    <Layout size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">KPI Database Admin</h3>
                  <p className="text-slate-400 text-sm max-w-sm mb-10 leading-relaxed">
                    กรุณาเลือกกลุ่มงานเพื่อจัดการโครงสร้างข้อมูล <br/>และการเชื่อมโยงกับฐานข้อมูลดิบ
                  </p>
                  <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[120px]">
                      <Search size={20} className="text-emerald-500 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Group</span>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[120px]">
                      <Database size={20} className="text-emerald-500 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Set Sources</span>
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
          
          /* Custom styling for antd multiple select */
          .ant-select-multiple .ant-select-selection-item {
            background-color: #f1f5f9 !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            font-weight: 600;
            color: #475569 !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}
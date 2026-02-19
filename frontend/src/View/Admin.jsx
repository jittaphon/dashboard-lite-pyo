import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  ArrowLeft,
  Edit3,
  Save,
  X,
  Trash2,
  Clock,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, ConfigProvider, Modal, InputNumber, message, Input, App } from "antd";
import { useNavigate } from "react-router-dom";
import useDepartmentStore from '../Store/useDepartmentStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal(); // ใช้ Hook แทน Static Function
  
  const { 
    departments, 
    fetchDepartments, 
    isLoading, 
    saveKpiAction, 
    deleteKpiAction 
  } = useDepartmentStore();

  const [fiscalYear, setFiscalYear] = useState(2569);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [currentKpis, setCurrentKpis] = useState([]);

  useEffect(() => {
    fetchDepartments(fiscalYear);
  }, [fiscalYear, fetchDepartments]);

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    const preparedKpis = (dept.topic || []).map((kpi, idx) => ({
      ...kpi,
      tempKey: kpi.id ? `old-${kpi.id}` : `new-${Date.now()}-${idx}`
    }));
    setCurrentKpis(preparedKpis);
    setIsEditModalOpen(true);
  };

  const handleDeleteKpi = (kpiId, tempKey) => {
    modal.confirm({ // เรียกผ่าน instance จาก hook
      title: <span className="text-white font-kanit">ยืนยันการลบตัวชี้วัด?</span>,
      content: <span className="text-white/60 font-kanit">ข้อมูลจะถูกลบออกจากระบบถาวร ไม่สามารถย้อนกลับได้</span>,
      okText: 'ยืนยันการลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      centered: true,
      className: 'admin-confirm-modal',
      onOk: async () => {
        try {
          if (kpiId) {
            await deleteKpiAction(kpiId);
            message.success('ลบข้อมูลจากระบบสำเร็จ');
          }
          setCurrentKpis(prev => prev.filter(k => k.tempKey !== tempKey));
          fetchDepartments(fiscalYear, true);
        } catch (error) {
          message.error('ไม่สามารถลบข้อมูลได้: ' + error.message);
        }
      }
    });
  };

  const handleSaveAllKpis = async () => {
    const hasEmpty = currentKpis.some(k => !k.key || !k.title);
    if (hasEmpty) {
      return message.warning('กรุณาระบุ "รหัส" และ "ชื่อตัวชี้วัด" ให้ครบทุกแถว');
    }

    const hide = message.loading('กำลังจัดเก็บข้อมูลลงฐานข้อมูล...', 0);
    try {
      await Promise.all(currentKpis.map(kpi => 
        saveKpiAction({
          kpi_id: kpi.id, 
          group_id: selectedDept.id,
          kpi_code: kpi.key,
          kpi_name: kpi.title,
          threshold: kpi.threshold || 0,
          weight: kpi.weight || 1,
          year: fiscalYear,
          report_url: kpi.url || ''
        })
      ));
      message.success('ปรับปรุงข้อมูลเรียบร้อยแล้ว');
      setIsEditModalOpen(false);
      fetchDepartments(fiscalYear, true);
    } catch (error) {
      message.error('การบันทึกล้มเหลว: ' + error.message);
    } finally {
      hide();
    }
  };

  const filteredDepts = departments.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalDepts: departments.length,
    totalKpis: departments.reduce((acc, dept) => acc + (dept.topic?.length || 0), 0),
    pending: departments.filter(d => d.topic?.some(t => t.status === "รอผล")).length,
    critical: departments.filter(d => d.topic?.some(t => t.percent < t.threshold && t.percent !== null)).length
  };

  return (
    <ConfigProvider 
      theme={{ 
        token: { colorPrimary: '#10b981', fontFamily: 'Kanit', borderRadius: 16 },
        components: { 
          Select: { colorBgContainer: 'rgba(255,255,255,0.05)', colorText: '#fff', colorTextPlaceholder: 'rgba(255,255,255,0.3)' },
          Modal: { colorBgElevated: '#064e3b', colorTextHeading: '#fff', colorIcon: '#fff' },
          Input: { colorBgContainer: 'rgba(0,0,0,0.2)', colorText: '#fff', colorBorder: 'rgba(255,255,255,0.1)', colorPlaceholder: 'rgba(255,255,255,0.3)' },
          InputNumber: { colorBgContainer: 'rgba(0,0,0,0.2)', colorText: '#fff', colorBorder: 'rgba(255,255,255,0.1)' }
        }
      }}
    >
      {/* contextHolder คือตัวที่จะทำให้ Modal มองเห็น Theme */}
      {contextHolder}
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-600/95 to-teal-600/95 font-kanit text-white">
        <nav className="sticky top-0 z-50 bg-emerald-900/40 backdrop-blur-2xl border-b border-white/10 px-6 py-4">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/')} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings size={22} className="text-emerald-900" />
                </div>
                <div className="flex flex-col leading-none">
                   <h1 className="text-xl font-black uppercase tracking-tight">Admin <span className="text-emerald-300">Console</span></h1>
                   <span className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest">Master Management</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-black/20 px-5 py-2 rounded-2xl border border-white/10 text-emerald-300 font-black">
                ปีงบประมาณ 
                <Select 
                 value={fiscalYear} 
                 variant="borderless" 
                 onChange={setFiscalYear} 
                 options={[{ value: 2569, label: '2569' }, { value: 2568, label: '2568' }]} 
                 className="w-24" 
                />
            </div>
          </div>
        </nav>

        <main className="max-w-[1600px] mx-auto p-6 lg:p-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
               <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-none">Master Registry</h2>
               <p className="text-white/60 font-medium mt-2">จัดการกลุ่มงานและตั้งค่าเกณฑ์เป้าหมายรายตัวชี้วัดสำคัญ</p>
            </div>
            <button className="px-8 py-4 bg-white text-emerald-900 rounded-3xl font-black text-sm flex items-center gap-2 hover:bg-emerald-100 transition-all active:scale-95 shadow-xl">
              <Plus size={18} strokeWidth={3} /> เพิ่มกลุ่มงานใหม่
            </button>
          </header>

          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <AdminStatCard label="กลุ่มงานทั้งหมด" value={stats.totalDepts} icon={Users} color="emerald" />
            <AdminStatCard label="ตัวชี้วัดรวม" value={stats.totalKpis} icon={FileText} color="sky" />
            <AdminStatCard label="รอการรายงาน" value={stats.pending} icon={Clock} color="orange" />
            <AdminStatCard label="วิกฤต/ตกเกณฑ์" value={stats.critical} icon={AlertCircle} color="rose" />
          </div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
               <h3 className="font-black text-emerald-300 uppercase tracking-widest text-sm flex items-center gap-2">
                 <div className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse" /> รายชื่อกลุ่มงานรับผิดชอบ
               </h3>
               <div className="relative w-full md:w-auto">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                 <input 
                  type="text" 
                  placeholder="ค้นหากลุ่มงาน..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm w-full md:w-80 focus:ring-2 focus:ring-emerald-400 outline-none transition-all placeholder:text-white/20" 
                 />
               </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black">กำลังเชื่อมต่อฐานข้อมูล...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-white/30 bg-white/[0.01]">
                      <th className="px-8 py-5">กลุ่มงาน (Department)</th>
                      <th className="px-8 py-5 text-center">KPIs</th>
                      <th className="px-8 py-5">สถานะปี {fiscalYear}</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-kanit">
                    {filteredDepts.map((dept) => (
                      <tr key={`dept-${dept.id}`} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-8 py-6">
                            <div className="font-black text-white uppercase text-base tracking-tight">{dept.title}</div>
                            <div className="text-[10px] text-white/30 font-bold uppercase mt-1">ID: {dept.id}</div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-xl font-black text-sm border border-emerald-500/20 shadow-inner">
                            {dept.topic?.length || 0}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${dept.topic?.every(t => t.status === "ผ่าน") ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                             {dept.topic?.every(t => t.status === "ผ่าน") ? '● All Passed' : '○ In Progress'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => handleOpenEdit(dept)}
                            className="px-6 py-3 bg-emerald-400 hover:bg-white text-emerald-950 text-[11px] font-black uppercase rounded-2xl transition-all flex items-center gap-2 ml-auto shadow-lg hover:-translate-y-0.5"
                          >
                            <Edit3 size={14} /> ตั้งค่า KPI
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        <Modal
          title={
            <div className="flex items-center gap-3 text-white font-black py-2">
              <div className="p-2 bg-emerald-400/20 rounded-lg"><Edit3 size={20} className="text-emerald-400"/></div>
              <div>
                <div className="text-lg leading-none uppercase italic">Manage Indicators</div>
                <div className="text-xs text-emerald-300/60 font-bold mt-1 uppercase tracking-widest">{selectedDept?.title}</div>
              </div>
            </div>
          }
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          width={1200}
          footer={[
            <button key="btn-cancel" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 text-white/40 font-bold hover:text-white transition-colors uppercase text-[11px] tracking-widest">Discard Changes</button>,
            <button key="btn-save" onClick={handleSaveAllKpis} className="px-10 py-4 bg-emerald-400 text-emerald-950 font-black rounded-2xl hover:bg-white transition-all uppercase text-[11px] shadow-2xl ml-4 flex items-center gap-3 inline-flex">
              <Save size={18} /> Update Database
            </button>
          ]}
          centered
          className="admin-modal"
          closeIcon={<X className="text-white/40 hover:text-white" />}
        >
          <div className="py-6 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
            <div className="grid grid-cols-12 gap-5 mb-4 px-6 text-[10px] font-black text-emerald-400/40 uppercase tracking-[0.2em]">
                <div className="col-span-2">Indicator Code</div>
                <div className="col-span-4">Metric Details & Report Link</div>
                <div className="col-span-2 text-center">Threshold (%)</div>
                <div className="col-span-2 text-center">Weight</div>
                <div className="col-span-2 text-right">Action</div>
            </div>
            
            <AnimatePresence>
              {currentKpis.map((kpi, index) => (
                <motion.div 
                  key={kpi.tempKey} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-12 gap-5 items-center bg-black/30 p-6 rounded-[2rem] border border-white/5 mb-4 group hover:border-emerald-500/40 transition-all shadow-xl relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/20 group-hover:bg-emerald-400 transition-colors" />
                  <div className="col-span-2">
                    <Input 
                      placeholder="e.g. NCD_001" 
                      value={kpi.key}
                      className="font-mono text-xs font-black uppercase text-emerald-400"
                      onChange={(e) => {
                        const next = [...currentKpis];
                        next[index].key = e.target.value.toUpperCase();
                        setCurrentKpis(next);
                      }}
                    />
                  </div>
                  <div className="col-span-4 flex flex-col gap-3">
                    <Input 
                      placeholder="ชื่อตัวชี้วัด" 
                      value={kpi.title}
                      className="font-bold text-sm"
                      onChange={(e) => {
                        const next = [...currentKpis];
                        next[index].title = e.target.value;
                        setCurrentKpis(next);
                      }}
                    />
                    <div className="flex items-center gap-3 bg-black/40 rounded-xl px-3 border border-white/5 group/link">
                      <LinkIcon size={14} className="text-white/20 group-hover/link:text-emerald-400 transition-colors" />
                      <Input 
                        placeholder="Dashboard URL" 
                        value={kpi.url}
                        variant="borderless"
                        className="text-[10px] py-2 font-mono"
                        onChange={(e) => {
                          const next = [...currentKpis];
                          next[index].url = e.target.value;
                          setCurrentKpis(next);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <InputNumber 
                          min={0} max={100} 
                          value={kpi.threshold} 
                          className="w-24 ant-input-big"
                          onChange={(val) => {
                            const next = [...currentKpis];
                            next[index].threshold = val;
                            setCurrentKpis(next);
                          }}
                        />
                        <span className="text-[9px] font-black text-white/20 uppercase">Percent</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                     <div className="flex flex-col items-center gap-2">
                        <InputNumber 
                          min={1} max={10} 
                          value={kpi.weight} 
                          className="w-20 ant-input-big"
                          onChange={(val) => {
                            const next = [...currentKpis];
                            next[index].weight = val;
                            setCurrentKpis(next);
                          }}
                        />
                        <span className="text-[9px] font-black text-white/20 uppercase">Multiplier</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                     <button 
                      type="button"
                      onClick={() => handleDeleteKpi(kpi.id, kpi.tempKey)}
                      className="p-4 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-lg active:scale-90"
                     >
                        <Trash2 size={20}/>
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button 
              className="w-full py-6 border-2 border-dashed border-white/10 rounded-[2rem] text-white/20 hover:text-emerald-400 hover:border-emerald-400/40 transition-all text-[11px] font-black uppercase flex items-center justify-center gap-3 mt-4 group"
              onClick={() => {
                setCurrentKpis([...currentKpis, {
                  id: null,
                  tempKey: `new-${Date.now()}`,
                  key: '',
                  title: '',
                  threshold: 80,
                  weight: 1,
                  url: ''
                }]);
              }}
            >
               <div className="p-1 bg-white/5 rounded-lg group-hover:bg-emerald-400/20"><Plus size={20}/></div>
               Add New Performance Indicator
            </button>
          </div>
        </Modal>

        <style>{`
          .admin-modal .ant-modal-content { background: #064e3b !important; border-radius: 50px; padding: 30px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
          .admin-modal .ant-modal-header { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 25px; }
          
          .admin-confirm-modal .ant-modal-content { background: #064e3b !important; border-radius: 35px; border: 1px solid rgba(255,255,255,0.1); color: white !important; }
          .admin-confirm-modal .ant-modal-confirm-title { color: white !important; font-family: 'Kanit'; }
          .admin-confirm-modal .ant-modal-confirm-content { color: rgba(255,255,255,0.6) !important; font-family: 'Kanit'; }
          .admin-confirm-modal .ant-btn-default { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
          .admin-confirm-modal .ant-btn-dangerous { background: #f43f5e !important; border-radius: 12px; font-weight: bold; border: none; color: white !important; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.4); border-radius: 10px; border: 2px solid #064e3b; }
          .ant-input { border-radius: 15px !important; padding: 10px 15px !important; border: 1px solid rgba(255,255,255,0.1) !important; }
          .ant-input-number { background: rgba(0,0,0,0.3) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 15px !important; overflow: hidden; }
          .ant-input-number-input { color: #10b981 !important; font-weight: 900 !important; text-align: center !important; font-size: 16px !important; }
          .ant-input-number-handler-wrap { display: none !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
}

function AdminStatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "from-emerald-400 to-teal-500",
    sky: "from-sky-400 to-indigo-500",
    orange: "from-orange-400 to-amber-500",
    rose: "from-rose-400 to-pink-500"
  };
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-xl">
      <div className={`absolute -right-8 -top-8 w-40 h-40 bg-gradient-to-br ${colors[color]} blur-[60px] opacity-10 group-hover:opacity-25 transition-opacity duration-700`} />
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-5xl font-black tracking-tighter leading-none">{value}</p>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mt-3 leading-none">{label}</p>
        </div>
        <div className={`p-5 rounded-[1.5rem] bg-gradient-to-br ${colors[color]} shadow-2xl transform group-hover:rotate-12 transition-transform duration-500`}>
          <Icon size={26} className="text-emerald-950" />
        </div>
      </div>
    </div>
  );
}
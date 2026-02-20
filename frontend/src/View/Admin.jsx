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
  Link as LinkIcon,
  Database,
  Grid,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfigProvider, Modal, InputNumber, message, Input } from "antd";
import { useNavigate } from "react-router-dom";
import useDepartmentStore from '../Store/useDepartmentStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();
  
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
    modal.confirm({
      title: <span className="font-semibold text-gray-900">ยืนยันการลบรายการ?</span>,
      content: <span className="text-gray-500 text-sm">ข้อมูลตัวชี้วัดนี้จะถูกลบออกถาวร</span>,
      okText: 'ลบทิ้ง',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      centered: true,
      onOk: async () => {
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
      }
    });
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
          threshold: kpi.threshold || 0,
          weight: kpi.weight || 1,
          year: fiscalYear,
          report_url: kpi.url || ''
        })
      ));
      message.success('อัปเดตฐานข้อมูลสำเร็จ');
      setIsEditModalOpen(false);
      fetchDepartments(fiscalYear, true);
    } catch (error) {
      message.error('ล้มเหลว: ' + error.message);
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
        token: { colorPrimary: '#007e70', borderRadius: 12, fontFamily: 'Kanit, -apple-system, sans-serif' },
        components: { 
          Modal: { colorBgElevated: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' },
          Input: { colorBgContainer: '#f5f5f7', borderRadius: 10 }
        }
      }}
    >
      {contextHolder}
      
      <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#007e70]/20">
        {/* Apple Style Glass Nav */}
        <nav className="sticky top-0 z-50 bg-[#fbfbfd]/70 backdrop-blur-xl border-b border-gray-200/40 px-6 py-4">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/')} 
                className="group flex items-center gap-2 text-gray-500 hover:text-[#007e70] transition-colors font-medium text-sm"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
                <div className="w-9 h-9 bg-[#007e70] rounded-xl flex items-center justify-center shadow-lg shadow-[#007e70]/20">
                  <Activity size={20} className="text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-tight">Health Registry</h1>
              </div>
            </div>

            <div className="flex bg-gray-200/50 p-1 rounded-xl">
              {[2568, 2569].map(year => (
                <button 
                  key={year}
                  onClick={() => setFiscalYear(year)}
                  className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${fiscalYear === year ? 'bg-white shadow-sm text-[#007e70]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  FY {year}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-[1400px] mx-auto p-8 lg:p-12">
          {/* Bento Header */}
          <div className="grid grid-cols-12 gap-6 mb-12">
             <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <span className="text-[#007e70] font-bold text-xs uppercase tracking-widest mb-2 block">Administration Console</span>
                  <h2 className="text-6xl font-black tracking-tighter mb-4 text-[#1d1d1f]">Console.</h2>
                  <p className="text-xl text-gray-400 max-w-lg leading-snug font-medium">จัดการโครงสร้างตัวชี้วัดและค่าเป้าหมาย <br/>ของหน่วยงานในสังกัดสาธารณสุข</p>
                </motion.div>
             </div>
             <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
                <HealthStat label="หน่วยงาน" value={stats.totalDepts} icon={Users} color="#007e70" />
                <HealthStat label="ตัวชี้วัดทั้งหมด" value={stats.totalKpis} icon={FileText} color="#0066cc" />
                <HealthStat label="รอรายงาน" value={stats.pending} icon={Clock} color="#ff9500" />
                <HealthStat label="ไม่ผ่านเกณฑ์" value={stats.critical} icon={AlertCircle} color="#ff3b30" />
             </div>
          </div>

          {/* Search Bar & Action */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
             <div className="relative w-full md:w-[450px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อกลุ่มงาน..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-6 text-[16px] shadow-sm outline-none focus:ring-4 focus:ring-[#007e70]/10 transition-all placeholder:text-gray-300"
                />
             </div>
             <button className="w-full md:w-auto px-8 py-4 bg-[#1d1d1f] text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#007e70] transition-all shadow-xl active:scale-95">
                <Plus size={20} /> เพิ่มกลุ่มงาน
             </button>
          </div>

          {/* Clean Table Card */}
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-4 border-gray-100 border-t-[#007e70] rounded-full animate-spin" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Registry</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f7]/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="px-10 py-5 text-left">Department Details</th>
                      <th className="px-6 py-5 text-center">KPIs</th>
                      <th className="px-6 py-5 text-center">Status</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredDepts.map((dept) => (
                      <tr key={dept.id} className="group hover:bg-[#007e70]/[0.02] transition-colors">
                        <td className="px-10 py-7">
                          <div className="font-bold text-[19px] text-[#1d1d1f] group-hover:text-[#007e70] transition-colors">{dept.title}</div>
                          <div className="text-[12px] text-gray-400 font-bold mt-1">ID: {dept.id}</div>
                        </td>
                        <td className="px-6 py-7 text-center">
                          <span className="inline-flex items-center justify-center bg-gray-100 w-10 h-10 rounded-full font-bold text-sm">
                            {dept.topic?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-7 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${dept.topic?.every(t => t.status === "ผ่าน") ? 'bg-[#007e70]/10 text-[#007e70]' : 'bg-orange-100 text-orange-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${dept.topic?.every(t => t.status === "ผ่าน") ? 'bg-[#007e70]' : 'bg-orange-600'}`} />
                            {dept.topic?.every(t => t.status === "ผ่าน") ? 'VERIFIED' : 'PENDING'}
                          </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <button 
                            onClick={() => handleOpenEdit(dept)}
                            className="bg-[#f5f5f7] p-3 rounded-xl text-gray-400 hover:text-[#007e70] hover:bg-[#007e70]/10 transition-all active:scale-90"
                          >
                            <Settings size={20} />
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
            <div className="flex items-center gap-4 py-2">
              <div className="w-12 h-12 bg-[#007e70]/10 rounded-2xl flex items-center justify-center text-[#007e70]">
                <Grid size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold leading-none">{selectedDept?.title}</h4>
                <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-wider">Indicator Configuration</p>
              </div>
            </div>
          }
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          width={1000}
          footer={[
            <div key="footer" className="flex justify-between items-center px-6 py-4 bg-[#f5f5f7]/50 rounded-b-[32px]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">System Version 3.0.4 - 2026</span>
              <div className="flex gap-3">
                <button key="c" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-black transition-colors">Close</button>
                <button key="s" onClick={handleSaveAllKpis} className="px-8 py-2.5 bg-[#007e70] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#007e70]/20 hover:opacity-90 transition-all flex items-center gap-2">
                  <Save size={18} /> Update Registry
                </button>
              </div>
            </div>
          ]}
          centered
          className="apple-health-modal"
          closeIcon={<X className="text-gray-300 hover:text-black transition-colors" />}
        >
          <div className="py-6 max-h-[60vh] overflow-y-auto px-4 apple-scrollbar">
            <AnimatePresence>
              {currentKpis.map((kpi, index) => (
                <motion.div 
                  key={kpi.tempKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-[24px] p-6 mb-5 relative group"
                >
                  <div className="grid grid-cols-12 gap-6 items-end">
                    <div className="col-span-12 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">KPI Code</label>
                        <Input 
                          placeholder="CODE" 
                          value={kpi.key}
                          className="!bg-[#f5f5f7] !border-none font-bold uppercase text-[#007e70]"
                          onChange={(e) => {
                            const next = [...currentKpis];
                            next[index].key = e.target.value.toUpperCase();
                            setCurrentKpis(next);
                          }}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="flex justify-between mb-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase block">Performance Description</label>
                        </div>
                        <Input 
                          placeholder="ชื่อตัวชี้วัด..." 
                          value={kpi.title}
                          className="!bg-[#f5f5f7] !border-none font-bold text-[15px] mb-3"
                          onChange={(e) => {
                            const next = [...currentKpis];
                            next[index].title = e.target.value;
                            setCurrentKpis(next);
                          }}
                        />
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                           <LinkIcon size={12} className="text-gray-300" />
                           <Input 
                            placeholder="Data Source URL" 
                            value={kpi.url}
                            variant="borderless"
                            className="text-[11px] font-medium text-blue-500"
                            onChange={(e) => {
                              const next = [...currentKpis];
                              next[index].url = e.target.value;
                              setCurrentKpis(next);
                            }}
                           />
                        </div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Goal (%)</label>
                        <div className="bg-[#f5f5f7] rounded-xl flex items-center px-4">
                          <InputNumber 
                            min={0} max={100} value={kpi.threshold} 
                            className="!bg-transparent !border-none apple-num-input w-full"
                            onChange={(val) => {
                              const next = [...currentKpis];
                              next[index].threshold = val;
                              setCurrentKpis(next);
                            }}
                          />
                        </div>
                    </div>
                    <div className="col-span-4 md:col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Weight</label>
                        <InputNumber 
                          min={1} max={10} value={kpi.weight} 
                          className="!bg-[#f5f5f7] !border-none apple-num-input w-full rounded-xl"
                          onChange={(val) => {
                            const next = [...currentKpis];
                            next[index].weight = val;
                            setCurrentKpis(next);
                          }}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                        <button onClick={() => handleDeleteKpi(kpi.id, kpi.tempKey)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                           <Trash2 size={20} />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button 
              className="w-full py-10 border-2 border-dashed border-gray-100 rounded-[32px] text-gray-300 hover:text-[#007e70] hover:border-[#007e70] hover:bg-[#007e70]/[0.02] transition-all flex flex-col items-center justify-center gap-3 group"
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
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Plus size={24}/>
              </div>
              <span className="text-sm font-black uppercase tracking-widest">เพิ่มตัวชี้วัดใหม่</span>
            </button>
          </div>
        </Modal>

        <style>{`
          .apple-health-modal .ant-modal-content { 
            border-radius: 40px; 
            padding: 0; 
            overflow: hidden;
            box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.2);
          }
          .apple-health-modal .ant-modal-header { padding: 32px 32px 0 32px; border: none; }
          .apple-health-modal .ant-modal-body { padding: 0 32px 32px 32px; }
          .apple-scrollbar::-webkit-scrollbar { width: 4px; }
          .apple-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e7; border-radius: 10px; }
          .apple-num-input .ant-input-number-input { font-weight: 800 !important; color: #1d1d1f !important; }
          .ant-input-number-handler-wrap { display: none !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
}

function HealthStat({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-gray-100/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col gap-4 hover:translate-y-[-4px] transition-all duration-300 group">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}10` }}>
        <Icon size={22} style={{ color: color }} />
      </div>
      <div>
        <div className="text-3xl font-black tracking-tighter text-[#1d1d1f]">{value}</div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</div>
      </div>
    </div>
  );
}
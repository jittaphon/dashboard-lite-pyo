import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../api';
import { 
  Database, Search, UploadCloud, FileSpreadsheet, 
  ChevronRight, Activity, Clock, FileText, AlertCircle, RefreshCcw, Info
} from 'lucide-react';
import { 
  Button, Card, Tag, Input, Badge, Skeleton, Empty, Row, Col, Tooltip, message 
} from 'antd';

export default function AdminOfDiseaseControl() {
  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const userSession = {
    role: 'staff',
    department: 'กลุ่มงานควบคุมโรคติดต่อ'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (userSession.department === 'กลุ่มงานควบคุมโรคติดต่อ') {
        const res = await API.utilsAPI.getTableOfKpiOfDiseaseControl();
        const data = res.data.data || res.data; 
        if (Array.isArray(data)) {
          setTableList(data);
          if (data.length > 0 && !selectedTable) setSelectedTable(data[0].table_id);
        }
      }
    } catch (error) {
      message.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredTables = tableList.filter(t => 
    t.table_label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTableInfo = tableList.find(t => t.table_id === selectedTable);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header: Simple & Clear --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
              <Database size={20} />
              <span className="tracking-widest text-xs uppercase">ศูนย์จัดการข้อมูล (Data Center)</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 m-0 tracking-tight">
              จัดการข้อมูลนำเข้า
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              เลือกหัวข้อที่ต้องการ เพื่ออัปเดตข้อมูลผ่านไฟล์ Excel
            </p>
          </div>
          <Button 
            icon={<RefreshCcw size={16} />} 
            onClick={fetchData}
            className="rounded-full border-none shadow-sm h-12 px-6 font-bold text-slate-500 hover:text-emerald-600 bg-white"
          >
            รีเฟรชรายการ
          </Button>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 12 }} />
        ) : (
          <Row gutter={24}>
            
            {/* --- Left Column: Selection Menu --- */}
            <Col xs={24} lg={8}>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-250px)]">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <Input 
                    prefix={<Search size={18} className="text-slate-400" />}
                    placeholder="ค้นหาชื่อตารางหรือรายการ..."
                    className="rounded-2xl border-slate-200 h-12 shadow-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredTables.map((table) => (
                    <div 
                      key={table.table_id}
                      onClick={() => setSelectedTable(table.table_id)}
                      className={`group cursor-pointer p-5 rounded-2xl transition-all flex items-center justify-between ${
                        selectedTable === table.table_id 
                        ? 'bg-emerald-600 shadow-lg shadow-emerald-200 text-white' 
                        : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${selectedTable === table.table_id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                          <FileText size={20} />
                        </div>
                        <span className="font-bold tracking-tight">{table.table_label}</span>
                      </div>
                      <ChevronRight size={18} className={selectedTable === table.table_id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* --- Right Column: Active Action Area --- */}
            <Col xs={24} lg={16}>
              {activeTableInfo ? (
                <div className="space-y-6">
                  
                  {/* Step 1: Info Card */}
                  <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between gap-6 p-2">
                      <div className="flex-1">
                        <Tag className="bg-emerald-50 text-emerald-600 border-none rounded-full px-4 py-1 font-bold mb-4">
                          กำลังเลือกใช้งาน
                        </Tag>
                        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                          {activeTableInfo.table_label}
                        </h2>
                        <div className="flex gap-6 mt-6">
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">จำนวนข้อมูลทั้งหมด</p>
                            <p className="text-2xl font-black text-slate-800">{activeTableInfo.row_count.toLocaleString()} <span className="text-sm font-medium text-slate-400">รายการ</span></p>
                          </div>
                          <div className="w-[1px] bg-slate-100 h-10 self-center" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">อัปเดตล่าสุดเมื่อ</p>
                            <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                              {activeTableInfo.modified_date === 'ยังไม่มีการเปลี่ยนแปลง' ? '-' : activeTableInfo.modified_date}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-1/3 flex flex-col gap-3 justify-center">
                        <Button 
                          type="primary" 
                          block
                          icon={<UploadCloud size={24} />}
                          onClick={() => navigate(`/data-management/import/${selectedTable}`)}
                          className="h-24 rounded-3xl bg-slate-900 border-none text-lg font-black shadow-xl shadow-slate-200 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center gap-1"
                        >
                          เริ่มนำเข้าข้อมูล (Import)
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Step 2: Helper/Notice Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex gap-4">
                      <div className="bg-blue-500/10 p-3 h-fit rounded-2xl text-blue-600">
                        <Info size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 mb-1">ข้อแนะนำการใช้งาน</h4>
                        <p className="text-blue-700/70 text-sm leading-relaxed m-0">
                          กรุณาใช้ไฟล์ Template ของระบบในการนำเข้าข้อมูลเท่านั้น หากโครงสร้างไฟล์ไม่ถูกต้อง ระบบจะไม่อนุญาตให้นำเข้า
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex gap-4">
                      <div className="bg-slate-100 p-3 h-fit rounded-2xl text-slate-500">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">ต้องการความช่วยเหลือ?</h4>
                        <p className="text-slate-500 text-sm leading-relaxed m-0">
                          หากพบปัญหาในการอัปโหลดไฟล์ หรือข้อมูลไม่ตรงตามต้องการ กรุณาติดต่อทีมเทคนิค
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Minimal Placeholder for Preview */}
                  <div className="bg-white/50 border-2 border-dashed border-slate-300 rounded-[2.5rem] p-20 text-center">
                    <Empty 
                      description={
                        <span className="text-slate-400 font-medium">
                          เลือก "เริ่มนำเข้าข้อมูล" ด้านบน เพื่อเข้าสู่หน้าจัดการไฟล์
                        </span>
                      }
                    />
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-[2.5rem] p-20 text-center border border-slate-200">
                   <div className="p-6 bg-slate-50 rounded-full mb-6">
                      <FileSpreadsheet size={64} className="text-slate-200" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 mb-2">กรุณาเลือกตาราง</h2>
                   <p className="text-slate-400 max-w-xs">เลือกรายการจากเมนูทางซ้ายเพื่อเริ่มต้นจัดการข้อมูลของคุณ</p>
                </div>
              )}
            </Col>

          </Row>
        )}
      </div>

      <style jsx>{`
        :global(.ant-card) { border-radius: 2rem !important; }
        :global(.ant-btn-primary) { background: #0f172a !important; }
        :global(.ant-input) { font-weight: 500; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
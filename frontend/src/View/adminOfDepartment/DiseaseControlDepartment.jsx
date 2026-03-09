import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../api';
import { 
  Database, Search, UploadCloud, FileSpreadsheet, 
  ChevronRight, Activity, Clock, FileText, AlertCircle, RefreshCcw, Info, UserCircle
} from 'lucide-react';
import { 
  Button, Card, Tag, Input, Badge, Skeleton, Empty, Row, Col, Tooltip, message 
} from 'antd';

// Import Component ที่เราแยกไว้
import ExcelImportModal from '../../components/ExcelImportModal';

export default function AdminOfDiseaseControl() {
  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับควบคุมการเปิด/ปิด Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const userSession = {
    role: 'staff',
    department: 'กลุ่มงานควบคุมโรคติดต่อ'
  };

  const tableNameMap = {
    "tb_screening_results": "ผลการคัดกรองวัณโรค",
    "tb_patient_registry": "ทะเบียนผู้ป่วยวัณโรครายใหม่",
    "tb_followup_records": "บันทึกการติดตามอาการ",
    "tb_lab_results": "ผลตรวจทางห้องปฏิบัติการ (Lab)",
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

  const getDisplayLabel = (table) => tableNameMap[table.table_id] || table.table_label;

  const filteredTables = tableList.filter(t => 
    getDisplayLabel(t).toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.table_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTableInfo = tableList.find(t => t.table_id === selectedTable);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-3 bg-white w-fit px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <UserCircle size={18} />
              <span className="tracking-tight text-sm uppercase">{userSession.department}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 m-0 tracking-tight">
              จัดการข้อมูลนำเข้า
            </h1>
            <p className="text-slate-500 text-lg">
              เลือกหัวข้อที่ต้องการ และอัปโหลดไฟล์ Excel เพื่อเข้าสู่ระบบ
            </p>
          </div>
          
          <Button 
            icon={<RefreshCcw size={16} />} 
            onClick={fetchData}
            className="rounded-2xl border-none shadow-sm h-12 px-6 font-bold text-slate-500 hover:text-emerald-600 bg-white transition-all active:scale-95"
          >
            รีเฟรชรายการ
          </Button>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 12 }} className="bg-white p-10 rounded-[2.5rem]" />
        ) : (
          <Row gutter={32}>
            
            {/* --- Left Column: Selection Menu --- */}
            <Col xs={24} lg={8}>
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                  <Input 
                    prefix={<Search size={18} className="text-slate-400" />}
                    placeholder="ค้นหาชื่อตารางหรือรหัส..."
                    className="rounded-2xl border-slate-200 h-12 shadow-none focus:border-emerald-400"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {filteredTables.map((table) => {
                    const isSelected = selectedTable === table.table_id;
                    return (
                      <div 
                        key={table.table_id}
                        onClick={() => setSelectedTable(table.table_id)}
                        className={`group cursor-pointer p-5 rounded-[1.5rem] transition-all flex items-center justify-between ${
                          isSelected 
                          ? 'bg-slate-900 shadow-xl shadow-slate-200 text-white' 
                          : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold tracking-tight block truncate text-base leading-tight">
                              {getDisplayLabel(table)}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-slate-400' : 'text-slate-300'}`}>
                              ID: {table.table_id}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} className={isSelected ? 'text-emerald-400' : 'opacity-0 group-hover:opacity-100 text-slate-300'} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Col>

            {/* --- Right Column: Detail & Action --- */}
            <Col xs={24} lg={16}>
              {activeTableInfo ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  
                  {/* --- Table Info Card --- */}
                  <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="flex flex-col md:flex-row justify-between gap-8 p-4">
                      <div className="flex-1 space-y-6">
                        <div>
                           <Tag className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full px-4 py-0.5 font-black text-[10px] uppercase mb-4">
                             Active Table
                           </Tag>
                           <h2 className="text-4xl font-black text-slate-800 mb-2 leading-none tracking-tight">
                             {getDisplayLabel(activeTableInfo)}
                           </h2>
                           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                             System ID: {activeTableInfo.table_id}
                           </p>
                        </div>
                        
                        <div className="flex gap-12">
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Total Records</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">
                              {activeTableInfo.row_count.toLocaleString()}
                              <span className="text-sm font-bold text-slate-300 ml-2">แถว</span>
                            </p>
                          </div>
                          <div className="w-[1px] bg-slate-100 h-10 self-center" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Last Modified</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">
                              {activeTableInfo.modified_date === 'ยังไม่มีการเปลี่ยนแปลง' ? '-' : activeTableInfo.modified_date}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-[300px] flex flex-col justify-center">
                        <Button 
                          type="primary" 
                          block
                          icon={<UploadCloud size={28} />}
                          onClick={() => setIsImportModalOpen(true)} // เปิด Modal แทนการ Navigate
                          className="h-40 rounded-[2.5rem] bg-emerald-600 border-none text-xl font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-3 group"
                        >
                          <span className="group-hover:scale-110 transition-transform">IMPORT EXCEL</span>
                          <span className="text-[10px] font-bold opacity-60 tracking-[0.2em] uppercase">จัดการไฟล์ข้อมูลที่นี่</span>
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* --- Quick Tips & Notice --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50/40 border border-blue-100 rounded-[2rem] p-8 flex gap-5">
                      <div className="bg-blue-500 p-3 h-fit rounded-2xl text-white shadow-lg shadow-blue-200/50">
                        <Info size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-blue-900 mb-1 text-lg leading-tight">โครงสร้างไฟล์</h4>
                        <p className="text-blue-700/60 text-sm leading-relaxed m-0 font-medium">
                          ไฟล์ Excel ต้องมีหัวตาราง (Headers) ที่ตรงกับที่ระบบกำหนดไว้เท่านั้น
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex gap-5">
                      <div className="bg-slate-900 p-3 h-fit rounded-2xl text-white shadow-lg shadow-slate-200/50">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 mb-1 text-lg leading-tight">ข้อควรระวัง</h4>
                        <p className="text-slate-500 text-sm leading-relaxed m-0 font-medium">
                          การนำเข้าข้อมูลใหม่จะไม่มีผลกระทบต่อข้อมูลเดิมที่มีอยู่แล้วในระบบ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* --- Preview Placeholder --- */}
                  <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center group hover:border-emerald-300 transition-colors">
                    <Empty 
                      image={<FileSpreadsheet size={56} className="mx-auto text-slate-200 mb-4 group-hover:text-emerald-200 transition-colors" />}
                      description={
                        <div className="space-y-2">
                          <p className="text-slate-500 font-black text-lg m-0 uppercase tracking-tight">ระบบจัดการไฟล์พร้อมใช้งาน</p>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">คลิกปุ่ม Import ด้านบนเพื่อเริ่มต้นตรวจสอบไฟล์</p>
                        </div>
                      }
                    />
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-[3.5rem] p-20 text-center border border-slate-200 shadow-sm">
                   <div className="p-10 bg-slate-50 rounded-[2.5rem] mb-8 border border-slate-100">
                      <Database size={80} className="text-slate-200" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight uppercase">Dashboard Ready</h2>
                   <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">
                     กรุณาเลือกตารางจากรายการด้านซ้าย <br/>เพื่อเริ่มจัดการข้อมูลใน <b>{userSession.department}</b>
                   </p>
                </div>
              )}
            </Col>
          </Row>
        )}
      </div>

      {/* --- เรียกใช้ Modal --- */}
      {selectedTable && (
        <ExcelImportModal 
          visible={isImportModalOpen}
          onCancel={() => setIsImportModalOpen(false)}
          tableId={selectedTable}
          tableName={getDisplayLabel(activeTableInfo)}
        />
      )}

      <style jsx>{`
        :global(.ant-card) { border-radius: 2.5rem !important; }
        :global(.ant-btn-primary) { background: #10b981 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
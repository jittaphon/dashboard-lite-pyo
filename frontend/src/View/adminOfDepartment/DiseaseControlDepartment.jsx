// File: src/View/adminOfDepartment/AdminOfDiseaseControl.jsx
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

import ExcelImportModal from './ExcelImportModal';

export default function AdminOfDiseaseControl() {
  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const userSession = {
    role: 'staff',
    department: 'กลุ่มงานควบคุมโรคติดต่อ'
  };

  const tableNameMap = {
    "tb_screening_results": "ตัวชี้วัด ผลการคัดกรองวัณโรค",
    "tb_patient_registry": "ทะเบียนผู้ป่วยวัณโรครายใหม่",
    "tb_followup_records": "บันทึกการติดตามอาการ",
    "tb_lab_results": "ผลตรวจทางห้องปฏิบัติการ (Lab)",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (userSession.department === 'กลุ่มงานควบคุมโรคติดต่อ') {
        const res = await API?.utilsAPI?.getTableOfKpiOfDiseaseControl?.() || {
          data: {
            data: [
              { table_id: "tb_screening_results", row_count: 1250, modified_date: "2026-03-09" },
              { table_id: "tb_patient_registry", row_count: 450, modified_date: "2026-03-08" },
            ]
          }
        };
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

  const getDisplayLabel = (table) => {
    if (!table) return "";
    return tableNameMap[table.table_id] || table.table_label || table.table_id;
  };

  const filteredTables = tableList.filter(t => 
    getDisplayLabel(t).toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.table_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTableInfo = tableList.find(t => t.table_id === selectedTable);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600/95 to-teal-600/95 p-6 lg:p-10">
      <div className="max-w-[95%] mx-auto w-full">
        
        {/* --- Header Section --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3 bg-white w-fit px-4 py-1.5 rounded-full shadow-lg">
              <UserCircle size={18} />
              <span className="tracking-tight text-sm uppercase">{userSession.department}</span>
            </div>
            <h1 className="text-4xl font-black text-white m-0 tracking-tight drop-shadow-md">
              จัดการข้อมูลนำเข้า
            </h1>
            <p className="text-emerald-50 text-lg drop-shadow-sm">
              เลือกหัวข้อที่ต้องการ และอัปโหลดไฟล์ Excel เพื่อเข้าสู่ระบบ
            </p>
          </div>
          
          <Button 
            icon={<RefreshCcw size={16} />} 
            onClick={fetchData}
            className="rounded-2xl border-none shadow-lg h-12 px-6 font-bold text-emerald-700 hover:text-emerald-500 bg-white transition-all active:scale-95"
          >
            รีเฟรชรายการ
          </Button>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 12 }} className="bg-white p-10 rounded-[2.5rem] shadow-xl" />
        ) : (
          <Row gutter={32}>
            
            {/* --- Left Column: Selection Menu --- */}
            <Col xs={24} lg={6}>
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-auto lg:h-[calc(100vh-280px)] max-h-[500px]">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
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
                          ? 'bg-emerald-600 shadow-xl shadow-emerald-600/30 text-white' 
                          : 'hover:bg-emerald-50 text-slate-600 border border-transparent hover:border-emerald-100'
                        }`}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-white text-emerald-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-500'}`}>
                            <FileText size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold tracking-tight block truncate text-base leading-tight">
                              {getDisplayLabel(table)}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              ID: {table.table_id}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} className={isSelected ? 'text-white' : 'opacity-0 group-hover:opacity-100 text-emerald-400'} />
                      </div>
                    );
                  })}
                  {filteredTables.length === 0 && (
                    <div className="text-center p-10 text-slate-400 font-medium">
                      ไม่พบตารางที่ค้นหา
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* --- Right Column: Detail & Action --- */}
            <Col xs={24} lg={18}>
              {activeTableInfo ? (
                <div className="flex flex-col gap-6 h-auto lg:h-[calc(100vh-280px)] max-h-[800px] animate-in fade-in slide-in-from-right-4 duration-500">
                  
                  {/* --- 1. Table Info Card (Top) --- */}
                  <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white w-full shrink-0">
                    <div className="flex flex-col md:flex-row justify-between gap-8 p-4">
                      <div className="flex-1 space-y-6">
                        <div>
                           <Tag className="bg-emerald-50 text-emerald-600 border-emerald-200 rounded-full px-4 py-1 font-black text-[10px] uppercase mb-4 shadow-sm">
                             Active Table
                           </Tag>
                           <h2 className="text-4xl font-black text-slate-800 mb-2 leading-none tracking-tight">
                             {getDisplayLabel(activeTableInfo)}
                           </h2>
                           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                             System ID: {activeTableInfo.table_id}
                           </p>
                        </div>
                        
                        <div className="flex gap-12 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 w-fit">
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                              <Database size={12} /> Total Records
                            </p>
                            <p className="text-3xl font-black text-slate-900 leading-none">
                              {activeTableInfo.row_count?.toLocaleString() || 0}
                              <span className="text-sm font-bold text-slate-400 ml-2">แถว</span>
                            </p>
                          </div>
                          <div className="w-[1px] bg-slate-200 h-12 self-center" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                              <Clock size={12} /> Last Modified
                            </p>
                            <p className="text-2xl mt-1 font-black text-slate-800 leading-none">
                              {activeTableInfo.modified_date === 'ยังไม่มีการเปลี่ยนแปลง' || !activeTableInfo.modified_date ? '-' : activeTableInfo.modified_date}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-[300px] flex flex-col justify-center">
                        <Button 
                          type="primary" 
                          block
                          onClick={() => setIsImportModalOpen(true)} 
                          className="h-40 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 border-none text-xl font-black shadow-xl shadow-teal-600/30 hover:shadow-teal-600/50 hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-3 group"
                        >
                          <UploadCloud size={36} className="text-white group-hover:-translate-y-1 transition-transform" />
                          <span className="text-white">IMPORT EXCEL</span>
                          <span className="text-[10px] text-emerald-100 font-bold tracking-[0.2em] uppercase">อัปโหลดข้อมูลที่นี่</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
            

                  {/* --- 3. Quick Tips & Notice (Bottom) ถูกดันให้ชิดขอบล่าง --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0 ">
                    <div className="bg-white shadow-xl border-none rounded-[2rem] p-8 flex gap-5 border-l-8 border-blue-500">
                      <div className="bg-blue-500 p-3 h-fit rounded-2xl text-white shadow-lg shadow-blue-500/30">
                        <Info size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 mb-1 text-lg leading-tight">โครงสร้างไฟล์</h4>
                        <p className="text-slate-500 text-sm leading-relaxed m-0 font-medium">
                          ใช้ไฟล์ที่ดาวน์โหลดจากระบบ (Template) เท่านั้น เพื่อป้องกันความผิดพลาดของหัวตารางและการอ่านข้อมูล
                        </p>
                      </div>
                    </div>

                    <div className="bg-white shadow-xl border-none rounded-[2rem] p-8 flex gap-5 border-l-8 border-rose-500">
                      <div className="bg-rose-500 p-3 h-fit rounded-2xl text-white shadow-lg shadow-rose-500/30">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-rose-600 mb-1 text-lg leading-tight uppercase tracking-tight">ข้อควรระวัง: การเขียนทับข้อมูล</h4>
                        <p className="text-slate-500 text-sm leading-relaxed m-0 font-bold italic">
                          "ระบบจะลบข้อมูลเก่าทั้งหมดในตารางนี้ และแทนที่ด้วยข้อมูลจากไฟล์ใหม่ทันที (Overwrite)" 
                        </p>
                        <p className="text-[10px] text-rose-400 mt-2 font-bold uppercase">
                          * ข้อมูลเดิมจะไม่สามารถเรียกคืนได้ กรุณาตรวจสอบก่อนยืนยัน
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-[3.5rem] p-20 text-center shadow-2xl">
                   <div className="p-10 bg-slate-50 rounded-[2.5rem] mb-8 border border-slate-100">
                      <Database size={80} className="text-emerald-200" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight uppercase">Dashboard Ready</h2>
                   <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">
                     กรุณาเลือกตารางจากรายการด้านซ้าย <br/>เพื่อเริ่มจัดการข้อมูลใน <b className="text-emerald-600">{userSession.department}</b>
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
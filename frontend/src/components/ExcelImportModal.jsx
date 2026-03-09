import React, { useState } from 'react';
import { Modal, Upload, Table, Button, Steps, Alert, Tag, message, Typography, Progress } from 'antd';
import { UploadCloud, FileSpreadsheet, CheckCircle2, X, ArrowRight, FileWarning, Loader2, FileUp, ShieldCheck } from 'lucide-react';
import ExcelJS from 'exceljs';

const { Dragger } = Upload;
const { Text } = Typography;

export default function ExcelImportModal({ visible, onCancel, tableId, tableName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const requiredColumns = {
    "tb_screening_results": ["cid", "screening_date", "result"],
    "tb_patient_registry": ["cid", "first_name", "last_name", "diagnosis_date"],
  };

  const handleFileUpload = async (file) => {
    setIsReading(true);
    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        
        const jsonData = [];
        const headerRow = worksheet.getRow(1).values;
        const headers = headerRow.filter(Boolean);

        const targetRequired = requiredColumns[tableId] || [];
        const missingCols = targetRequired.filter(col => !headers.includes(col));

        if (missingCols.length > 0) {
          setValidationError(`โครงสร้างไฟล์ไม่ถูกต้อง: ขาดคอลัมน์ ${missingCols.join(', ')}`);
          setIsReading(false);
          return;
        }

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const rowData = {};
          row.values.forEach((value, index) => {
            const headerName = headerRow[index];
            if (headerName) {
              rowData[headerName] = value instanceof Date ? value.toLocaleDateString('th-TH') : value;
            }
          });
          jsonData.push({ ...rowData, key: rowNumber });
        });

        const tableCols = headers.map(h => ({
          title: h,
          dataIndex: h,
          key: h,
          ellipsis: true,
          render: (val) => <Text className="text-[11px] font-medium">{String(val || '-')}</Text>
        }));

        setTimeout(() => {
          setColumns(tableCols);
          setDataSource(jsonData);
          setValidationError(null);
          setCurrentStep(1);
          setIsReading(false);
        }, 800);
      } catch (err) {
        message.error("ไม่สามารถอ่านไฟล์ Excel ได้");
        setIsReading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleConfirm = async () => {
    setLoading(true);
    setTimeout(() => {
      message.success(`นำเข้าข้อมูล ${dataSource.length} รายการ เรียบร้อยแล้ว`);
      setLoading(false);
      resetModal();
    }, 2000);
  };

  const resetModal = () => {
    setCurrentStep(0);
    setDataSource([]);
    setValidationError(null);
    setIsReading(false);
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={resetModal}
      footer={null}
      width={1000}
      centered
      className="import-modal-custom"
    >
      <div className="flex flex-col max-h-[90vh] overflow-hidden bg-white rounded-[2.5rem]">
        
        {/* Modern Header with Gradient Context */}
        <div className="relative p-8 bg-slate-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/20">
                <FileUp size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black m-0 text-white tracking-tight">Data Importer</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Tag color="cyan" className="m-0 border-none bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0 text-[10px]">TARGET</Tag>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{tableName}</span>
                </div>
              </div>
            </div>
            <button onClick={resetModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors group">
              <X size={20} className="text-slate-500 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Dynamic Stepper */}
        <div className="px-12 py-6 bg-slate-50/50 border-b border-slate-100">
          <Steps
            current={currentStep}
            size="small"
            items={[
              { title: 'Upload', icon: <UploadCloud size={16} /> },
              { title: 'Validate', icon: <ShieldCheck size={16} /> },
              { title: 'Finish', icon: <CheckCircle2 size={16} /> },
            ]}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 min-h-[400px]">
          {currentStep === 0 ? (
            <div className="max-w-xl mx-auto mt-4">
              <Dragger 
                accept=".xlsx"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                disabled={isReading}
                className="upload-zone group"
              >
                <div className="py-12 px-6 flex flex-col items-center">
                  {isReading ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                      <div className="relative mb-6">
                        <Loader2 size={64} className="text-emerald-500 animate-spin" />
                        <FileSpreadsheet size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-700">กำลังอ่านข้อมูลจากไฟล์...</h4>
                      <p className="text-slate-400 text-sm">ระบบกำลังตรวจสอบโครงสร้างตารางและชุดข้อมูล</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="mx-auto w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                        <UploadCloud size={40} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 mb-1">นำเข้าไฟล์ข้อมูล Excel</h3>
                        <p className="text-slate-400 text-sm">ลากไฟล์ .xlsx มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์</p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        {requiredColumns[tableId]?.map(col => (
                          <Tag key={col} className="rounded-full px-3 py-1 bg-slate-100 border-none text-slate-500 text-[10px] font-bold">#{col}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Dragger>

              {validationError && (
                <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
                  <Alert
                    message={<span className="font-black text-red-800">พบข้อผิดพลาดด้านโครงสร้าง</span>}
                    description={<span className="text-red-600/80 text-xs font-medium">{validationError}</span>}
                    type="error"
                    showIcon
                    icon={<FileWarning className="text-red-500" />}
                    className="rounded-2xl border-red-50/50 bg-red-50/50 backdrop-blur-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="font-bold text-emerald-800 text-sm">พร้อมนำเข้าข้อมูล {dataSource.length.toLocaleString()} รายการ</span>
                </div>
                <Button 
                   type="text" 
                   size="small" 
                   onClick={() => setCurrentStep(0)} 
                   className="text-slate-400 font-bold hover:text-emerald-600"
                >
                  อัปโหลดไฟล์ใหม่
                </Button>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                <Table 
                  dataSource={dataSource} 
                  columns={columns} 
                  size="small"
                  pagination={{ pageSize: 6, showSizeChanger: false, position: ['bottomCenter'] }}
                  scroll={{ x: 'max-content', y: 320 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-8 bg-white border-t border-slate-50 flex justify-between items-center">
          <Button 
            onClick={resetModal} 
            type="text"
            className="h-12 px-6 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          >
            ยกเลิกการทำงาน
          </Button>
          
          {currentStep === 1 && (
            <Button 
              type="primary" 
              loading={loading}
              onClick={handleConfirm}
              className="h-14 px-10 rounded-2xl bg-slate-900 border-none font-black shadow-2xl shadow-slate-900/20 flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              ยืนยันการบันทึกข้อมูล <ArrowRight size={20} />
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.import-modal-custom .ant-modal-content) { padding: 0 !important; background: transparent !important; box-shadow: none !important; }
        :global(.upload-zone) { 
          background: #ffffff !important; 
          border: 2px dashed #e2e8f0 !important; 
          border-radius: 3rem !important; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        :global(.upload-zone:hover) { border-color: #10b981 !important; background: #f0fdf4 !important; }
        :global(.ant-steps-item-icon) { display: flex !important; align-items: center !important; justify-content: center !important; }
        :global(.ant-steps-item-finish .ant-steps-item-icon) { background: #10b981 !important; border-color: #10b981 !important; }
        :global(.ant-steps-item-active .ant-steps-item-icon) { background: #0f172a !important; border-color: #0f172a !important; }
        :global(.ant-table-thead > tr > th) { background: #f8fafc !important; font-weight: 800 !important; font-size: 10px; color: #64748b !important; border-bottom: 1px solid #f1f5f9 !important; }
      `}</style>
    </Modal>
  );
}
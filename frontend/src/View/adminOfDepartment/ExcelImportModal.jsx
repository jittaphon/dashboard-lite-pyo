// File: src/View/adminOfDepartment/ExcelImportModal.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { 
  X, UploadCloud, ArrowRight, Table as TableIcon, 
  Database, Check, AlertCircle, Trash2, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  MoreVertical, FileSpreadsheet, Loader2,
  CheckCircle2, XCircle, Download, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExcelJS from "exceljs";

export default function ExcelImportModal({ visible, onCancel, tableId, tableName }) {
  // --- States ---
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [uploadResult, setUploadResult] = useState(null); 
  const [uploadError, setUploadError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const rowsPerPage = 50; 
  const menuRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      resetState();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [visible]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const resetState = () => {
    setFile(null); 
    setPreviewData([]); 
    setColumns([]); 
    setCurrentPage(1);
    setActiveMenu(null); 
    setIsUploading(false); 
    setUploadProgress(0);
    setUploadResult(null); 
    setUploadError(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    const isExcel = selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.type === 'application/vnd.ms-excel';
    if (!isExcel) {
      setUploadError('กรุณาอัปโหลดไฟล์นามสกุล .xls หรือ .xlsx เท่านั้น');
      return;
    }

    setIsProcessing(true);

    setTimeout(async () => {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.worksheets[0];

        if (!worksheet || worksheet.rowCount === 0) {
          throw new Error("ไม่พบข้อมูลในไฟล์ Excel");
        }

        let parsedColumns = [];
        let parsedData = [];

        // 1. อ่าน Header และสร้างโครงสร้าง Column
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            parsedColumns.push({
                title: cell.value?.toString() || `Column ${colNumber}`,
                dataIndex: `col_${colNumber}`,
                key: `col_${colNumber}`,
                type: 'VARCHAR'
            });
        });

        // 2. เพิ่มคอลัมน์ "วันที่นำเข้า" ต่อท้ายสุด (System Column)
        const importDateKey = "col_import_date";
        parsedColumns.push({
            title: "วันที่นำเข้า (System)",
            dataIndex: importDateKey,
            key: importDateKey,
            type: 'DATETIME',
            isSystem: true
        });

        // 3. สร้าง Timestamp สำหรับการนำเข้านี้
        const currentTimestamp = new Date().toLocaleString('th-TH', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        // 4. อ่านข้อมูล Row ที่เหลือ
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                let rowData = { key: rowNumber };
                
                parsedColumns.forEach((col, idx) => {
                    if (col.isSystem) {
                        // ถ้าเป็นคอลัมน์ระบบที่เพิ่มมาเอง ให้ใส่ Timestamp
                        rowData[col.dataIndex] = currentTimestamp;
                    } else {
                        // อ่านค่าปกติจาก Excel
                        const cell = row.getCell(idx + 1);
                        let value = cell.value;

                        // จัดการเคสที่เป็น Object (Formula, RichText, Date)
                        if (value && typeof value === 'object') {
                            if (value.result !== undefined) value = value.result;
                            else if (value.richText) value = value.richText.map(rt => rt.text).join("");
                            else if (value instanceof Date) value = value.toLocaleString('th-TH');
                        }

                        rowData[col.dataIndex] = (value !== null && value !== undefined) ? value.toString() : "";
                    }
                });
                parsedData.push(rowData);
            }
        });

        setColumns(parsedColumns);
        setPreviewData(parsedData);
        setFile(selectedFile);
        setCurrentPage(1);
      } catch (error) {
        console.error(error);
        setUploadError(error.message || "เกิดข้อผิดพลาดในการอ่านไฟล์");
      } finally {
        setIsProcessing(false);
      }
    }, 150);
  };

  const deleteRow = (actualIndex) => {
    const newData = [...previewData];
    newData.splice(actualIndex, 1);
    setPreviewData(newData);
    setActiveMenu(null);
  };

  const handleApply = () => {
    if (!file || previewData.length === 0) return;
    setIsUploading(true); 
    setUploadProgress(0); 
    setUploadError(null);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadResult({ total: previewData.length, table: tableName });
        }, 500);
      }
    }, 150);
  };

  const downloadTemplate = async () => {
    if (!columns || columns.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');
    // โหลดเฉพาะคอลัมน์ที่ไม่ใช่ System ออกไปเป็น Template
    const templateCols = columns.filter(c => !c.isSystem).map(col => col.title);
    worksheet.addRow(templateCols);
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Template_${tableName || 'Table'}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(previewData.length / rowsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return previewData.slice(start, start + rowsPerPage);
  }, [previewData, currentPage]);

  const renderTypeIcon = (col) => {
    if (col.isSystem) return "SYS";
    const t = col.type?.toLowerCase() || "";
    if (t.includes('int') || t.includes('decimal')) return "123";
    if (t.includes('date')) return "CAL";
    return "ABC";
  };

  const customStyles = `
    .pq-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
    .pq-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
    .pq-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .row-hover:hover td { background-color: #f8fafc !important; }
    .progress-apple { transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
    @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
    .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%); background-size: 1000px 100%; animation: shimmer 2s infinite linear; }
  `;

  return (
    <AnimatePresence>
      <style>{customStyles}</style>
      {visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onCancel} 
            className="absolute inset-0 bg-gradient-to-br from-emerald-600/95 to-teal-600/95 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className="bg-white w-full max-w-[98vw] h-full md:h-[94vh] rounded-none md:rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col border border-white/20"
          >
            {/* Popups (Success / Error / Loading) */}
            <AnimatePresence>
              {uploadResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[110] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200">
                    <Check size={48} className="text-white" strokeWidth={3} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">นำเข้าข้อมูลสำเร็จ!</h2>
                  <p className="text-slate-500 text-lg mb-10 max-w-sm leading-relaxed">
                    บันทึกข้อมูลจำนวน <span className="text-slate-900 font-bold">{uploadResult.total.toLocaleString()} รายการ</span> เข้าสู่ <span className="block mt-1 font-mono text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full inline-block text-sm">{uploadResult.table}</span>
                  </p>
                  <button onClick={onCancel} className="bg-slate-900 hover:bg-black text-white px-12 py-4 rounded-2xl font-bold active:scale-95 shadow-xl shadow-slate-200">เสร็จสิ้น</button>
                </motion.div>
              )}

              {uploadError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[120] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-red-200">
                    <XCircle size={48} className="text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">เกิดข้อผิดพลาด</h2>
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-10 max-w-md">
                    <p className="text-sm font-mono leading-relaxed">{uploadError}</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setUploadError(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold">ลองอีกครั้ง</button>
                    <button onClick={onCancel} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold">ปิด</button>
                  </div>
                </motion.div>
              )}

              {isUploading && !uploadResult && !uploadError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[105] bg-white/70 backdrop-blur-lg flex flex-col items-center justify-center px-10">
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between items-end mb-4">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600 mb-1">Database Syncing</span>
                        <h3 className="text-2xl font-bold text-slate-900 italic">กำลังนำเข้าข้อมูล...</h3>
                      </div>
                      <span className="text-4xl font-black text-slate-900 font-mono tracking-tighter">{uploadProgress}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-200/50 rounded-full overflow-hidden p-1 border border-white">
                      <motion.div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-full progress-apple relative shadow-inner" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }}>
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border-r border-slate-300 pr-4">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
                    <Database size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Power Upload</span>
                </div>
                <div className="flex gap-2">
                  <label htmlFor="excel-upload" className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 px-4 py-1.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                    <input id="excel-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.xls" />
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase">เลือกไฟล์ Excel</span>
                  </label>
                  <button onClick={downloadTemplate} disabled={columns.length === 0} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50">
                    <Download size={14} className="text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Download Template</span>
                  </button>
                </div>
              </div>
              <button onClick={onCancel} className="hover:bg-white bg-slate-200/50 p-2 rounded-full transition-all text-slate-500 active:scale-90"><X size={18} /></button>
            </div>

            {/* Formula Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-3 text-[11px] shrink-0">
              <div className="italic text-emerald-700 font-serif font-black w-6 border-r border-slate-200 select-none">fx</div>
              <div className="font-mono text-slate-400 truncate px-2 py-0.5 w-full text-xs font-bold">
                = Table.Sync(Source("{file?.name || '---'}"), Target("{tableName}"))
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-52 bg-[#f8fafc] border-r border-slate-200 hidden lg:flex flex-col">
                <div className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Table</div>
                <div className="px-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-3 rounded-2xl border border-emerald-100 shadow-sm text-[11px] font-bold text-slate-700">
                    <TableIcon size={14} className="text-emerald-500" />
                    <span className="truncate">{tableName}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto relative bg-white pq-scrollbar">
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">กำลังประมวลผลไฟล์...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!file && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 z-10">
                    <UploadCloud size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">คลิกเลือกไฟล์เพื่อแสดงข้อมูล...</p>
                  </div>
                )}

                <table className="w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-30">
                    <tr>
                      <th className="w-12 border-r border-b border-slate-300 bg-[#f1f5f9] sticky left-0 z-40"></th>
                      {columns.map((col, idx) => (
                        <th key={`head-${idx}`} className={`border-r border-b border-slate-300 p-0 min-w-[200px] align-top transition-colors ${col.isSystem ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                          <div className="flex flex-col">
                            <div className={`px-4 py-3 flex items-center justify-between border-b border-slate-200 ${col.isSystem ? 'bg-emerald-100/50' : 'bg-slate-100'}`}>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black italic border px-1.5 rounded-md ${col.isSystem ? 'text-emerald-700 border-emerald-300 bg-white' : 'text-slate-500 border-slate-300 bg-white'}`}>
                                  {renderTypeIcon(col)}
                                </span>
                                <span className="text-[11px] font-black uppercase truncate text-slate-800">{col.title}</span>
                              </div>
                              <div className={`${col.isSystem ? 'bg-emerald-600' : 'bg-emerald-500'} rounded-full p-0.5 shadow-sm`}>
                                <Check size={10} className="text-white" strokeWidth={4} />
                              </div>
                            </div>
                            <div className="px-4 py-2 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-[9px] font-bold tracking-tight">
                                <span className={col.isSystem ? "text-emerald-700" : "text-emerald-600"}>{col.isSystem ? "SYSTEM GENERATED" : "MAPPED"}</span>
                                <span className="text-slate-300 font-mono">{col.type}</span>
                              </div>
                              <div className={`h-1.5 w-full rounded-full ${col.isSystem ? 'bg-emerald-600' : 'bg-emerald-500'}`} />
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!isProcessing && currentItems.map((row, rIdx) => {
                      const actualIndex = (currentPage - 1) * rowsPerPage + rIdx;
                      return (
                        <tr key={`row-${actualIndex}`} className="row-hover group transition-colors">
                          <td 
                            className="border-r border-slate-200 bg-[#f8fafc] text-[10px] text-center text-slate-400 font-bold sticky left-0 z-20 cursor-pointer group-hover:bg-emerald-600 group-hover:text-white transition-all"
                            onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setActiveMenu({ index: actualIndex, x: rect.right + 2, y: rect.top }); }}
                          >
                            <div className="flex items-center justify-center gap-1 min-h-[32px]">{actualIndex + 1} <MoreVertical size={10} className="opacity-0 group-hover:opacity-100" /></div>
                          </td>
                          {columns.map((col, cIdx) => {
                            const cellRawValue = row[col.dataIndex];
                            const cellValue = cellRawValue !== undefined && cellRawValue !== null ? cellRawValue.toString() : "";
                            
                            return (
                              <td key={`cell-${actualIndex}-${cIdx}`} 
                                  className={`border-r border-slate-100 px-4 py-2 text-[11px] whitespace-nowrap truncate max-w-[300px] 
                                  ${col.isSystem ? 'text-emerald-700 font-bold bg-emerald-50/20' : 'text-slate-600'}`}>
                                {cellValue === "" ? <span className="text-slate-200 italic">null</span> : cellValue}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {activeMenu && (
                  <div ref={menuRef} className="fixed z-[130] bg-white border border-slate-200 shadow-2xl rounded-2xl py-2 min-w-[180px] animate-in fade-in zoom-in-95" style={{ top: activeMenu.y, left: activeMenu.x }}>
                    <button onClick={() => deleteRow(activeMenu.index)} className="w-[90%] mx-auto my-1 px-4 py-2 text-[11px] font-bold text-left text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
                      <Trash2 size={14} /> Remove Record
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f8fafc] border-t border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                <button disabled={currentPage === 1 || previewData.length === 0} onClick={() => setCurrentPage(1)} className="p-2 hover:bg-slate-50 disabled:opacity-30 active:scale-90 transition-all text-slate-500"><ChevronsLeft size={16} /></button>
                <button disabled={currentPage === 1 || previewData.length === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-2 hover:bg-slate-50 disabled:opacity-30 active:scale-90 transition-all text-slate-500"><ChevronLeft size={16} /></button>
                <div className="px-4 text-[11px] font-bold text-slate-600">หน้า {previewData.length > 0 ? currentPage : 0} / {totalPages}</div>
                <button disabled={currentPage === totalPages || previewData.length === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 hover:bg-slate-50 disabled:opacity-30 active:scale-90 transition-all text-slate-500"><ChevronRight size={16} /></button>
                <button disabled={currentPage === totalPages || previewData.length === 0} onClick={() => setCurrentPage(totalPages)} className="p-2 hover:bg-slate-50 disabled:opacity-30 active:scale-90 transition-all text-slate-500"><ChevronsRight size={16} /></button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onCancel} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">ยกเลิก</button>
                <button onClick={handleApply} disabled={!file || previewData.length === 0} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold px-6 py-2.5 shadow-md flex items-center gap-2 disabled:opacity-50 transition-all">
                  ยืนยันการนำเข้า ({previewData.length.toLocaleString()}) <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
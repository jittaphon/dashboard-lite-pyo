import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { 
  X, UploadCloud, ArrowRight, Table as TableIcon, 
  Database, Check, AlertCircle, Trash2, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  MoreVertical, FileSpreadsheet, Loader2,
  CheckCircle2, XCircle, Download, Clock, Send,
  Sparkles, BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExcelJS from "exceljs";

// ==========================================
// 🔴 ตั้งค่า API KEY ของ GEMINI ที่นี่
// ==========================================


export default function ExcelImportModal({ visible, onCancel, tableId, tableName, columns: dbColumns = [], department, onUpload }) {





  // --- States หลัก ---
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [displayColumns, setDisplayColumns] = useState([]); 
  
  // --- States สำหรับ Raw Data (เก็บไว้ให้ AI ใช้ประมวลผลซ้ำ) ---
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);

  // --- States สถานะการทำงาน ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiMapping, setIsAiMapping] = useState(false); // สถานะตอน AI กำลังคิด
  const [isUploading, setIsUploading] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [uploadResult, setUploadResult] = useState(null); 
  const [uploadError, setUploadError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const rowsPerPage = 50; 
  const menuRef = useRef(null);

  // ตรวจสอบว่ามีข้อมูลจาก Excel ตรงกับโครงสร้าง Database อย่างน้อย 1 คอลัมน์หรือไม่
  const hasMatchedColumns = useMemo(() => {
    return displayColumns.some(col => !col.isSystem && col.isMatched);
  }, [displayColumns]);

  // ตรวจสอบว่ามีคอลัมน์ไหนที่ยังไม่ Match บ้าง (เพื่อเปิด/ปิดปุ่ม AI)
  const hasUnmatchedColumns = useMemo(() => {
    return displayColumns.some(col => !col.isSystem && !col.isMatched);
  }, [displayColumns]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      resetState();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [visible]);

  const resetState = () => {
    setFile(null); 
    setPreviewData([]); 
    setDisplayColumns([]); 
    setRawHeaders([]);
    setRawRows([]);
    setCurrentPage(1);
    setActiveMenu(null); 
    setIsUploading(false); 
    setIsAiMapping(false);
    setUploadProgress(0);
    setUploadResult(null); 
    setUploadError(null);
  };

  // ==========================================
  // 1. ฟังก์ชันสร้างตาราง (ใช้ร่วมกันระหว่างแบบปกติและแบบ AI)
  // ==========================================
const generateTableData = (mappingObject, headers, rows) => {

  // 🔧 normalize แรง (กัน \n, space, symbol)
 const normalize = (s) => {
  if (!s) return "";

  return s
    .toString()
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/\s*([<>+=])\s*/g, "$1") // 👈 FIX ตรงนี้ (ลบ space รอบ > < = +)
    .trim()
    .toLowerCase();
};

  console.log("========== DEBUG START ==========");

  // 🔵 Excel headers
  console.log("📘 EXCEL HEADERS:");
  headers.forEach(h => {
    console.log(`[${h.index}] "${h.name}"`);
  });

  // 🟢 DB columns
  console.log("🗄️ DB COLUMNS:");
  dbColumns.forEach(col => {
    console.log(`key="${col.key}" title="${col.title}" thai="${col.thai_label}"`);
  });

  // 🟡 mapping
  console.log("🧩 MAPPING:");
  console.table(mappingObject);

  // ✅ headerMap (normalize แล้ว)
  const headerMap = {};
  headers.forEach(h => {
    if (!h?.name) return;
    headerMap[normalize(h.name)] = h.index;
  });

  const isSpecialTable = tableId === "tb_patient_risk_records";

  // 🧱 build columns
  const finalColumns = dbColumns.map(col => {

    const candidates = isSpecialTable
      ? [
          mappingObject[col.key],
          col.thai_label,
          col.title,
          col.key
        ]
      : [
          mappingObject[col.key],
          col.thai_label,
          col.key
        ];

    let excelIndex;
    let matchedName;

    for (const name of candidates) {
      if (!name) continue;
      const idx = headerMap[normalize(name)];
      if (idx !== undefined) {
        excelIndex = idx;
        matchedName = name;
        break;
      }
    }

    return {
      ...col,
      excelIndex,
      mappedName: matchedName,
      isMatched: excelIndex !== undefined,
      isSystem: false
    };
  });

  // 🔥 DEBUG TABLE (ดู mapping + ค่า Excel จริง)
  const debugTable = finalColumns.map(col => {
    const sampleRow = rows[0];

    let sampleValue =
      col.excelIndex !== undefined
        ? sampleRow?.values[col.excelIndex]
        : undefined;

    if (sampleValue && typeof sampleValue === "object") {
      if (sampleValue.richText) {
        sampleValue = sampleValue.richText.map(r => r.text).join("");
      } else if (sampleValue.result !== undefined) {
        sampleValue = sampleValue.result;
      } else {
        sampleValue = JSON.stringify(sampleValue);
      }
    }

    return {
      db_key: col.key,
      mapped_to: col.mappedName,
      excel_header: headers.find(h => h.index === col.excelIndex)?.name,
      excel_index: col.excelIndex,
      sample_value: sampleValue,
      status: col.isMatched ? "MATCH ✅" : "MISSING ❌"
    };
  });

  console.log("📊 MATCH TABLE:");
  console.table(debugTable);

  console.log("❌ MISSING ONLY:");
  console.table(debugTable.filter(d => d.excel_index === undefined));

  console.log("========== DEBUG END ==========");

  // 🧾 parse data
  const parsedData = rows.map((row, i) => {
    const obj = { _uId: i };

    finalColumns.forEach(col => {
      let val =
        col.excelIndex !== undefined
          ? row.values[col.excelIndex]
          : "";

      if (val && typeof val === "object") {
        if (val.richText) {
          val = val.richText.map(r => r.text).join("");
        } else if (val.result !== undefined) {
          val = val.result;
        } else {
          val = "";
        }
      }

      obj[col.dataIndex || col.key] = val ?? "";
    });

    return obj;
  });

  setDisplayColumns(finalColumns);
  setPreviewData(parsedData);
};

  // ==========================================
  // 2. เมื่อผู้ใช้อัปโหลดไฟล์ (Exact Match ก่อน)
  // ==========================================
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

      const headers = [];
      const rows = [];
      
      // ฟังก์ชัน Clean ข้อความ (ย้ายออกมาข้างนอกเพื่อให้เรียกใช้ง่าย)
      const clean = (val) => {
        if (!val) return "";
        if (typeof val === "object") {
          if (val.richText) val = val.richText.map(v => v.text).join(" ");
          else if (val.text) val = val.text;
          else if (val.result !== undefined) val = val.result;
          else val = "";
        }
        return val.toString().replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      };

      // --- ส่วนที่ปรับเปลี่ยน: แยก Logic ตาม tableId ---
      
      if (tableId === 'tb_patient_risk_records') {
        // ✅ เคสหัวตาราง 2 แถว (Logic เดิมของคุณ)
        const row1 = worksheet.getRow(1);
        const row2 = worksheet.getRow(2);
        const maxCol = Math.max(row1.cellCount, row2.cellCount);

        for (let col = 1; col <= maxCol; col++) {
          let v1 = clean(row1.getCell(col).value);
          let v2 = clean(row2.getCell(col).value);
          let finalName = v2 || v1; // ใช้ v2 ก่อน ถ้าไม่มีใช้ v1

          if (finalName) {
            headers.push({ name: finalName, index: col });
          }
        }

        // เริ่มเก็บข้อมูลตั้งแต่แถวที่ 3 (เพราะ 1-2 เป็น Header)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 2) {
            rows.push({ rowIndex: rowNumber, values: row.values });
          }
        });

      } else {
        // ✅ เคสหัวตาราง 1 แถวทั่วไป
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          const name = clean(cell.value);
          if (name) {
            headers.push({ name: name, index: colNumber });
          }
        });

        // เริ่มเก็บข้อมูลตั้งแต่แถวที่ 2
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            rows.push({ rowIndex: rowNumber, values: row.values });
          }
        });
      }

      // --- จบส่วนที่ปรับเปลี่ยน ---

      setRawHeaders(headers);
      setRawRows(rows);

      const initialMap = {};
      dbColumns.forEach(c => { initialMap[c.key] = c.title; });

      generateTableData(initialMap, headers, rows);
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

  const handleApply = async () => {
    if (!file || previewData.length === 0 || !hasMatchedColumns) return;

    setIsUploading(true);
    setUploadProgress(0);
  const finalPayload = {
      table_id: tableId,
      table_name: tableName,
      department: department,
      import_at: new Date().toISOString(),
      total_records: previewData.length,
      data: previewData.map(({ _uId, ...rest }) => rest),
      import_date: new Date().toISOString(),
    };


    try {
      const response = await onUpload(finalPayload);

      if (response.status === 200 || response.data?.success) {
        setUploadProgress(100);
        setUploadResult({
          total: previewData.length,
          table: tableName
        });
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        throw new Error("Server responded with an error");
      }
    } catch (err) {
      setUploadError(err.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    if (!dbColumns || dbColumns.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');
    const templateCols = dbColumns.map(col => col.title);
    const headerRow = worksheet.addRow(templateCols);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFE2E8F0'} };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Template_${tableId}.xlsx`;
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
    if (t.includes('int') || t.includes('decimal') || t.includes('double')) return "123";
    if (t.includes('date') || t.includes('time')) return "CAL";
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
    .ai-gradient-text { background: linear-gradient(to right, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  `;

  return (
    <AnimatePresence>
      <style>{customStyles}</style>
      {visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onCancel} 
            className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} 
            className="bg-white w-full max-w-[98vw] h-full md:h-[94vh] rounded-none md:rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col border border-white/20"
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
                  <div className="flex flex-col items-center gap-2">
                    <button onClick={onCancel} className="bg-slate-900 hover:bg-black text-white px-12 py-4 rounded-2xl font-bold active:scale-95 shadow-xl shadow-slate-200">เสร็จสิ้น</button>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                       <Clock size={10} /> Auto refreshing page...
                    </span>
                  </div>
                </motion.div>
              )}

              {uploadError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[120] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-red-200">
                    <XCircle size={48} className="text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">เกิดข้อผิดพลาด</h2>
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-10 max-w-md">
                    <p className="text-sm font-mono leading-relaxed">{uploadError}</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setUploadError(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold">ปิดหน้าต่างนี้</button>
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
              
              {/* AI Loading Overlay */}
              {isAiMapping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[105] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center px-10">
                  <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/10 border border-indigo-100 flex flex-col items-center gap-6 max-w-sm text-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                      <BrainCircuit className="w-16 h-16 text-indigo-600 relative z-10 animate-bounce" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 ai-gradient-text">AI is Mapping Columns...</h3>
                      <p className="text-sm text-slate-500">Gemini กำลังวิเคราะห์และจับคู่ข้อมูลจาก Excel ให้เข้ากับฐานข้อมูลของคุณ</p>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full animate-[shimmer_1s_infinite]"></div>
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
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight hidden sm:block">Power Upload</span>
                </div>
                
                <div className="flex gap-2">
                  <label htmlFor="excel-upload" className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 px-4 py-1.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                    <input id="excel-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.xls" />
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase">เลือกไฟล์ Excel</span>
                  </label>

                  {/*
                  <AnimatePresence>
                    {file && hasUnmatchedColumns && (
                        <motion.button 
                            initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                            onClick={handleAiAutoMap}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 border-0 px-4 py-1.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 text-white transition-all active:scale-95 overflow-hidden whitespace-nowrap"
                        >
                            <Sparkles size={14} className="animate-pulse" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">AI Auto-Map</span>
                        </motion.button>
                    )}
                  </AnimatePresence>
                  /* 🌟 ปุ่มเรียกใช้ AI (จะแสดงก็ต่อเมื่อมีไฟล์และยังมีคอลัมน์ที่ไม่ตรง) */}

                  <button onClick={downloadTemplate} disabled={dbColumns.length === 0} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50">
                    <Download size={14} className="text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase hidden sm:block">Template</span>
                  </button>
                </div>
              </div>
              <button onClick={onCancel} className="hover:bg-white bg-slate-200/50 p-2 rounded-full transition-all text-slate-500 active:scale-90"><X size={18} /></button>
            </div>

            {/* Formula Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-3 text-[11px] shrink-0">
              <div className="italic text-emerald-700 font-serif font-black w-6 border-r border-slate-200 select-none">fx</div>
              <div className="font-mono text-slate-400 truncate px-2 py-0.5 w-full text-xs font-bold">
                = Table.Sync(Source("{file?.name || '---'}"), Target("{tableName}"), Department("{department}"))
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-52 bg-[#f8fafc] border-r border-slate-200 hidden lg:flex flex-col">
               <div className="shrink-0">
    <div className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Table</div>
    <div className="px-3 pb-4">
      <div className="flex flex-col gap-2 bg-white px-3 py-3 rounded-2xl border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <TableIcon size={14} className="text-emerald-500" />
          <span className="truncate">{tableName}</span>
        </div>
        <div className="text-[9px] text-slate-400 font-mono italic px-6">{tableId}</div>
      </div>
    </div>
  </div>


                

                {/* Status Box */}
                {file && (
                    <div className="mt-auto p-4 border-t border-slate-200">
                         <div className="bg-slate-100 rounded-xl p-3 text-xs">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-500">Columns</span>
                                <span className="font-bold">{displayColumns.filter(c=>!c.isSystem).length}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-emerald-600">Matched</span>
                                <span className="font-bold text-emerald-600">{displayColumns.filter(c=>!c.isSystem && c.isMatched).length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-orange-500">Missing</span>
                                <span className="font-bold text-orange-500">{displayColumns.filter(c=>!c.isSystem && !c.isMatched).length}</span>
                            </div>
                         </div>
                    </div>
                )}
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
                    <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">อัปโหลดไฟล์ที่ตรงกับโครงสร้าง {tableName}</p>
                  </div>
                )}

                <table className="w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-30">
                    <tr>
                      <th className="w-12 border-r border-b border-slate-300 bg-[#f1f5f9] sticky left-0 z-40"></th>
                      {displayColumns.map((col, idx) => {
                        // เช็คว่า AI แมปให้หรือ Exact แมป (อนุมานง่ายๆ ว่าถ้าชื่อคอลัมน์ไม่ตรงกันเป๊ะ แปลว่าเกิดจากการจับคู่ของ AI หรือแปลความ)
                        const isMappedByAi = col.isMatched && !col.isSystem && (col.mappedName !== col.title && col.mappedName !== col.key);

                        return (
                        <th key={`head-col-${idx}-${col.key}`} className={`border-r border-b border-slate-300 p-0 min-w-[220px] align-top transition-colors ${col.isSystem ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                          <div className="flex flex-col">
                            <div className={`px-4 py-3 flex items-center justify-between border-b border-slate-200 ${col.isSystem ? 'bg-emerald-100/50' : 'bg-slate-100'}`}>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className={`text-[10px] font-black italic border px-1.5 rounded-md ${col.isSystem ? 'text-emerald-700 border-emerald-300 bg-white' : 'text-slate-500 border-slate-300 bg-white'}`}>
                                  {renderTypeIcon(col)}
                                </span>
                                <span className="text-[11px] font-black uppercase truncate text-slate-800" title={col.title}>{col.title}</span>
                              </div>
                              {col.isMatched ? (
                                <div className={`${col.isSystem ? 'bg-emerald-600' : (isMappedByAi ? 'bg-indigo-500' : 'bg-emerald-500')} rounded-full p-0.5 shadow-sm shrink-0`} title={isMappedByAi ? `AI Mapped to: ${col.mappedName}` : 'Matched'}>
                                  {isMappedByAi ? <Sparkles size={10} className="text-white" /> : <Check size={10} className="text-white" strokeWidth={4} />}
                                </div>
                              ) : (
                                <div className="bg-orange-500 rounded-full p-0.5 shadow-sm shrink-0 animate-pulse" title="ไม่พบคอลัมน์นี้ในไฟล์ Excel">
                                  <AlertCircle size={10} className="text-white" strokeWidth={4} />
                                </div>
                              )}
                            </div>
                           <div className="px-4 py-2 flex flex-col gap-1.5">
  <div className="flex justify-between items-center text-[9px] font-bold tracking-tight">
    <span className={col.isSystem ? "text-emerald-700" : (col.isMatched ? "text-emerald-600" : "text-orange-600")}>
      {col.isSystem ? "SYSTEM GENERATED" : (col.isMatched ? "MAPPED SUCCESS" : "COLUMN MISSING")}
    </span>
    <span className="text-slate-300 font-mono">{col.type}</span>
  </div>
  <div className={`h-1.5 w-full rounded-full ${col.isSystem ? 'bg-emerald-600' : (col.isMatched ? 'bg-emerald-500' : 'bg-orange-400')}`} />
</div>
                          </div>
                        </th>
                      )})}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!isProcessing && currentItems.map((row, rIdx) => {
                      const actualIndex = (currentPage - 1) * rowsPerPage + rIdx;
                      return (
                        <tr key={row._uId} className="row-hover group transition-colors">
                          <td 
                            className="border-r border-slate-200 bg-[#f8fafc] text-[10px] text-center text-slate-400 font-bold sticky left-0 z-20 cursor-pointer group-hover:bg-emerald-600 group-hover:text-white transition-all"
                            onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setActiveMenu({ index: actualIndex, x: rect.right + 2, y: rect.top }); }}
                          >
                            <div className="flex items-center justify-center gap-1 min-h-[32px]">{actualIndex + 1} <MoreVertical size={10} className="opacity-0 group-hover:opacity-100" /></div>
                          </td>
                          {displayColumns.map((col, cIdx) => {
                            const value = row[col.dataIndex || col.key];
                            const isMissing = !col.isSystem && !col.isMatched;
                            return (
                              <td key={`cell-${row._uId}-${cIdx}`} 
                                  className={`border-r border-slate-100 px-4 py-2 text-[11px] whitespace-nowrap truncate max-w-[300px] 
                                  ${col.isSystem ? 'text-emerald-700 font-bold bg-emerald-50/20' : 'text-slate-600'}
                                  ${isMissing ? 'bg-orange-50/30' : ''}`}>
                                {(!value || value === "") ? (
                                    <span className={isMissing ? "" : ""}>
                                        {isMissing ? "missing col" : "0"}
                                    </span>
                                ) : value}
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
                {!hasMatchedColumns && file && !isProcessing && (
                  <span className="text-red-500 text-[11px] font-bold animate-pulse px-2">
                    * ไม่พบคอลัมน์ที่ตรงกัน กรุณากดปุ่ม AI Auto-Map
                  </span>
                )}
                <div className="hidden md:block px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200">
                  Target: {tableId}
                </div>
                <button onClick={onCancel} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">ยกเลิก</button>
                <button 
                    onClick={handleApply} 
                    disabled={!file || previewData.length === 0 || !hasMatchedColumns || isUploading || uploadResult} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold px-6 py-2.5 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isUploading ? "กำลังส่งข้อมูล..." : `ยืนยันนำเข้า (${previewData.length.toLocaleString()})`} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
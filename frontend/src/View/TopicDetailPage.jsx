// pages/TopicDetailPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, RefreshCcw, MapPin, Search, 
  ChevronDown, Info, AlertCircle, Clock 
} from "lucide-react";
import useLayoutStore from '../Store/useLayoutStore';
import RGL, { WidthProvider } from "react-grid-layout";
import DynamicTable from "../components/MaterialDisplay/DynamicTable";
import DynamicChart from "../components/MaterialDisplay/DynamicChart";
import DynamicDonutChart from "../components/MaterialDisplay/DynamicDonutChart";
import {API} from "../api";
// อย่าลืม Import API ของคุณด้วยนะครับ
// import API from "../services/api"; 

const GridLayout = WidthProvider(RGL);

export default function TopicDetailPage() {
  const { departmentKey, year, topicKey } = useParams();
  const navigate = useNavigate();
  
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmpur, setSelectedAmpur] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. CONNECT TO REAL API ──────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Fetching data for Topic: ${topicKey}, Year: ${year}`);
        
        // เรียกใช้ API จริงของคุณ
        const response = await API.departmentAPI.getReportByUUID(topicKey, year);
        console.log("API Response:", response);

        // นำข้อมูลจาก API มาเก็บใน State 
        // (ปรับโครงสร้างให้ตรงกับที่ DynamicTable/Chart ต้องการ)
        setApiData(response.data); 

      } catch (err) {
        console.error("API Error:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsLoading(false);
      }
    };

    if (topicKey && year) {
      fetchData();
    }
  }, [topicKey, year]);


  console.log("Current API Data State:", apiData);

  // --- 2. LOGIC: FILTER & SEARCH (ใช้จากข้อมูล API จริง) ────────
  const ampurList = useMemo(() => {
    // สมมติว่าข้อมูลตารางอยู่ใน apiData.data หรือ apiData ตรงๆ
    const rawData = apiData?.data || apiData || [];
    if (!Array.isArray(rawData)) return ["all"];
    return ["all", ...new Set(rawData.map(item => item.ampur).filter(Boolean))];
  }, [apiData]);

  const filteredData = useMemo(() => {
    const rawData = apiData?.data || apiData || [];
    if (!Array.isArray(rawData)) return [];
    
    return rawData.filter(item => {
      const matchAmpur = selectedAmpur === "all" || item.ampur === selectedAmpur;
      const matchSearch = Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchAmpur && matchSearch;
    });
  }, [apiData, selectedAmpur, searchTerm]);

  // --- 3. WIDGET RENDERER ──────────────────────────────────
  function renderWidget(item) {
    if (isLoading) return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <RefreshCcw className="animate-spin text-emerald-500 w-8 h-8" />
        <span className="text-slate-400 text-xs font-medium">Loading Data...</span>
      </div>
    );

    if (error) return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-rose-500 p-4 text-center">
        <AlertCircle size={40} strokeWidth={1.5} />
        <p className="text-sm font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="text-xs underline">ลองใหม่อีกครั้ง</button>
      </div>
    );
    
    switch (item.id) {
      case "chart": return <DynamicChart data={filteredData} />;
      case "donut": return <DynamicDonutChart data={filteredData} />;
      case "table": return <DynamicTable data={filteredData} />;
      default: return null;
    }
  }

  const layoutConfig = {
    gridLayout: [
      { i: 'donut-widget', x: 0, y: 0, w: 4, h: 4 },
      { i: 'chart-widget', x: 4, y: 0, w: 8, h: 4 },
      { i: 'table-widget', x: 0, y: 4, w: 12, h: 5.5 }
    ],
    items: [
      { uid: 'donut-widget', id: 'donut', icon: '🍩', label: 'Proportion' },
      { uid: 'chart-widget', id: 'chart', icon: '📊', label: 'Statistics Bar' },
      { uid: 'table-widget', id: 'table', icon: '📋', label: 'Data Explorer' }
    ]
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#065f46] to-[#0d4a3e] flex flex-col p-6 overflow-hidden font-sans">
      
      {/* HEADER AREA */}
      <header className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all border border-white/20">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-400 text-[#064e3b] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">Real-time</span>
              <span className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Info size={10} /> {departmentKey}</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm leading-none">
              {apiData?.title || apiData?.config?.title || "รายละเอียดข้อมูล"}
            </h1>
          </div>
        </div>
        
        {/* Last Update Info */}
        <div className="hidden md:flex flex-col items-end opacity-80">
          <span className="text-emerald-200/50 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <Clock size={10}/> อัปเดตล่าสุด
          </span>
          <span className="text-white font-medium text-sm">{apiData?.lastUpdate || "-"}</span>
        </div>
      </header>

      {/* 🌟 UNIFIED CONTROL CENTER 🌟 */}
      <div className="bg-white/95 backdrop-blur-2xl p-2.5 rounded-[2rem] shadow-2xl border border-white/40 mb-6 flex flex-wrap items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[250px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input 
            type="text" 
            placeholder="ค้นหาข้อมูล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-100/50 border-none rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1" />

        {/* Ampur Filter */}
        <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-3 rounded-2xl border border-slate-200/50 relative group cursor-pointer">
          <MapPin size={18} className="text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-0.5">พื้นที่อำเภอ</span>
            <div className="flex items-center gap-2">
              <select 
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none pr-6 z-10"
                value={selectedAmpur}
                onChange={(e) => setSelectedAmpur(e.target.value)}
              >
                {ampurList.map(a => <option key={a} value={a} className="text-slate-800">{a === 'all' ? 'ทุกพื้นที่' : a}</option>)}
              </select>
              <ChevronDown className="absolute right-4 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Year Label */}
        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-600 rounded-2xl shadow-lg border border-emerald-500/50">
          <Calendar className="w-5 h-5 text-emerald-100" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-emerald-200/80 uppercase leading-none mb-0.5">ปีงบประมาณ</span>
            <span className="text-white font-black text-sm leading-none">{year}</span>
          </div>
        </div>

        {/* Reset */}
        <button 
          onClick={() => {setSearchTerm(""); setSelectedAmpur("all");}}
          className="p-3 hover:bg-rose-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* DASHBOARD GRID AREA */}
      <div className="flex-1 relative overflow-hidden bg-black/10 rounded-[3rem] border border-white/5 shadow-inner p-4">
        <div className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar">
          <GridLayout
            className="layout"
            layout={layoutConfig.gridLayout}
            cols={12}
            rowHeight={window.innerHeight / 13} 
            margin={[20, 20]}
            isDraggable={false}
            isResizable={false}
          >
            {layoutConfig.items.map((item) => (
              <div key={item.uid} className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/60">
                <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                  </div>
                </div>
                <div className="flex-1 relative h-full p-4 overflow-hidden">
                  {renderWidget(item)}
                </div>
              </div>
            ))}
          </GridLayout>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        select { -webkit-appearance: none; appearance: none; }
      `}} />
    </div>
  );
}
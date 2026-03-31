import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BarChart3, 
  Table as TableIcon, 
  Activity, 
  Users, 
  Bed, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Hospital 
} from "lucide-react";
import RGL, { WidthProvider } from "react-grid-layout";
import { API } from "../api";
import { getReportConfig } from "../utils/reportRegistry";

// Import Components
import StatCard from "../components/MaterialDisplay/StatCard";
import DynamicChart from "../components/MaterialDisplay/DynamicChart";
import DynamicTable from "../components/MaterialDisplay/DynamicTable";
import DynamicHeatmapChart from "../components/MaterialDisplay/DynamicHeatmapChart";
import DynamicStackChart from "../components/MaterialDisplay/DynamicStackChart";
import DynamicChartNotPecentage from "../components/MaterialDisplay/DynamicChartNotPecentage";  
const GridLayout = WidthProvider(RGL);

// 🔍 Icon Mapper: เลือกไอคอนอัตโนมัติตามชื่อ Label
const getAutoIcon = (label = "") => {
  const text = label.toLowerCase();
  if (text.includes("คนไข้") || text.includes("ผู้ป่วย") || text.includes("patient")) return Users;
  if (text.includes("เตียง") || text.includes("bed")) return Bed;
  if (text.includes("เวลา") || text.includes("รอ") || text.includes("time")) return Clock;
  if (text.includes("สำเร็จ") || text.includes("ผ่าน") || text.includes("success")) return CheckCircle2;
  if (text.includes("เสี่ยง") || text.includes("error") || text.includes("ตาย")) return AlertCircle;
  if (text.includes("แนวโน้ม") || text.includes("เป้าหมาย")) return TrendingUp;
  if (text.includes("โรงพยาบาล") || text.includes("ตึก")) return Hospital;
  return Activity; // Default
};

export default function TopicDetailPage() {
  const { year, topicKey } = useParams();
  const navigate = useNavigate();
  
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await API.departmentAPI.getReportByUUID(topicKey, year);
        
        setApiResponse(response.data);
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [topicKey, year]);

  const reportConfig = useMemo(() => getReportConfig(apiResponse?.config?.code), [apiResponse]);

  const filteredData = useMemo(() => {
    const raw = apiResponse?.data || [];
    if (!searchTerm) return raw;
    return raw.filter(item => 
      Object.values(item).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [apiResponse, searchTerm]);

  if (isLoading) return <div className="h-screen flex items-center justify-center text-white font-bold text-xl">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-emerald-700 to-teal-800 flex flex-col p-6 overflow-hidden">
      
      {/* --- Header S-Curve Design --- */}
      <header className="relative mb-6 h-32 shrink-0 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden flex items-stretch">
        <div 
          className="relative z-10 flex-[1.6] flex items-center px-10 gap-6 bg-transparent"
          style={{ clipPath: "polygon(0 0, 95% 0, 85% 100%, 0% 100%)" }}
        >
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-2xl text-white border border-white/30 transition-all shadow-lg group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-10 w-[1px] bg-white/30 mx-2" />
          <div>
            <h1 className="text-3xl font-black text-white leading-tight drop-shadow-lg">
              {apiResponse?.config?.title || " "} 
              <span className="ml-3 text-emerald-200/80 font-medium text-xl">ปีงบประมาณ {year}</span>
            </h1>
            <span className="px-3 py-1 bg-black/20 rounded-lg text-[10px] text-emerald-300 font-bold uppercase tracking-[0.2em] border border-white/5">
                PHAYAO MOPH EXECUTIVE DASHBOARD
            </span>
          </div>
        </div>

        <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="h-full w-full">
            <path d="M 750,0 C 800,0 780,100 830,100 L 1000,100 L 1000,0 Z" className="fill-rose-500/90" />
            <path d="M 750,0 C 800,0 780,100 830,100" fill="none" stroke="white" strokeWidth="0.5" className="opacity-20" />
          </svg>
        </div>
      </header>

      {/* --- Grid Content Area --- */}
      <div className="flex-1 relative bg-black/10 rounded-[3rem] p-6 border border-white/10 shadow-inner">
        <div className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar">
          <GridLayout
            className="layout"
            layout={reportConfig?.layout || []}
            cols={12}
            rowHeight={window.innerHeight / 18}
            margin={[24, 24]}
            isDraggable={false}
          >
            {reportConfig?.widgets?.map((widget) => {
              if (typeof widget.transform !== 'function') return null;
              const transformedData = widget.transform(filteredData, apiResponse?.summary_data);
              

              // 🚀 1. แยก Render เฉพาะ Card (ไม่มีกรอบครอบ)
             if (widget.type === 'card') {
  // ดักไว้ก่อนเลย ถ้าไม่มีข้อมูลให้ข้ามไป หรือโชว์เป็นค่า 0
  const safeData = transformedData || {}; 

  return (
    <div key={widget.id}>
      <StatCard 
        label={widget.label}
        value={safeData.value ?? "N/A"} // ✅ ปลอดภัย 100%
        unit={safeData.unit || ""}
        color={safeData.color || "text-slate-500"}
        description={safeData.description || "ไม่มีข้อมูล"}
        icon={getAutoIcon(widget.label)}
      />
    </div>
  );
}

              // 📊 2. Render กราฟและตาราง (มี Header Box)
              return (
                <div key={widget.id} className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/80">
                  <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                      {widget.type.includes('bar') ? <BarChart3 size={20} /> : <TableIcon size={20} />}
                    </div>
                    <span className="text-lg font-black text-slate-700 uppercase tracking-tight">{widget.label}</span>
                  </div>
                  <div className="flex-1 relative p-6 overflow-hidden">
                    {widget.type === 'bar' && <DynamicChart data={transformedData} type={widget.type} />}
                    {widget.type === 'heatmap' && <DynamicHeatmapChart data={transformedData} title={widget.label} />}
                    {widget.type === 'table' && <DynamicTable data={transformedData} />}
                    {widget.type === 'stacked-bar' && <DynamicStackChart data={transformedData} type={widget.type}  />}
                    {widget.type === 'bar-not-percentage' && <DynamicChartNotPecentage data={transformedData} type={widget.type}  />  }
                  </div>
                </div>
              );
            })}
          </GridLayout>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: rgba(255,255,255,0.15); 
            border-radius: 20px; 
            border: 2px solid transparent;
            background-clip: content-box;
        }
      `}</style>
    </div>
  );
} 
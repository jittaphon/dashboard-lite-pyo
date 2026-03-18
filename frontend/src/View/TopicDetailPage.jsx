import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, BarChart3, Table as TableIcon } from "lucide-react";
import RGL, { WidthProvider } from "react-grid-layout";
import { API } from "../api";
import { getReportConfig } from "../utils/reportRegistry";

// Import Components
import StatCard from "../components/MaterialDisplay/StatCard";
import DynamicChart from "../components/MaterialDisplay/DynamicChart";
import DynamicTable from "../components/MaterialDisplay/DynamicTable";
import DynamicHeatmapChart from "../components/MaterialDisplay/DynamicHeatmapChart";
const GridLayout = WidthProvider(RGL);

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
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [topicKey, year]);

  const reportConfig = useMemo(() => {
    return getReportConfig(apiResponse?.config?.code);
  }, [apiResponse]);

  const filteredData = useMemo(() => {
    const raw = apiResponse?.data || [];
    if (!searchTerm) return raw;
    return raw.filter(item => 
      Object.values(item).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [apiResponse, searchTerm]);

  const totalSummary = useMemo(() => {
    if (!apiResponse?.data) return 0;
    return apiResponse.data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  }, [apiResponse]);

  if (isLoading) return <div className="h-screen flex items-center justify-center text-white font-bold">กำลังโหลด...</div>;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-emerald-600/95 to-teal-600/95 flex flex-col p-6 overflow-hidden">
      
      {/* --- New S-Curve Header (Fixed Division Line) --- */}
      <header className="relative mb-6 h-32 shrink-0 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden flex items-stretch">
        
        {/* ส่วนสีเขียว (Left) - ใช้ clip-path เพื่อลบเส้นแบ่งตรงๆ ออก */}
        <div 
          className="relative z-10 flex-[1.6] flex items-center px-8 gap-6 bg-transparent"
          style={{
            clipPath: "polygon(0 0, 95% 0, 85% 100%, 0% 100%)", // ตัดท้ายให้เฉียงรอรับส่วนโค้ง
          }}
          
        >
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-2xl text-white border border-white/20 transition-all shadow-lg group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="h-12 w-[1px] bg-white/20 mx-1" />

          <div>
           <h1 className="text-2xl font-black text-white leading-tight drop-shadow-md">
    {apiResponse?.config?.title || " "} 
    <span className="ml-2">ปีงบประมาณ {year}</span>
</h1>
            <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] text-emerald-50 font-bold uppercase tracking-widest border border-white/10">
                    PHAYAO MOPH Dashboard
                </span>
             
            </div>
          </div>
        </div>

        {/* --- ส่วนที่เป็น S-CURVE OVERLAY --- */}
        <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
          <svg 
    viewBox="0 0 1000 100" 
    preserveAspectRatio="none" 
    className="h-full w-full"
>
    {/* 1. แผ่นสีชมพู - เริ่มที่ 750 */}
    <path 
        d="M 750,0 
           C 800,0 780,100 830,100 
           L 1000,100 L 1000,0 Z" 
        className="fill-rose-500"
    />
    
    {/* 2. เงาขอบ - ต้องเริ่ม 750 เหมือนกัน */}
    <path 
        d="M 750,0 C 800,0 780,100 830,100" 
        fill="none" 
        stroke="rgba(0,0,0,0.15)" 
        strokeWidth="2"
        className="blur-[2px]"
    />

    {/* 3. ไฮไลท์ขาว - เริ่ม 751 (ขยับมา 1 หน่วยให้เห็นขอบชัด) */}
    <path 
        d="M 751,0 C 801,0 781,100 831,100" 
        fill="none" 
        stroke="rgba(255,255,255,0.2)" 
        strokeWidth="1"
    />
</svg>
        </div>

        {/*
        <div className="relative z-30 flex-1 flex flex-col justify-center items-end pr-12 text-white">
            <div className="text-right">
                <p className="text-rose-100/70 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Summary</p>
                <div className="flex items-baseline justify-end gap-2">
                    <span className="text-5xl font-black tracking-tighter drop-shadow-xl">
                        {totalSummary.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold opacity-70 italic">Units</span>
                </div>
            </div>
        </div>
         ส่วนข้อมูลฝั่งขวา (Text & Total) */}
      </header>

      {/* Grid Content */}
      <div className="flex-1 relative overflow-hidden bg-black/10 rounded-[2.8rem] p-5 border border-white/5 shadow-inner">
        <div className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar">
          <GridLayout
            className="layout"
            layout={reportConfig?.layout || []}
            cols={12}
            rowHeight={window.innerHeight / 16}
            margin={[20, 20]}
            isDraggable={false}
          >
            {reportConfig?.widgets?.map((widget) => (
              <div key={widget.id} className="bg-white rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden border border-white/80 group">
                <div className="px-8 py-5 bg-slate-50/40 border-b border-slate-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                        {widget.type === 'bar' ? <BarChart3 size={18} /> : <TableIcon size={18} />}
                    </div>
                    <span className="text-[17px] font-black text-slate-700 uppercase tracking-tight">{widget.label}</span>
                  </div>
                </div>
                <div className="flex-1 relative p-5 overflow-hidden">
 {(() => {
                    // 🛡️ กันพัง: ตรวจสอบว่ามี transform function ไหม
                    if (typeof widget.transform !== 'function') return null;
                    
                    const transformedData = widget.transform(filteredData);

                    switch (widget.type) {
                      case 'card':
                        return (
                          <StatCard 
                            label={widget.label}
                            value={transformedData.value}
                            unit={transformedData.unit}
                            color={transformedData.color}
                            description={transformedData.description}
                          />
                        );
                      case 'bar':
                      case 'bar-stack':
                        return <DynamicChart data={transformedData} type={widget.type} />;
                      case 'heatmap':
                        return <DynamicHeatmapChart data={transformedData} title={widget.label} />;
                      case 'table':
                        return <DynamicTable data={transformedData} />;
                      default:
                        return <div className="p-4 text-slate-400 text-sm">Unknown Widget Type</div>;
                    }
                  })()}
</div>
              </div>
            ))}
          </GridLayout>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: rgba(255,255,255,0.2); 
            border-radius: 10px; 
        }
      `}</style>
    </div>
  );
}
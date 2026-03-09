// TopicDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Calendar, Database, LayoutDashboard, RefreshCcw } from "lucide-react";
import useDepartmentStore from '../Store/useDepartmentStore';
import useLayoutStore from '../Store/useLayoutStore';
import RGL, { WidthProvider } from "react-grid-layout";

const GridLayout = WidthProvider(RGL);

export default function TopicDetailPage() {
  const { departmentKey, year, topicKey } = useParams();
  const navigate = useNavigate();
  
  // Store Hooks
  const departments = useDepartmentStore((state) => state.departments);
  const getLayout = useLayoutStore((state) => state.getLayout);
  
  // Local States for Data
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // 1. ─── PREPARE API CALL (MOCK) ──────────────────────────────
  useEffect(() => {
    setIsVisible(true);
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching data for: Topic[${topicKey}] Year[${year}] Dept[${departmentKey}]`);
        
        // จำลองการเรียก API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock Response
        setApiData({
          title: "ข้อมูลจำลอง (Mock Data)",
          year: year,
          lastUpdate: new Date().toLocaleString('th-TH'),
          stats: [10, 20, 30, 40] // ข้อมูลที่จะเอาไปใส่ Chart
        });
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicKey, year]); // เมื่อปีหรือหัวข้อเปลี่ยน ให้เรียก API ใหม่

  // 2. ─── RENDER COMPONENTS ────────────────────────────────────
  function renderWidget(item) {
    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50">
          <RefreshCcw className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading API Data...</p>
        </div>
      );
    }

    switch (item.id) {
      case "chart":
        return (
          <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
             <div className="text-4xl mb-2">📊</div>
             <p className="font-black text-emerald-800">Chart for {year}</p>
             <p className="text-[10px] text-emerald-600/60 font-mono mt-1">Ref: {topicKey}</p>
          </div>
        );
      case "table":
        return (
          <div className="w-full h-full p-6 bg-white">
             <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <Database size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Data Table - FY{year}</span>
             </div>
             <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 w-full bg-slate-50 rounded-lg animate-pulse" />
                ))}
             </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <LayoutDashboard size={40} opacity={0.2} />
          </div>
        );
    }
  }

  const savedLayout = getLayout(topicKey);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8">
      
      {/* Navigation & Header */}
      <div className={`max-w-7xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-white transition-all"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">ย้อนกลับ</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span className="text-white font-black text-sm">ปีงบประมาณ {year}</span>
            </div>
          </div>
        </div>

        {/* Topic Info Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <h4 className="text-emerald-200/70 text-sm font-bold uppercase tracking-[0.2em] mb-2">Department: {departmentKey}</h4>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {topicKey} <span className="text-emerald-300/50">Dashboard</span>
          </h1>
        </div>

        {/* Grid Layout Container */}
        <div className="bg-black/5 backdrop-blur-sm rounded-[3rem] p-4 border border-white/5">
          {savedLayout ? (
            <GridLayout
              className="layout"
              layout={savedLayout.gridLayout}
              cols={12}
              rowHeight={60}
              isDraggable={false}
              isResizable={false}
              margin={[20, 20]}
            >
              {savedLayout.items.map((item) => (
                <div key={item.uid} className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-white/50 group">
                  <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                    <span className="text-slate-700 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span> {item.label}
                    </span>
                  </div>
                  <div className="h-[calc(100%-54px)]">
                    {renderWidget(item)}
                  </div>
                </div>
              ))}
            </GridLayout>
          ) : (
            <div className="py-20 text-center text-white/40">
              <LayoutDashboard size={64} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">No Layout Configured for {topicKey}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
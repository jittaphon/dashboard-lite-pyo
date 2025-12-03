// ManagementPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PhayaoMap from "../components/Map";
import ConfigTableModal from "../components/ConfigModal/ConfigTableModal"; // 👈 เพิ่ม
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { X, Save, ArrowLeft } from "lucide-react";
import useLayoutStore from "../Store/useLayoutStore";
import useDepartmentStore from "../Store/useDepartmentStore";




const GridLayout = WidthProvider(RGL);

export default function ManagementPage() {
  const { topicKey } = useParams();
  const navigate = useNavigate();
  
  const saveLayout = useLayoutStore((state) => state.saveLayout);
  const getLayout = useLayoutStore((state) => state.getLayout);
  const departments = useDepartmentStore((state) => state.departments);

  const toolbox = [
    { id: "map", label: "แผนที่ Phayao", icon: "🗺️", color: "from-blue-400 to-blue-600" },
    { id: "chart", label: "กราฟสถิติ", icon: "📊", color: "from-green-400 to-green-600" },
    { id: "table", label: "ตารางข้อมูล", icon: "📋", color: "from-purple-400 to-purple-600" },
    { id: "analytics", label: "การวิเคราะห์", icon: "📈", color: "from-orange-400 to-orange-600" },
  ];

  const [canvasItems, setCanvasItems] = useState([]);
  const [layout, setLayout] = useState([]);
  const [isSaved, setIsSaved] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false); // 👈 เพิ่ม

  const topicInfo = React.useMemo(() => {
    for (const dept of departments) {
      const topic = dept.topic?.find(t => t.key === topicKey);
      if (topic) {
        return { department: dept, topic: topic };
      }
    }
    return null;
  }, [departments, topicKey]);

  useEffect(() => {
    if (topicKey) {
      const savedLayout = getLayout(topicKey);
      if (savedLayout) {
        setCanvasItems(savedLayout.items);
        setLayout(savedLayout.gridLayout);
        setIsSaved(true);
      }
    }
  }, [topicKey, getLayout]);

  useEffect(() => {
    setIsSaved(false);
  }, [canvasItems, layout]);

  function handleAddToCanvas(toolId) {
    // 👇 ถ้าเป็น table ให้เปิด config modal
    if (toolId === 'table') {
      setShowConfigModal(true);
      return;
    }

    // Component อื่นๆ เพิ่มตามปกติ
    const tool = toolbox.find((t) => t.id === toolId);
    const newId = `${toolId}-${Date.now()}`;
    const newY = layout.length > 0 ? Math.max(...layout.map(l => l.y + l.h)) : 0;
    
    const newItem = { ...tool, uid: newId };
    const newLayoutItem = {
      i: newId,
      x: (layout.length * 3) % 12,
      y: newY,
      w: 6,
      h: 5,
      minW: 3,
      minH: 3,
    };

    setCanvasItems([...canvasItems, newItem]);
    setLayout([...layout, newLayoutItem]);
  }

  // 👇 เมื่อ save config จาก modal
  function handleSaveTableConfig(config) {
    const tool = toolbox.find((t) => t.id === 'table');
    const newId = `table-${Date.now()}`;
    const newY = layout.length > 0 ? Math.max(...layout.map(l => l.y + l.h)) : 0;
    
    const newItem = {
      ...tool,
      uid: newId,
      label: config.title, // ใช้ชื่อที่ user ตั้ง
      config: config,      // 👈 เก็บ config
    };

    const newLayoutItem = {
      i: newId,
      x: (layout.length * 3) % 12,
      y: newY,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
    };

    setCanvasItems([...canvasItems, newItem]);
    setLayout([...layout, newLayoutItem]);
  }

  function handleRemoveItem(uid) {
    setCanvasItems(canvasItems.filter(item => item.uid !== uid));
    setLayout(layout.filter(item => item.i !== uid));
  }

  function onLayoutChange(newLayout) {
    setLayout(newLayout);
  }

  function handleSaveLayout() {
    if (!topicKey) {
      alert('ไม่พบ Topic Key');
      return;
    }
    
    saveLayout(topicKey, canvasItems, layout);
    setIsSaved(true);
    alert('✅ บันทึก Layout สำเร็จ!');
  }

  function handleBack() {
    if (!isSaved) {
      const confirm = window.confirm('คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกหรือไม่?');
      if (!confirm) return;
    }
    
    if (topicInfo) {
      navigate(`/department/${topicInfo.department.key}`);
    } else {
      navigate('/');
    }
  }

  function renderComponent(item) {
    switch (item.id) {
      case "map":
        return <PhayaoMap />;
      case "chart":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-inner">
            <div className="text-center">
              <div className="text-6xl mb-3 drop-shadow-lg">📊</div>
              <p className="text-xl font-bold text-green-800 drop-shadow-sm">กราฟสถิติ</p>
            </div>
          </div>
        );
      
      case "analytics":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow-inner">
            <div className="text-center">
              <div className="text-6xl mb-3 drop-shadow-lg">📈</div>
              <p className="text-xl font-bold text-orange-800 drop-shadow-sm">การวิเคราะห์</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  }

  return (
    <>
      <div className="min-h-screen w-full relative overflow-hidden pt-28 pb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        
        <div className="relative z-10 h-[calc(100vh-120px)] px-6 flex flex-col">
          
          {/* Top Toolbar */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl mb-4">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-4">
                <button onClick={handleBack} className="text-white/80 hover:text-white transition-all hover:scale-110" title="กลับ">
                  <ArrowLeft size={24} />
                </button>
                
                <div>
                  <h1 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                    <span>📊</span>
                    <span>Management Dashboard</span>
                  </h1>
                  {topicInfo && (
                    <p className="text-white/60 text-sm mt-1">
                      {topicInfo.department.title} › {topicInfo.topic.title}
                    </p>
                  )}
                </div>
                
                <div className="text-white/60 text-sm ml-4">
                  {canvasItems.length} component{canvasItems.length !== 1 ? 's' : ''}
                  {!isSaved && <span className="text-yellow-300 ml-2">● ยังไม่ได้บันทึก</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {toolbox.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAddToCanvas(t.id)}
                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 font-semibold shadow-lg bg-gradient-to-r ${t.color} text-white hover:scale-105 hover:shadow-xl active:scale-95`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-sm">{t.label}</span>
                    <span className="text-lg">+</span>
                  </button>
                ))}
                
                <button
                  onClick={handleSaveLayout}
                  disabled={isSaved}
                  className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg transition-all ${
                    isSaved 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  <Save size={18} />
                  <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึก Layout'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div 
              className="w-full h-full p-6 overflow-auto relative"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition: '-1px -1px'
              }}
            >
              {canvasItems.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-9xl mb-8 drop-shadow-2xl animate-pulse">✨</div>
                    <p className="text-white text-3xl font-bold drop-shadow-md mb-4">
                      พร้อมสร้างแดชบอร์ดของคุณ
                    </p>
                    <p className="text-white/70 text-xl mb-8">
                      เลือก Component จากด้านบนเพื่อเริ่มต้น
                    </p>
                    
                    <div className="flex justify-center gap-6 mt-12">
                      {toolbox.map((t, index) => (
                        <div 
                          key={t.id} 
                          className="text-5xl opacity-30 animate-bounce" 
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {t.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <GridLayout
                  className="layout"
                  layout={layout}
                  cols={12}
                  rowHeight={50}
                  onLayoutChange={onLayoutChange}
                  isDraggable={true}
                  isResizable={true}
                  draggableHandle=".drag-handle"
                  compactType="vertical"
                  preventCollision={false}
                  margin={[16, 16]}
                >
                  {canvasItems.map((item) => (
                    <div
                      key={item.uid}
                      className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-white/50 hover:border-white/80 transition-all hover:shadow-3xl"
                    >
                      <div className="drag-handle bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3 flex items-center justify-between cursor-move hover:from-teal-600 hover:to-emerald-600 transition-all">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-white font-semibold">{item.label}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.uid);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="text-white hover:text-red-200 transition-colors p-1.5 hover:bg-white/20 rounded-lg z-50 cursor-pointer"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="h-[calc(100%-52px)] overflow-auto">
                        {renderComponent(item)}
                      </div>
                    </div>
                  ))}
                </GridLayout>
              )}
            </div>
          </div>

        </div>

        <style jsx>{`
          .react-grid-item {
            transition: all 200ms ease;
            transition-property: left, top, width, height;
          }
          
          .react-grid-item.react-grid-placeholder {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 1rem;
            border: 3px dashed rgba(255, 255, 255, 0.4);
            transition-duration: 100ms;
            z-index: 2;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
          }
          
          .react-grid-item > .react-resizable-handle::after {
            content: "";
            position: absolute;
            right: 4px;
            bottom: 4px;
            width: 10px;
            height: 10px;
            border-right: 3px solid rgba(20, 184, 166, 0.8);
            border-bottom: 3px solid rgba(20, 184, 166, 0.8);
            border-radius: 0 0 4px 0;
          }
          
          .react-grid-item.react-dragging {
            z-index: 100;
            opacity: 0.9;
          }
        `}</style>
      </div>

      {/* 👇 Config Modal */}
      <ConfigTableModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleSaveTableConfig}
      />
    </>
  );
}
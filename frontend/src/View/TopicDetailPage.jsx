// TopicDetailPage.jsx - Updated to show saved layout
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Edit } from "lucide-react";
import useDepartmentStore from '../Store/useDepartmentStore';
import useLayoutStore from '../Store/useLayoutStore';
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import PhayaoMap from '../components/Map';
import DataTable from '../components/Table';

const GridLayout = WidthProvider(RGL);

export default function TopicDetailPage() {
  const { departmentKey, topicKey } = useParams();
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const getLayout = useLayoutStore((state) => state.getLayout);
  const [isVisible, setIsVisible] = useState(false);
  
  // หาแผนกและหัวข้อ
  const department = departments.find(dept => dept.key === departmentKey);
  const topic = department?.topic?.find(t => t.key === topicKey);
  
  // โหลด saved layout
  const savedLayout = getLayout(topicKey);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => navigate(`/department/${departmentKey}`), 300);
  };

  const handleHome = () => {
    setIsVisible(false);
    setTimeout(() => navigate('/'), 300);
  };

  const handleEdit = () => {
    navigate(`/management/${topicKey}`);
  };

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
      case "table":
        return <DataTable />;
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

  if (!department || !topic) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="text-white text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูลหัวข้อ</h2>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate(`/department/${departmentKey}`)}
              className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl text-white hover:bg-white/30 transition"
            >
              กลับแผนก
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl text-white hover:bg-white/30 transition"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float-reverse" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-8 py-20 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
      }`}>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-all hover:gap-3 group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">กลับแผนก</span>
            </button>
            
            <span className="text-white/40">|</span>
            
            <button
              onClick={handleHome}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-all"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">หน้าหลัก</span>
            </button>
          </div>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <Edit size={18} />
            <span>แก้ไข Layout</span>
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>{department.title}</span>
            <span>/</span>
            <span className="text-white font-medium">{topic.title}</span>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">{topic.title}</h1>
          <p className="text-white/70">{department.title}</p>
        </div>

        {/* Layout Display Area */}
        {savedLayout && savedLayout.items.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 min-h-[600px]">
            <div
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition: '-1px -1px'
              }}
            >
              <GridLayout
                className="layout"
                layout={savedLayout.gridLayout}
                cols={12}
                rowHeight={50}
                isDraggable={false}
                isResizable={false}
                compactType="vertical"
                margin={[16, 16]}
              >
                {savedLayout.items.map((item) => (
                  <div
                    key={item.uid}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-white/30"
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3 flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-white font-semibold">{item.label}</span>
                    </div>
                    <div className="h-[calc(100%-52px)] overflow-auto">
                      {renderComponent(item)}
                    </div>
                  </div>
                ))}
              </GridLayout>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-white/20 text-center">
            <div className="text-8xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-white mb-4">ยังไม่มี Layout</h3>
            <p className="text-white/70 mb-8">
              คุณยังไม่ได้สร้าง Layout สำหรับหัวข้อนี้
            </p>
            <button
              onClick={handleEdit}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl shadow-lg transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <Edit size={20} />
              <span>สร้าง Layout</span>
            </button>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
        .react-grid-item {
          transition: none;
        }
      `}</style>
    </div>
  );
}
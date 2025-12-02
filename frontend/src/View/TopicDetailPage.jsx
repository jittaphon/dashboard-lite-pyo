// TopicDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import useDepartmentStore from '../Store/useDepartmentStore';
import Map from '../components/Map';
export default function TopicDetailPage() {
  const { departmentKey, topicKey } = useParams();
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const [isVisible, setIsVisible] = useState(false);
  
  // หาแผนกและหัวข้อที่ตรงกัน
  const department = departments.find(dept => dept.key === departmentKey);
  const topic = department?.topic?.find(t => t.key === topicKey);

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

  // ถ้าไม่พบข้อมูล
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
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-400/5 rounded-full blur-2xl animate-pulse-slow" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-8 py-20 transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-12'
      }`}>
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Breadcrumb Path */}
        <div className={`mb-6 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '100ms' }}>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>{department.title}</span>
            <span>/</span>
            <span className="text-white font-medium">{topic.title}</span>
          </div>
        </div>

        {/* Topic Header Card */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative mb-8 transition-all duration-700 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '200ms' }}>
          
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative">
            
           <div style={{ height: "500px", width: "100%" }}>
  <Map />
</div>


           
          </div>
        </div>

      
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
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
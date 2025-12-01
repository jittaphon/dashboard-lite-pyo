import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDepartmentStore from '../Store/useDepartmentStore';

export default function CircularNavigation() {
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);

  const [selectedDept, setSelectedDept] = useState(null);
  const [hoveredDept, setHoveredDept] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const containerRef = useRef(null);
  const autoRotateRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setIsAnimating(false), 500);
  }, []);

  // Auto Rotation Effect
  useEffect(() => {
    if (isAutoRotating && !isDragging) {
      autoRotateRef.current = setInterval(() => {
        setRotation(prev => (prev + 0.2) % 360);
      }, 30);
    } else {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    }
    
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isAutoRotating, isDragging]);

  const handleDepartmentClick = (dept) => {
    if (isDragging) return;
    setSelectedDept(dept.id);
    setTimeout(() => {
      navigate(`/department/${dept.key}`);
      setSelectedDept(null);
    }, 300);
  };

  const getAngle = (e) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX || e.touches?.[0]?.clientX;
    const mouseY = e.clientY || e.touches?.[0]?.clientY;
    return Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
  };

  const handleMouseDown = (e) => {
    setIsAutoRotating(false);
    setIsDragging(true);
    setStartAngle(getAngle(e) - rotation);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentAngle = getAngle(e);
    setRotation(currentAngle - startAngle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // หมุนอัตโนมัติต่อหลังจากปล่อยเมาส์ 2 วินาที
    setTimeout(() => setIsAutoRotating(true), 2000);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, startAngle]);

  const getCircularPosition = (index, total) => {
    const radius = 260;
    const angle = (index * 360 / total) - 90 + rotation;
    const radian = (angle * Math.PI) / 180;
    
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian),
      angle: angle + 90
    };
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-400/5 rounded-full blur-2xl animate-pulse-slow" />
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-screen flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        
        {/* Text ซ้าย - Enhanced Animation */}
        <div className={`absolute left-12 top-1/2 -translate-y-1/2 max-w-md transition-all duration-1000 ${
          isAnimating ? 'opacity-0 -translate-x-20' : 'opacity-100 translate-x-0'
        }`}>
          <div className="text-white/90 space-y-4">
            <div className="overflow-hidden">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white/60 bg-clip-text text-transparent animate-gradient-x">
               ผลการขับเคลื่อนแผนยุทธศาสตร์สาธารณสุขจังหวัดพะเยา
              </h1>
            </div>
            <p className="text-2xl text-white/70 font-light animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              เลือกประเด็นที่ต้องการ
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-transparent rounded-full animate-expand" style={{ animationDelay: '400ms' }} />
            <p className="text-white/50 text-sm leading-relaxed animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              ลากเพื่อหมุนวงกลม<br />
              คลิกเพื่อเข้าสู่แผนกบริการ
            </p>
            
            {/* Decorative Elements */}
            <div className="flex gap-2 mt-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          </div>
        </div>

        {/* Text ขวา - Enhanced Animation */}
        <div className={`absolute right-12 top-1/2 -translate-y-1/2 max-w-md text-right transition-all duration-1000 ${
          isAnimating ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'
        }`}>
          <div className="text-white/90 space-y-4">
            <div className="overflow-hidden">
              <h2 className="text-5xl font-bold bg-gradient-to-l from-white via-teal-100 to-white/60 bg-clip-text text-transparent animate-gradient-x">
                Health<br />Services
              </h2>
            </div>
            <div className="h-1 w-24 bg-gradient-to-l from-teal-400 to-transparent rounded-full ml-auto animate-expand" style={{ animationDelay: '400ms' }} />
            <p className="text-white/50 text-sm leading-relaxed animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              Interactive Department<br />
              Navigation System
            </p>
            
            {/* Stats Display */}
            <div className="mt-6 space-y-2 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <div className="flex items-center justify-end gap-3">
                <span className="text-white/40 text-xs">Total Departments</span>
                <span className="text-2xl font-bold text-white">{departments.length}</span>
              </div>
              <div className="h-px bg-gradient-to-l from-white/20 to-transparent" />
            </div>
          </div>
        </div>
        
        {/* Center Circle - Enhanced */}
        <div className={`absolute z-20 transition-all duration-1000 ${isAnimating ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
          <div className="w-36 h-36 bg-white/20 backdrop-blur-2xl rounded-full border-4 border-white/30 shadow-2xl flex flex-col items-center justify-center relative group hover:scale-105 transition-transform">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
            
            {/* Rotating Border */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-padding animate-spin-slow opacity-50" style={{ padding: '2px' }} />
            
            <h2 className="text-white font-bold text-xl drop-shadow-lg relative z-10">แผนกบริการ</h2>
            <p className="text-white/70 text-sm mt-1 relative z-10">เลือกแผนก</p>
            
            {/* Pulse Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl group-hover:blur-2xl transition-all" />
          </div>
        </div>

        {/* Decorative Circles - Enhanced */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[520px] h-[520px] border border-white/10 rounded-full animate-spin-slow" />
          <div className="absolute w-[560px] h-[560px] border border-white/5 rounded-full animate-pulse-slow" />
          <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-reverse" />
          
          {/* Particle Dots */}
          <div className="absolute w-2 h-2 bg-emerald-400 rounded-full top-1/4 left-1/2 animate-float-particle" />
          <div className="absolute w-2 h-2 bg-teal-400 rounded-full bottom-1/4 right-1/3 animate-float-particle" style={{ animationDelay: '1s' }} />
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/3 right-1/4 animate-float-particle" style={{ animationDelay: '2s' }} />
        </div>

        {/* Circular Navigation Items */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          {departments.map((dept, index) => {
            const pos = getCircularPosition(index, departments.length);
            const isHovered = hoveredDept === dept.id;
            const isSelected = selectedDept === dept.id;
            const delay = index * 100;
            
            return (
              <div
                key={dept.id}
                onClick={() => handleDepartmentClick(dept)}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
                className="absolute cursor-pointer group pointer-events-auto"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  transition: isDragging ? 'none' : `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${isAnimating ? delay + 'ms' : '0ms'}`,
                  opacity: isAnimating ? 0 : 1
                }}
              >
                {/* Department Card */}
                <div className={`relative transition-all duration-300 ${isSelected ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
                  <div className={`w-28 h-28 bg-white/10 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 shadow-xl flex flex-col items-center justify-center
                    ${isHovered ? 'bg-white/25 border-white/50 scale-110 shadow-2xl shadow-white/20' : 'border-white/20'}`}>
                    
                    {/* Number Badge */}
                    <div className={`absolute -top-2.5 -right-2.5 w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300
                      ${isHovered ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-white/70 scale-110' : 'bg-gradient-to-br from-blue-400 to-blue-600 border-white/50'}`}>
                      <span className="text-white font-bold text-sm">{dept.id}</span>
                    </div>

                    {/* Content */}
                    <div className="text-center px-2">
                      <h3 className="text-white font-bold text-sm mb-1 drop-shadow-md leading-tight">
                        {dept.title}
                      </h3>
                      <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                        {dept.key.split('_')[0]}
                      </p>
                    </div>

                    {/* Hover Indicator */}
                    <div className={`absolute -bottom-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  {isHovered && (
                    <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rotation Hint - Enhanced */}
        {!isDragging && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm flex items-center gap-2 animate-bounce-subtle">
            <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">
              {isAutoRotating ? 'หมุนอัตโนมัติ - ลากเพื่อควบคุม' : 'ลากเพื่อหมุน'}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
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
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes expand {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 6rem;
            opacity: 1;
          }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -5px); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(10px, -15px); opacity: 0.8; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 40s linear infinite;
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
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-expand {
          animation: expand 0.8s ease-out forwards;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-float-particle {
          animation: float-particle 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
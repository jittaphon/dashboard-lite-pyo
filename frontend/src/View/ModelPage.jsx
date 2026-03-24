import React from "react";

export default function ModelPage() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-teal-900 to-slate-950 flex items-center justify-center">
      
      {/* 1. Dynamic Background (เพิ่มมิติความลึก) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>

      {/* 2. Main Presentation Card */}
      <div
        className="
          relative z-10
          w-[80vw] max-w-[1000px]
          transition-all duration-1000
        "
      >
        {/* แสง Glow ใต้ภาพ */}
        <div className="absolute -inset-6 bg-emerald-500/15 rounded-[40px] blur-3xl animate-pulse" />

        {/* Frame กระจกหุ้มรูปภาพ */}
        <div className="
          relative 
          bg-white/5 backdrop-blur-xl 
          border border-white/10 
          p-2 rounded-[32px] 
          shadow-[0_30px_100px_rgba(0,0,0,0.5)]
          overflow-hidden
          animate-float
        ">
          
          {/* Auto Shine Effect - แสงวิ่งผ่านรูปอัตโนมัติ */}
          <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
             <div className="w-[20%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-auto-shine" />
          </div>

          {/* รูปภาพหลัก (เอา Hover Scale ออกเพื่อให้ดูมั่นคง) */}
          <div className="relative rounded-[24px] overflow-hidden">
            <img
              src={`${import.meta.env.VITE_API_DOMAIN}/kpi-pyo-hub/public/images/planner.jpg`}
              alt="Strategic Plan"
              className="
                w-full h-full
                object-contain
                select-none
              "
            />
          </div>
        </div>

        {/* ตกแต่งฐาน (เพิ่มความหรู) */}
        <div className="mt-8 flex flex-col items-center gap-2 opacity-60">
           <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
           <span className="text-emerald-300/50 text-[10px] tracking-[0.3em] uppercase">MOPH Strategy 2026</span>
        </div>
      </div>

      {/* CSS สำหรับ Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
        }
        @keyframes auto-shine {
          0% { transform: translateX(-200%) skewX(-12deg); }
          30% { transform: translateX(500%) skewX(-12deg); }
          100% { transform: translateX(500%) skewX(-12deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-auto-shine {
          animation: auto-shine 10s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function IntroSplash() {
  return (
    <motion.div
      exit={{ 
        opacity: 0, 
        scale: 1.1,
        filter: "blur(40px)" 
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.76, 0, 0.24, 1] 
      }}
      // เปลี่ยนจากขาวเป็นเขียวเข้มจัด (Deep Forest Emerald)
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#011a14] overflow-hidden"
    >
      {/* Layer 1: Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }} />

      {/* Layer 2: Organic Light Flows (แสงฟุ้งๆ ที่ขยับเหมือนกลุ่มควัน) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [-50, 50, -50],
            y: [-20, 40, -20],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            x: [50, -50, 50],
            y: [40, -20, 40],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[700px] h-[700px] bg-teal-800/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Layer 3: Abstract Floating Lines (เส้นคลื่นจางๆ แบบเซน) */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d="M0,50 Q25,45 50,50 T100,50"
          fill="none"
          stroke="white"
          strokeWidth="0.1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
        />
      </svg>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Glow ด้านหลังตัวอักษร */}
        <div className="absolute inset-0 bg-emerald-400/5 blur-[60px] rounded-full" />

        <div className="overflow-hidden mb-2">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.4 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[10px] md:text-xs font-mono tracking-[0.8em] text-emerald-400 uppercase"
          >
            Strategic Node
          </motion.p>
        </div>

        <motion.h1 
          initial={{ opacity: 0, letterSpacing: "0.2em", filter: "blur(10px)" }}
          animate={{ opacity: 1, letterSpacing: "-0.02em", filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-black text-white font-kanit italic tracking-tighter leading-none"
        >
          PHAYAO<br/>
          <span className="text-emerald-500">STRATEGIC</span>
        </motion.h1>

        <div className="flex justify-center items-center gap-6 mt-12">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ delay: 1, duration: 1 }}
            className="h-[1px] bg-white/20"
          />
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.5 }}
            className="text-[9px] font-light text-white tracking-[0.4em] uppercase"
          >
            データハブ 2026
          </motion.span>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ delay: 1, duration: 1 }}
            className="h-[1px] bg-white/20"
          />
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-12 left-12 w-4 h-4 border-t border-l border-white/20" />
      <div className="absolute bottom-12 right-12 w-4 h-4 border-b border-r border-white/20" />
    </motion.div>
  );
}
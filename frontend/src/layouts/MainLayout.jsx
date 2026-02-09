import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import IntroSplash from "../components/IntroSplash";

export default function MainLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#022c22]">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <IntroSplash key="splash" />
        ) : (
          <motion.div key="content" className="relative min-h-screen">
            
            {/* --- Bubble Layer: วิ่งรอบเดียวแล้วค้างเป็นพื้นหลังไปเลยเพื่อความลื่น --- */}
            <motion.div 
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(150% at 50% 50%)' }}
              transition={{ 
                duration: 1.8, // เพิ่มเวลาให้ยาวขึ้นหน่อยเพื่อให้ดูละมุน
                ease: [0.76, 0, 0.24, 1], // จังหวะ Smooth แบบ Exponential
              }}
              className="fixed inset-0 bg-gradient-to-br from-emerald-600/95 to-teal-600/95 z-[50]"
            />

            {/* --- Content: ค่อยๆ Fade In ขึ้นมาซ้อนบนวงกลมที่กำลังขยาย --- */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.8, // ให้เริ่ม Fade ตอนวงกลมขยายไปได้ครึ่งทางแล้ว
                duration: 1.2,
                ease: "easeOut"
              }}
              className="relative z-[100] min-h-screen"
            >
              <main>
                <Outlet />
              </main>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
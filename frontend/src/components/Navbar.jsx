import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, User } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const activeTab = location.pathname === "/management" ? "management" : "view";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { name: "View", path: "/", key: "view" },
    { name: "Management", path: "/management", key: "management" },
  ];

  const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
  
  // Custom Styles
  const pillColor = '#FFFFFF'; 

  // CSS สำหรับ Active Pill (ตัวเลื่อนสีขาว) - เน้น Specular Highlight
  const pillShadowStyle = {
    // 1. เงาลึกสีเข้ม (Drop Shadow) - ทำให้ Pill ลอย
    boxShadow: `
      0 10px 30px rgba(0, 0, 0, 0.4), 
      /* 2. เงาสะท้อน/Highlight ด้านใน (Specular Highlight) - ทำให้ดูมันวาว */
      inset 0 0 0 1.5px rgba(255, 255, 255, 0.7), 
      inset 0 0 10px rgba(0, 0, 0, 0.05) /* Optional faint inner dark shadow */
    `,
    backgroundColor: pillColor,
  };

  // CSS สำหรับ Switch Background (กรอบด้านนอก) - เน้น Glass Effect และ Glow
  const switchBgStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    boxShadow: `
      inset 0 1px 2px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(16, 185, 129, 0.5)
    `,
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 px-8 transition-all duration-300 ${
        scrolled 
          ? "py-3 bg-gradient-to-r from-emerald-600/95 to-teal-600/95 backdrop-blur-md shadow-lg" 
          : "py-4 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">HealthDash</span>
        </div>

        {/* 🌟 Liquid Switch - Final Enhanced Version 🌟 */}
        <div 
          className="relative w-[300px] h-14 rounded-full p-1 transition-all duration-300" 
          style={switchBgStyle}
        >
          
          {/* 1. ตัว Indicator/Pill (Active State) */}
          <div 
            className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-in-out"
            style={{
              left: activeIndex === 0 ? '4px' : 'calc(50% + 4px)',
              right: activeIndex === 0 ? 'calc(50% + 4px)' : '4px',
              ...pillShadowStyle,
            }}
          />

          {/* 2. เนื้อหา Tabs (Text Links) */}
          <div className="flex w-full h-full relative z-10">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                className={`w-1/2 flex items-center justify-center text-base transition-all duration-300 ${
                  activeTab === tab.key 
                    ? "font-extrabold text-emerald-700"
                    : "font-medium text-white/70 hover:text-white"
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
        {/* 🌟 END: Liquid Switch Final 🌟 */}

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button className="bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all">
            <User className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </nav>
  );
}
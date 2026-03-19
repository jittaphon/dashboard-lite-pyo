import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ label, value, unit, color = "#10b981", icon: Icon, description }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col justify-between p-6 cursor-default"
    >
      {/* 🌟 Soft Glow Background Effect */}
      <div 
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-[35px] pointer-events-none transition-all duration-500"
        style={{ backgroundColor: color }}
      />

      {/* 📊 Header Section: Label & Icon */}
      <div className="relative z-10 flex items-start justify-between gap-4 w-full">
        <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mt-1">
          {label}
        </span>
        
        <div
          className="flex items-center justify-center rounded-2xl shrink-0 shadow-sm"
          style={{
            width: 46,
            height: 46,
            background: `linear-gradient(135deg, white, ${color}10)`,
            border: `1px solid ${color}20`,
            color: color,
          }}
        >
          {Icon && <Icon size={22} strokeWidth={2.5} />}
        </div>
      </div>

      {/* 🔢 Main Value Section */}
      <div className="relative z-10 flex items-baseline gap-2 mt-2">
        <h3 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
        {unit && (
          <span className="text-sm font-bold text-slate-400 mb-1 italic">
            {unit}
          </span>
        )}
      </div>

      {/* 🏷️ Footer Section: Description Badge */}
      <div className="relative z-10 mt-4 flex items-center h-6">
        {description && (
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wide shadow-sm"
            style={{
              background: `${color}10`,
              color: color,
              border: `1px solid ${color}20`
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* ➖ Accent Line */}
      <div
        className="absolute bottom-0 left-0 h-[3px] w-full opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        }}
      />
    </motion.div>
  );
};

export default StatCard;
import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ label, value, unit, color, icon: Icon, description }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="h-full w-full rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
    >
      <div className="flex items-center w-full px-5 py-5 gap-4">
        
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{
            width: 44,
            height: 44,
            background: `${color}15`,
          }}
        >
          {Icon && <Icon size={20} style={{ color }} strokeWidth={2.2} />}
        </div>

        {/* Text */}
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </span>

          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-slate-800 leading-none">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            <span className="text-[11px] text-slate-400 mb-[2px]">
              {unit}
            </span>
          </div>
        </div>

        {/* Badge */}
        {description && (
          <div className="ml-auto">
            <div
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
              style={{
                background: `${color}15`,
                color,
              }}
            >
              {description}
            </div>
          </div>
        )}
      </div>

      {/* accent line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-full"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
      />
    </motion.div>
  );
};

export default StatCard;
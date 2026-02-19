import React from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Target, BarChart3, Activity, TrendingUp, Users, Eye, ShieldCheck, MapPin } from "lucide-react";
import { getKpiType } from '../utils/Utils';

const ICONS = [Target, BarChart3, Activity, TrendingUp, Users, Eye, ShieldCheck, MapPin];

export default function DeptCard({ dept, index }) {
  const navigate = useNavigate();
  const kpis = dept.topic || [];
  const targets = kpis.filter(k => getKpiType(k) === "target");
  const hasData = kpis.length > 0;
  const Icon = ICONS[index % ICONS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hasData ? { y: -4, scale: 1.01 } : {}}
      onClick={() => hasData && navigate(`/department/${dept.key}`)}
      className={`relative border bg-white flex flex-col rounded-2xl overflow-hidden ${
        hasData 
          ? "border-slate-300 hover:border-[#0d3b2e] hover:shadow-xl transition-all cursor-pointer" 
          : "border-slate-200 bg-slate-100 opacity-60"
      }`}
    >
      <div className="px-6 py-5 border-b border-slate-200 bg-[#0d3b2e] text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white/10 border border-white/20 rounded-xl mt-1">
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">กลุ่มงาน</p>
              <h3 className="text-base font-bold leading-snug break-words">
                {dept.title.replace("กลุ่มงาน", "").trim()}
              </h3>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-widest">KPIs</p>
              <p className="text-2xl font-bold leading-none">{kpis.length}</p>
            </div>
          </div>
        </div>
      </div>

      {hasData && (
        <div className="grid grid-cols-3 text-center divide-x divide-slate-200">
          <StatBox 
            count={targets.filter(k => k.status === "ผ่าน").length} 
            label="ผ่าน" 
            color="emerald" 
            dot="bg-emerald-500" 
          />
          <StatBox 
            count={targets.filter(k => k.status === "ไม่ผ่าน").length} 
            label="รอดำเนินการ" 
            color="amber" 
            dot="bg-orange-400" 
          />
          <StatBox 
            count={kpis.filter(k => getKpiType(k) === "monitoring").length} 
            label="ติดตาม" 
            color="sky" 
            dot="bg-sky-400" 
          />
        </div>
      )}

      <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Open Matrix</span>
        <ChevronRight size={16} className="text-slate-400" />
      </div>
    </motion.div>
  );
}

function StatBox({ count, label, color, dot }) {
  // 🟢 แก้ไขตรงนี้: สร้าง Map ของสี เพื่อให้ Tailwind รู้จัก Class ล่วงหน้า
  const textColorMap = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    sky: "text-sky-700"
  };

  return (
    <div className="py-5 flex flex-col items-center gap-1">
      <p className={`text-lg font-bold ${textColorMap[color] || "text-slate-700"}`}>
        {count}
      </p>
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  );
}
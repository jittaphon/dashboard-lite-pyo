import React from 'react';
import { BarChart3, ShieldCheck, Clock, Eye, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { getKpiType } from '../utils/Utils';

export default function SummaryBar({ departments }) {
  const all = departments.flatMap(d => d.topic || []);
  const targets = all.filter(k => getKpiType(k) === "target");
  
  const stats = [
    { 
      label: "ตัวชี้วัดทั้งหมด", 
      value: all.length, 
      sub: "KPIs In System",
      Icon: BarChart3, 
      color: "from-slate-400 to-slate-600", 
      bg: "bg-white/10", 
      glow: "group-hover:shadow-slate-500/20"
    },
    { 
      label: "ผ่านเกณฑ์", 
      value: targets.filter(k => k.status === "ผ่าน").length, 
      sub: "Achieved Goals",
      Icon: ShieldCheck, 
      color: "from-emerald-400 to-teal-500", 
      bg: "bg-emerald-500/10",
      glow: "group-hover:shadow-emerald-500/40"
    },
    { 
      label: "ดำเนินการอยู่", 
      value: targets.filter(k => k.status === "ไม่ผ่าน").length, 
      sub: "In Progress",
      Icon: Clock, 
      color: "from-orange-400 to-rose-500", 
      bg: "bg-orange-500/10",
      glow: "group-hover:shadow-orange-500/40"
    },
    { 
      label: "ติดตาม", 
      value: all.filter(k => getKpiType(k) === "monitoring").length, 
      sub: "Monitoring Only",
      Icon: Eye, 
      color: "from-sky-400 to-indigo-500", 
      bg: "bg-sky-500/10",
      glow: "group-hover:shadow-sky-500/40"
    },
    { 
      label: "รอผล", 
      value: targets.filter(k => k.status === "รอผล").length, 
      sub: "Pending Data",
      Icon: Target, 
      color: "from-amber-300 to-yellow-500", 
      bg: "bg-amber-500/10",
      glow: "group-hover:shadow-amber-500/40"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((s, idx) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`group relative overflow-hidden rounded-[2rem] p-[1px] transition-all duration-500 hover:-translate-y-1`}
        >
          {/* 🟢 Gradient Border Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
          
          {/* 🟢 Inner Content Card */}
          <div className={`relative h-full ${s.bg} backdrop-blur-md rounded-[calc(2rem-1px)] p-5 flex flex-col justify-between shadow-2xl ${s.glow}`}>
            
            {/* Header: Icon & Sparkline Decor */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${s.color} shadow-lg shadow-inner`}>
                <s.Icon size={22} className="text-white" />
              </div>
              <div className="opacity-20 group-hover:opacity-50 transition-opacity">
                <TrendingUp size={16} className="text-white" />
              </div>
            </div>

            {/* Data: Value & Label */}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white tracking-tight leading-none">
                  {s.value}
                </span>
                <span className="text-[10px] font-bold text-white/40 uppercase">หน่วย</span>
              </div>
              
              <div className="mt-2">
                <p className="text-xs font-bold text-white leading-tight">
                  {s.label}
                </p>
                <p className="text-[9px] font-medium text-white/40 uppercase tracking-wider mt-0.5">
                  {s.sub}
                </p>
              </div>
            </div>

            {/* Background Glow Decor */}
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 bg-gradient-to-br ${s.color} blur-2xl opacity-10 group-hover:opacity-30 transition-opacity`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
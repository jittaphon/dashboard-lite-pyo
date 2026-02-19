// เพิ่มคำว่า export หน้าฟังก์ชันทุกตัว
export const getKpiType = (kpi) => {
  if (!kpi.threshold || kpi.threshold === 0) return "monitoring";
  return "target";
};

export const getStatusStyle = (status, type) => {
  if (type === "monitoring") return { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-400", border: "border-sky-200" };
  if (status === "ผ่าน") return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" };
  if (status === "ไม่ผ่าน") return { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", border: "border-orange-200" };
  return { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300", border: "border-slate-200" };
};

export const ICONS_LIST = ["Target", "BarChart3", "Activity", "TrendingUp", "Users", "Eye", "ShieldCheck", "MapPin"];
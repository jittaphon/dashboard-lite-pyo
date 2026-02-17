import { create } from 'zustand';

// ============================================================
// CONSTANTS
// ============================================================
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NCD_CODE_MAP = {
  "1_ht_screening" : "HT_SCREEN",
  "2_ht_followup"  : "HT_REPLEATE",
  "3_ht_control"   : "HT_CONTROL",
  "4_dm_control"   : "DM_CONTROL",
  "5_dm_screen"    : "DM_SCREEN",
  "6_dm_followup"  : "DM_REPLEATE"
};

// ============================================================
// HELPER: คำนวณสถานะ KPI
// ============================================================
function calcStatus(percent, threshold) {
  if (percent === null || threshold === null) return "รอผล";
  return percent >= threshold ? "ผ่าน" : "ไม่ผ่าน";
}

// ============================================================
// HELPER: build Performance Map แต่ละกลุ่ม
// ============================================================

function buildNCDMap(ncdList) {
  const map = {};
  ncdList.forEach(({ indicator_group, total_percent, total_target, total_result }) => {
    const code = NCD_CODE_MAP[indicator_group];
    if (code) {
      map[code] = {
        percent : parseFloat(total_percent),
        target  : total_target,
        result  : total_result
      };
    }
  });
  return map;
}

// ➕ [เพิ่ม STEP 1] เพิ่ม build function ของกลุ่มใหม่ตรงนี้
// ตัวอย่าง:
// function buildDSPMMap(dspmList) {
//   const map = {};
//   dspmList.forEach(({ indicator_group, total_percent, total_target, total_result }) => {
//     map[indicator_group] = {
//       percent : parseFloat(total_percent),
//       target  : total_target,
//       result  : total_result
//     };
//   });
//   return map;
// }

// ============================================================
// HELPER: จัดกลุ่ม rows → array of department
// (ไม่ต้องแก้ไฟล์นี้เมื่อเพิ่ม API ใหม่)
// ============================================================
function groupByDepartment(rows, performanceMap) {
  const grouped = {};

  rows.forEach((row) => {
    if (!grouped[row.group_id]) {
      grouped[row.group_id] = {
        id    : row.group_id,
        title : row.group_name || "",
        key   : String(row.group_id),
        topic : []
      };
    }

    if (!row.kpi_id) return;

    const perf      = performanceMap[row.kpi_code] ?? null;
    const percent   = perf ? perf.percent : null;
    const threshold = row.threshold ? parseFloat(row.threshold) : null;

    grouped[row.group_id].topic.push({
      id        : row.kpi_id,
      key       : row.kpi_code,
      title     : row.kpi_name,
      threshold,
      weight    : row.weight,
      url       : row.report_url,
      percent,
      target    : perf?.target ?? null,
      result    : perf?.result ?? null,
      status    : calcStatus(percent, threshold)
    });
  });

  return Object.values(grouped);
}

// ============================================================
// STORE
// ============================================================
const useDepartmentStore = create((set, get) => ({
  departments     : [],
  isLoading       : false,
  error           : null,
  lastFetchedYear : null,

  fetchDepartments: async (year) => {
    const { isLoading, lastFetchedYear } = get();
    if (isLoading || lastFetchedYear === year) return;

    set({ isLoading: true, error: null });

    try {

      // ➕ [เพิ่ม STEP 2] เพิ่ม fetch ใน Promise.all ตรงนี้
      const [masterRes, ncdRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/kpi/groups-kpi/${year}`),          // master - ห้ามลบ
        fetch(`${BASE_URL}/api/v1/kpi/ncd-kpi-department/${year}`),  // NCD
        // fetch(`${BASE_URL}/api/v1/kpi/dspm-department/${year}`),  // DSPM
        // fetch(`${BASE_URL}/api/v1/kpi/bcc-department/${year}`),   // BCC
        // fetch(`${BASE_URL}/api/v1/kpi/telemed-department/${year}`), // TELEMED
      ]);

      // ➕ [เพิ่ม STEP 3] เพิ่ม response ใน Promise.all ตรงนี้ให้ตรงกับ STEP 2
      const [rows, ncdList] = await Promise.all([
        masterRes.json(),  // master - ห้ามลบ
        ncdRes.json(),     // NCD
        // dspmRes.json(),  // DSPM
        // bccRes.json(),   // BCC
        // telemedRes.json(), // TELEMED
      ]);

      // check error
      if (!masterRes.ok || !ncdRes.ok) {
        throw new Error(`API Error: master=${masterRes.status}, ncd=${ncdRes.status}`);
        // ➕ [เพิ่ม STEP 3.5] เพิ่ม check error ของ API ใหม่ตรงนี้ด้วย
        // || !dspmRes.ok || !bccRes.ok
      }

      // ➕ [เพิ่ม STEP 4] เพิ่ม buildXxxMap และ spread ตรงนี้
      const performanceMap = {
        ...buildNCDMap(ncdList),      // NCD
        // ...buildDSPMMap(dspmList),  // DSPM
        // ...buildBCCMap(bccList),    // BCC
        // ...buildTelemedMap(telemedList), // TELEMED
      };

      // groupByDepartment ไม่ต้องแก้เลย ✅
      const departments = groupByDepartment(rows, performanceMap);

      set({ departments, isLoading: false, lastFetchedYear: year });

    } catch (error) {
      console.error("fetchDepartments:", error);
      set({ isLoading: false, error: error.message });
    }
  },

  resetCache: () => set({ lastFetchedYear: null })
}));

export default useDepartmentStore;
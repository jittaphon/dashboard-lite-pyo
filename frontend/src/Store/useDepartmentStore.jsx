import { create } from 'zustand';

// ============================================================
// CONSTANTS & CONFIG
// ============================================================
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// แผนผังการแปลง Code จาก DB NCD มาเป็น KPI_CODE ในระบบหลัก
const NCD_CODE_MAP = {
  "1_ht_screening": "HT_SCREEN",
  "2_ht_followup": "HT_REPLEATE",
  "3_ht_control": "HT_CONTROL",
  "4_dm_control": "DM_CONTROL",
  "5_dm_screen": "DM_SCREEN",
  "6_dm_followup": "DM_REPLEATE",
  "7_dm_remission": "DM_REMISSION",
};

// ============================================================
// HELPERS
// ============================================================

/**
 * คำนวณสถานะ ผ่าน/ไม่ผ่าน
 */
function calcStatus(percent, threshold) {
  if (percent === null || threshold === null || isNaN(percent)) return "รอผล";
  return percent >= threshold ? "ผ่าน" : "ไม่ผ่าน";
}

/**
 * แปลงข้อมูลจาก NCD API ให้เป็น Map ที่ค้นหาได้ด้วย kpi_code
 */
function buildNCDMap(ncdList) {
  const map = {};
  if (!Array.isArray(ncdList)) return map;

  ncdList.forEach(({ indicator_group, total_percent, total_target, total_result, last_processed_at }) => {
    const code = NCD_CODE_MAP[indicator_group];
    if (code) {
      map[code] = {
        percent: parseFloat(total_percent) || 0,
        target: total_target,
        result: total_result,
        last_processed_at: last_processed_at

      };
    }
    
  });
  return map;
}

/**
 * จัดกลุ่มข้อมูลดิบจาก MySQL (Flat rows) ให้เป็นโครงสร้าง Nested Object สำหรับ UI
 */
function groupByDepartment(rows, performanceMap) {
  const grouped = {};

  rows.forEach((row) => {
    // สร้างหัวข้อกลุ่มงานถ้ายังไม่มี
    if (!grouped[row.group_id]) {
      grouped[row.group_id] = {
        id: row.group_id,
        title: row.group_name || "ไม่ระบุกลุ่มงาน",
        key: String(row.group_id),
        topic: []
      };
    }

    // ถ้าแถวนี้ไม่มี KPI (Group เปล่า) ให้ข้ามไป
    if (!row.kpi_id) return;

    const perf = performanceMap[row.kpi_code] ?? null;
    const percent = perf ? perf.percent : null;
    const threshold = row.threshold !== null ? parseFloat(row.threshold) : null;
    

    grouped[row.group_id].topic.push({
      id: row.kpi_id,
      uuid: row.kpi_uuid, // <--- เพิ่มตรงนี้: รับรหัส UUID จาก Backend
      key: row.kpi_code,
      title: row.kpi_name,
      threshold,
      weight: row.weight,
      url: row.report_url,
      target_table: row.target_table,
      chart_type: row.chart_type,
      percent,
      target: perf?.target ?? null,
      result: perf?.result ?? null,
      status: calcStatus(percent, threshold),
      last_processed_at: perf?.last_processed_at ?? null
      
    });
  });



  return Object.values(grouped);
}

// ============================================================
// STORE (Zustand)
// ============================================================
const useDepartmentStore = create((set, get) => ({
  departments: [],
  isLoading: false,
  error: null,
  lastFetchedYear: null,

  /**
   * ดึงข้อมูลทั้งหมด (Master Data + Performance Data)
   */
  fetchDepartments: async (year) => {
    const { isLoading, lastFetchedYear } = get();
    // ป้องกันการ Fetch ซ้ำถ้ากำลังโหลดหรือโหลดปีเดิมไปแล้ว
    if (isLoading || lastFetchedYear === year) return;

    set({ isLoading: true, error: null });

    try {
      // ดึงข้อมูลพร้อมกันหลาย API
      const [masterRes, ncdRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/kpi/groups-kpi/${year}`),
        fetch(`${BASE_URL}/api/v1/kpi/ncd-kpi-department/${year}`)
      ]);

      // ตรวจสอบสถานะการตอบกลับ
      if (!masterRes.ok || !ncdRes.ok) {
        throw new Error(`โหลดข้อมูลไม่สำเร็จ (Master: ${masterRes.status}, NCD: ${ncdRes.status})`);
      }

      const rows = await masterRes.json();
      const ncdList = await ncdRes.json();


      // รวบรวม Performance Data จากแหล่งต่างๆ (ในอนาคตเพิ่มตรงนี้)
      const performanceMap = {
        ...buildNCDMap(ncdList),
        // ...buildDSPMMap(dspmList), // เพิ่มกลุ่มอื่นในอนาคต
      };

      // แปลงข้อมูลเป็น Format ที่หน้าจอต้องการ
      const departments = groupByDepartment(rows, performanceMap);

      set({ 
        departments, 
        isLoading: false, 
        lastFetchedYear: year 
      });

    } catch (error) {
      console.error("Fetch Error:", error);
      set({ 
        isLoading: false, 
        error: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" 
      });
    }
  },

  /**
   * บันทึกหรือแก้ไขข้อมูล KPI
   */
  saveKpiAction: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/kpi/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        // ดึงข้อความ error จาก Backend (ที่ส่งมาจาก Throwable $e)
        throw new Error(result.message || 'บันทึกข้อมูลไม่สำเร็จ');
      }
      
      // ล้าง Cache เพื่อให้ fetch ใหม่ในรอบหน้า
      set({ lastFetchedYear: null }); 
      return result;
    } catch (error) {
      console.error("Save Action Error:", error);
      throw error;
    }
  },

  /**
   * ลบ KPI
   */
  deleteKpiAction: async (kpiId) => {
    const res = await fetch(`${BASE_URL}/api/v1/kpi/${kpiId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Delete Failed');
    set({ lastFetchedYear: null }); // ล้าง cache
    return true;
  },

  /**
   * ล้างสถานะเพื่อบังคับโหลดใหม่
   */
  resetCache: () => set({ lastFetchedYear: null })
}));

export default useDepartmentStore;
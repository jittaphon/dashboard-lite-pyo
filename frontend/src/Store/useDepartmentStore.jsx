import { create } from 'zustand';

const useDepartmentStore = create((set) => ({
  departments: [],
  isLoading: false,

  fetchDepartments: async (year) => {
    set({ isLoading: true });

    try {
      const [masterRes, ncdRes] = await Promise.all([
        fetch(`http://203.157.189.9/datahub/kpi-pyo-hub/backend/public/index.php/api/v1/kpi/groups-kpi/${year}`),
        fetch(`http://203.157.189.9/datahub/kpi-pyo-hub/backend/public/index.php/api/v1/kpi/ncd-kpi-department/${year}`)
      ]);

      if (!masterRes.ok || !ncdRes.ok) {
        throw new Error("API error");
      }

      const rows = await masterRes.json();
      const ncd = await ncdRes.json();

      // แมพ indicator_group จาก API NCD ให้ตรงกับ kpi_code ใน Master
      const mapCode = {
        "1_ht_screening": "HT_SCREEN",
        "2_ht_followup": "HT_REPLEATE",
        "3_ht_control": "HT_CONTROL",
        "4_dm_control": "DM_CONTROL",
        "5_dm_screen": "DM_SCREEN",
        "6_dm_followup": "DM_REPLEATE"
      };

      // สร้าง Dictionary เพื่อดึงค่า total_percent มาใช้งานง่ายๆ
      const performanceMap = {};
      ncd.forEach(item => {
        const code = mapCode[item.indicator_group];
        if (code) {
          performanceMap[code] = {
            percent: parseFloat(item.total_percent),
            target: item.total_target,
            result: item.total_result
          };
        }
      });

      const grouped = Object.values(
        rows.reduce((acc, row) => {
          if (!acc[row.group_id]) {
            acc[row.group_id] = {
              id: row.group_id,
              title: row.group_name || "",
              key: String(row.group_id),
              topic: []
            };
          }

          if (row.kpi_id) {
            const perf = performanceMap[row.kpi_code];
            const percent = perf ? perf.percent : null;
            const threshold = row.threshold ? parseFloat(row.threshold) : null;

            acc[row.group_id].topic.push({
              id: row.kpi_id,
              key: row.kpi_code,
              title: row.kpi_name,
              threshold: threshold,
              weight: row.weight,
              url: row.report_url,
              percent: percent,
              target: perf?.target || null,
              result: perf?.result || null,
              // คำนวณสถานะ: ถ้ามี percent และ threshold ให้เทียบกัน
              status: (percent !== null && threshold !== null) 
                ? (percent >= threshold ? "ผ่าน" : "ไม่ผ่าน") 
                : "รอผล"
            });
          }
          return acc;
        }, {})
      );

      set({ departments: grouped, isLoading: false });
    } catch (error) {
      console.error("Fetch Error:", error);
      set({ isLoading: false });
    }
  }
}));

export default useDepartmentStore;
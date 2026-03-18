// utils/reportRegistry.js

// utils/reportRegistry.js

export const reportStrategies = {
    
  "TB_SCREENING_RESULTS": {
    layout: [
      { i: 'nhso-7-groups', x: 0, y: 0, w: 6, h: 7 },
      { i: 'local-context-groups', x: 6, y: 0, w: 6, h: 7 },
      { i: 'ampur-summary', x: 0, y: 5, w: 12, h: 7 },
      { i: 'main-table', x: 0, y: 10, w: 12, h: 20 }
    ],
    widgets: [
 {
  id: 'nhso-7-groups',
  type: 'bar',
  label: 'ร้อยละการคัดกรอง CXR 7 กลุ่ม สปสช. (ภาพรวมจังหวัด)',
  transform: (data) => {
    const targetType = "กลุ่มเสี่ยง 7 กลุ่มที่เบิกชดเชยได้จาก สปสช. (ประชาชนไทยทุกสิทธิ)";

    // 1. รวมข้อมูลดิบที่จำเป็นทั้งหมด
    const summedData = data
      .filter(item => item.risk_type === targetType)
      .reduce((acc, curr) => {
        const group = curr.risk_group || "ไม่ระบุ";
        if (!acc[group]) {
          acc[group] = { 
            totalTarget: 0, 
            totalCxr: 0, 
            totalAbnormal: 0,
            totalDiagnosis: 0 // เก็บผลรวมผู้ป่วยที่วินิจฉัยพบ
          };
        }
        
        acc[group].totalTarget += Number(curr.target) || 0;
        acc[group].totalCxr += Number(curr.cxr_total) || 0;
        acc[group].totalAbnormal += Number(curr.cxr_abnormal) || 0;
        
        // รวม ptb_plus + ptb_minus + ep_tb
        const diagnosisCount = (Number(curr.ptb_plus) || 0) + 
                               (Number(curr.ptb_minus) || 0) + 
                               (Number(curr.ep_tb) || 0);
        
        acc[group].totalDiagnosis += diagnosisCount;
        
        return acc;
      }, {});

    // 2. คำนวณร้อยละทั้ง 3 ตัวชี้วัด
    return Object.keys(summedData).map(groupName => {
      const { totalTarget, totalCxr, totalAbnormal, totalDiagnosis } = summedData[groupName];
      
      return {
        "กลุ่มเสี่ยง": groupName,
        "ร้อยละการคัดกรอง (CXR)": totalTarget > 0 
          ? Number(((totalCxr / totalTarget) * 100).toFixed(2)) 
          : 0,
        "ร้อยละ CXR ผิดปกติ": totalCxr > 0 
          ? Number(((totalAbnormal / totalCxr) * 100).toFixed(2)) 
          : 0,
        "ร้อยละการวินิจฉัย": totalCxr > 0 
          ? Number(((totalDiagnosis / totalCxr) * 100).toFixed(2)) 
          : 0
      };
    });
  } 
},
 {
  id: 'local-context-groups',
  type: 'bar',
  label: 'กลุ่มเสี่ยงตามบริบทพื้นที่ (ภาพรวมจังหวัด)',
  transform: (data) => {
    const targetType = "กลุ่มเสี่ยงวัณโรคเฝ้าระวังตามบริบทของพื้นที่";
    
    // 1. รวมข้อมูล Sum ของทุกพื้นที่แยกตามกลุ่มเสี่ยง
    const summedData = data
      .filter(item => item.risk_type === targetType)
      .reduce((acc, curr) => {
        const group = curr.risk_group || "ไม่ระบุ";
        if (!acc[group]) {
          acc[group] = { 
            totalTarget: 0, 
            totalCxr: 0, 
            totalAbnormal: 0,
            totalDiagnosis: 0 
          };
        }
        
        acc[group].totalTarget += Number(curr.target) || 0;
        acc[group].totalCxr += Number(curr.cxr_total) || 0;
        acc[group].totalAbnormal += Number(curr.cxr_abnormal) || 0;
        
        // รวมผู้ป่วย (ptb_plus + ptb_minus + ep_tb)
        const diagnosisCount = (Number(curr.ptb_plus) || 0) + 
                               (Number(curr.ptb_minus) || 0) + 
                               (Number(curr.ep_tb) || 0);
        acc[group].totalDiagnosis += diagnosisCount;
        
        return acc;
      }, {});

    // 2. คำนวณร้อยละทั้ง 3 ตัวชี้วัดตามสูตรมาตรฐาน
    return Object.keys(summedData).map(groupName => {
      const { totalTarget, totalCxr, totalAbnormal, totalDiagnosis } = summedData[groupName];
      
      return {
        "กลุ่มเสี่ยง": groupName,
        "ร้อยละการคัดกรอง (CXR)": totalTarget > 0 
          ? Number(((totalCxr / totalTarget) * 100).toFixed(2)) 
          : 0,
        "ร้อยละ CXR ผิดปกติ": totalCxr > 0 
          ? Number(((totalAbnormal / totalCxr) * 100).toFixed(2)) 
          : 0,
        "ร้อยละการวินิจฉัย": totalCxr > 0 
          ? Number(((totalDiagnosis / totalCxr) * 100).toFixed(2)) 
          : 0
      };
    });
  }
},
    {
        id: 'ampur-summary',
        type: 'bar',
        label: 'ร้อยละคัดกรองวัณโรคภาพรวมรายอำเภอ แยกกลุ่ม',
        transform: (data) => {
          const type1 = "กลุ่มเสี่ยง 7 กลุ่มที่เบิกชดเชยได้จาก สปสช. (ประชาชนไทยทุกสิทธิ)";
          const type2 = "กลุ่มเสี่ยงวัณโรคเฝ้าระวังตามบริบทของพื้นที่";



          const ampurMap = data.reduce((acc, curr) => {
            const name = curr.ampur || "ไม่ระบุ";
            if (!acc[name]) {
              acc[name] = { 
                name, 
                t1_target: 0, t1_cxr: 0, 
                t2_target: 0, t2_cxr: 0,
                total_target: 0, total_cxr: 0 
              };
            }

            const target = Number(curr.target) || 0;
            const cxr = Number(curr.cxr_total) || 0;

            // แยกสะสมตามประเภท
            if (curr.risk_type === type1) {
              acc[name].t1_target += target;
              acc[name].t1_cxr += cxr;
            } else if (curr.risk_type === type2) {
              acc[name].t2_target += target;
              acc[name].t2_cxr += cxr;
            }

            // รวมทั้งหมดเพื่อหาค่าเฉลี่ยอำเภอ
            acc[name].total_target += target;
            acc[name].total_cxr += cxr;

            return acc;
          }, {});

          return Object.values(ampurMap).map(a => ({
            "อำเภอ": a.name,
            "รวมผลงาน กลุ่มที่เบิกชดเชยได้จาก สปสช.": a.t1_target > 0 ? Number(((a.t1_cxr / a.t1_target) * 100).toFixed(2)) : 0,
            "รวมผลงาน กลุ่มตามบริบทพื้นที่": a.t2_target > 0 ? Number(((a.t2_cxr / a.t2_target) * 100).toFixed(2)) : 0,
            "ร้อยละคัดกรองภาพรวมรายอำเภอ": a.total_target > 0 ? Number(((a.total_cxr / a.total_target) * 100).toFixed(2)) : 0
          }));
        }
      },
      {
  id: 'main-table',
  type: 'table',
  label: 'ตารางสรุปผลการคัดกรองวัณโรค แยกรายอำเภอ',
  transform: (data) => {
    // 1. ดึงชื่ออำเภอและจัดเรียง
    const ampurNames = Array.from(new Set(data.map(item => item.ampur))).filter(Boolean).sort();
    const type1 = "กลุ่มเสี่ยง 7 กลุ่มที่เบิกชดเชยได้จาก สปสช. (ประชาชนไทยทุกสิทธิ)";
    const type2 = "กลุ่มเสี่ยงวัณโรคเฝ้าระวังตามบริบทของพื้นที่";

    const processGroup = (targetType, groupLabel) => {
      const filtered = data.filter(item => item.risk_type === targetType);
      
      // กำหนดโครงสร้างแถว Header ให้ "ภาพรวมจังหวัด" อยู่ลำดับแรกๆ
      const headerRow = { 
        "กลุ่มเสี่ยง": groupLabel, 
        "ภาพรวมจังหวัด": "", // เอามาไว้ตรงนี้เพื่อให้ Column Order อยู่หน้า
        isHeader: true 
      };
      // ตามด้วยชื่ออำเภออื่นๆ
      ampurNames.forEach(name => headerRow[name] = "");

      const riskGroupMap = filtered.reduce((acc, curr) => {
        const group = curr.risk_group || "ไม่ระบุ";
        if (!acc[group]) {
          // กำหนดลำดับ Key ให้เหมือนกันกับ Header
          acc[group] = { 
            "กลุ่มเสี่ยง": group, 
            "ภาพรวมจังหวัด": "0.00", 
            isHeader: false 
          };
          ampurNames.forEach(name => acc[group][name] = "0.00");
          acc[group]._totalTarget = 0;
          acc[group]._totalCxr = 0;
        }

        const target = Number(curr.target) || 0;
        const cxr = Number(curr.cxr_total) || 0;
        
        acc[group][curr.ampur] = target > 0 ? ((cxr / target) * 100).toFixed(2) : "0.00";
        acc[group]._totalTarget += target;
        acc[group]._totalCxr += cxr;
        return acc;
      }, {});

      const rows = Object.values(riskGroupMap).map(row => {
        const { _totalTarget, _totalCxr, ...cleanRow } = row;
        // คำนวณค่าภาพรวมจังหวัด
        cleanRow["ภาพรวมจังหวัด"] = _totalTarget > 0 ? ((_totalCxr / _totalTarget) * 100).toFixed(2) : "0.00";
        return cleanRow;
      });

      return [headerRow, ...rows];
    };

    return [
      ...processGroup(type1, "1. กลุ่มเสี่ยง 7 กลุ่ม สปสช."),
      ...processGroup(type2, "2. กลุ่มเสี่ยงตามบริบทพื้นที่")
    ];
  }
}
    ]
  },
  // --- ส่วนหนึ่งของ reportRegistry.js หรือไฟล์ Config ---

"TB_RISK_SCORE": {
  layout: [
{ i: 'card-total', x: 0, y: 0, w: 3, h: 3 },
    { i: 'card-admit', x: 3, y: 0, w: 3, h: 3 },
    { i: 'card-death', x: 6, y: 0, w: 3, h: 3 },
    { i: 'card-performance', x: 9, y: 0, w: 3, h: 3 },
    
    // แถวสอง: Heatmap ขยับขึ้นมาต่อทันที (y: 2)
    { i: 'measure-heatmap-percent', x: 0, y: 2, w: 12, h: 10 },
    
    // แถวล่าง: กราฟแท่ง (y: 12)
    { i: 'risk-distribution-stack', x: 0, y: 12, w: 7, h: 8 },
    { i: 'mortality-bar-chart', x: 7, y: 12, w: 5, h: 8 }
  ],
  widgets: [
    // --- Card: ผู้ป่วยทั้งหมด ---
    {
      id: 'card-total',
      type: 'card',
      label: 'ผู้ป่วยขึ้นทะเบียนสะสม',
      transform: (data) => {
        const total = data.filter(d => d.topic === 'จำนวนผู้ป่วยขึ้นทะเบียนทั้งหมด (All Form)')
                          .reduce((sum, curr) => sum + (Number(curr.count) || 0), 0);
        return { value: total, unit: 'ราย', color: '#3b82f6' };
      }
    },
    // --- Card: Admit สะสม ---
    {
      id: 'card-admit',
      type: 'card',
      label: 'Admit (Inter + High)',
      transform: (data) => {
        const total = data.filter(d => d.topic.includes('Admit'))
                          .reduce((sum, curr) => sum + (Number(curr.count) || 0), 0);
        return { value: total, unit: 'ราย', color: '#f59e0b', description: 'เฝ้าระวังอาการใกล้ชิด' };
      }
    },
    // --- Card: เสียชีวิตสะสม ---
    {
      id: 'card-death',
      type: 'card',
      label: 'เสียชีวิตรวม',
      transform: (data) => {
        const total = data.filter(d => d.topic.includes('เสียชีวิต'))
                          .reduce((sum, curr) => sum + (Number(curr.count) || 0), 0);
        return { value: total, unit: 'ราย', color: '#ef4444' };
      }
    },
    // --- Card: หมอใหญ่ KPI (ร้อยละการตรวจ LFT รวมทั้งจังหวัด) ---
    {
      id: 'card-performance',
      type: 'card',
      label: 'ภาพรวมตรวจ LFT (KPI)',
      transform: (data) => {
        const totalRisk = data.filter(d => d.topic.includes('Risk ทั้งหมด') && !d.topic.includes('Low'))
                              .reduce((sum, curr) => sum + (Number(curr.count) || 0), 0);
        const lftCount = data.filter(d => d.topic === '4.1 ตรวจ LFT (ราย)')
                             .reduce((sum, curr) => sum + (Number(curr.count) || 0), 0);
        const percent = totalRisk > 0 ? (lftCount / totalRisk) * 100 : 0;
        return { value: percent.toFixed(1), unit: '%', color: '#10b981', description: 'เป้าหมาย > 90%' };
      }
    },

    // --- Stacked Bar: สัดส่วนระดับความเสี่ยงรายอำเภอ ---
    {
      id: 'risk-distribution-stack',
      type: 'bar-stack',
      label: 'สัดส่วนระดับความเสี่ยงแยกรายอำเภอ',
      transform: (data) => {
        const ampurMap = {};
        data.forEach(d => {
          if (!ampurMap[d.ampur]) ampurMap[d.ampur] = { ampur: d.ampur };
          if (d.topic.includes('Low Risk ทั้งหมด')) ampurMap[d.ampur].low = Number(d.count) || 0;
          if (d.topic.includes('Intermediate Risk ทั้งหมด')) ampurMap[d.ampur].inter = Number(d.count) || 0;
          if (d.topic.includes('High Risk ทั้งหมด')) ampurMap[d.ampur].high = Number(d.count) || 0;
        });
        return Object.values(ampurMap); // [ { ampur: 'ปง', low: 10, inter: 5, high: 2 }, ... ]
      },
      keys: ['low', 'inter', 'high'],
      colors: ['#84cc16', '#facc15', '#ef4444'] // เขียว, เหลือง, แดง
    },
    // ==========================================
    // Widget 1: Heatmap (ของเดิมของคุณ)
    // ==========================================
    {
      id: 'measure-heatmap-percent',
      type: 'heatmap',
      label: 'ร้อยละการดำเนินงานมาตรการ (Intermediate + High Risk)',
      transform: (data) => {
        const ampurGroups = data.reduce((acc, curr) => {
          if (!acc[curr.ampur]) acc[curr.ampur] = {};
          acc[curr.ampur][curr.topic] = Number(curr.count) || 0;
          return acc;
        }, {});

        const result = [];
        Object.keys(ampurGroups).forEach(ampur => {
          const vals = ampurGroups[ampur];
          
          const totalRisk = (vals['2.2 Score 15 - 18 = Intermediate Risk ทั้งหมด'] || 0) + 
                            (vals['2.3 Score ≥ 19 = High Risk ทั้งหมด'] || 0);

          const getPercent = (value) => (totalRisk > 0 ? (value / totalRisk) * 100 : 0);

          const measures = [
            { key: '3.1 Consult อายุรแพทย์ (ราย)', label: 'ร้อยละ Consult' },
            { key: '4.1 ตรวจ LFT (ราย)', label: 'ร้อยละ ตรวจ LFT' },
            { key: '5.1 กำกับการกินยาโดย จนท. (ราย)', label: ' ร้อยละ กำกับการกินยา' },
            { key: 'High Risk Admit', label: 'ร้อยละ Admit' }
          ];

          measures.forEach(m => {
            result.push({
              ampur: ampur,
              topic: m.label,
              count: getPercent(vals[m.key] || 0)
            });
          });
        });

        return result;
      }
    },

    // ==========================================
    // Widget 2: Bar Chart (เพิ่มใหม่ - อัตราเสียชีวิต)
    // ==========================================
    {
      id: 'mortality-bar-chart',
      type: 'bar', // เปลี่ยน type เป็น bar chart
      label: 'อัตราการเสียชีวิตของผู้ป่วย TB แยก Risk Score',
      transform: (data) => {
        // 1. รวมผลรวมของทั้งจังหวัด (หรือจะแยกตามอำเภอก็ได้ แต่ใน Excel เป็นภาพรวม)
        let lowTotal = 0, lowDeath = 0;
        let interTotal = 0, interDeath = 0;
        let highTotal = 0, highDeath = 0;

        data.forEach(curr => {
          const val = Number(curr.count) || 0;
          const topic = curr.topic ? curr.topic.trim() : '';

          // นับกลุ่ม Low Risk
          if (topic === '2.1 Score 0 - 14 = Low Risk ทั้งหมด') lowTotal += val;
          if (topic === 'Low Risk เสียชีวิต') lowDeath += val;

          // นับกลุ่ม Intermediate Risk
          if (topic === '2.2 Score 15 - 18 = Intermediate Risk ทั้งหมด') interTotal += val;
          if (topic === 'Intermediate Risk เสียชีวิต') interDeath += val;

          // นับกลุ่ม High Risk
          if (topic === '2.3 Score ≥ 19 = High Risk ทั้งหมด') highTotal += val;
          if (topic === 'High Risk เสียชีวิต') highDeath += val;
        });

        // ฟังก์ชันคำนวณร้อยละ
        const getPercent = (death, total) => total > 0 ? (death / total) * 100 : 0;

        // 2. ส่งข้อมูลออกไปวาด Bar Chart (แกน X คือ riskGroup, แกน Y คือ mortalityRate)
        return [
          {
            riskGroup: 'Low Risk',
            mortalityRate: getPercent(lowDeath, lowTotal)
          },
          {
            riskGroup: 'Intermediate Risk',
            mortalityRate: getPercent(interDeath, interTotal)
          },
          {
            riskGroup: 'High Risk',
            mortalityRate: getPercent(highDeath, highTotal)
          }
        ];
      }
    }
  ]
}
};

export const getReportConfig = (code) => reportStrategies[code] || reportStrategies["TB_SCREENING_RESULTS"];
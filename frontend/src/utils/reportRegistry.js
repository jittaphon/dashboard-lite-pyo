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
        /*"ร้อยละ CXR ผิดปกติ": totalCxr > 0 
          ? Number(((totalAbnormal / totalCxr) * 100).toFixed(2)) 
          : 0,
        "ร้อยละการวินิจฉัย": totalCxr > 0 
          ? Number(((totalDiagnosis / totalCxr) * 100).toFixed(2)) 
          : 0*/
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
         /*"ร้อยละ CXR ผิดปกติ": totalCxr > 0 
          ? Number(((totalAbnormal / totalCxr) * 100).toFixed(2)) 
          : 0,
        "ร้อยละการวินิจฉัย": totalCxr > 0 
          ? Number(((totalDiagnosis / totalCxr) * 100).toFixed(2)) 
          : 0*/
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
    { i: 'bar-walkin-vs-screening', x: 0, y: 0, w: 6, h: 9 }, // เริ่มที่ซ้ายสุด (x:0) กว้าง 6
  { i: 'bar-risk-stacked', x: 6, y: 0, w: 6, h: 9 }       
  ],
  widgets: [
 

    // --- 📊 กราฟใหม่: เปรียบเทียบช่องทางรับผู้ป่วย (รวมทั้งจังหวัด) ---
   {
  id: 'bar-walkin-vs-screening',
  type: 'bar-not-percentage', 
  label: 'จำนวนผู้ป่วยขึ้นทะเบียนทั้งหมด (All Form)',
  transform: (data, summaryData) => {
    const summary = summaryData || [];
    
    let totalWalkIn = 0;
    let totalScreening = 0;

    summary.forEach(item => {
      totalWalkIn += Number(item.walk_in_count || 0);
      totalScreening += Number(item.screening_count || 0);
    });

    // 🌟 แก้ตรงนี้: ส่ง Object ที่มี Key ตรงกับที่ DynamicCountChart ดักไว้ (walk_in_count, screening_count)
    return [
      { 
        // label จะถูกดึงไปเป็นแกน X อัตโนมัติ (เพราะเป็น String ตัวเดียวใน Object)
        type: 'ภาพรวม', 
        walk_in_count: totalWalkIn, 
        screening_count: totalScreening 
      }
    ];
  }
},

    // --- กราฟเดิมของคุณ: สัดส่วนการเสียชีวิตแยกตามระดับความเสี่ยง ---
    {
      id: 'bar-risk-stacked',
      type: 'stacked-bar',
      label: 'สัดส่วนการเสียชีวิตแยกตามระดับความเสี่ยง',
      transform: (data) => {
        const summary = {
          High: { alive: 0, died: 0 },
          Intermediate: { alive: 0, died: 0 },
          Low: { alive: 0, died: 0 }
        };

        data.forEach(item => {
          const rawRisk = String(item.risk_level || "").toLowerCase();
          let risk = "Low";
          if (rawRisk.includes("high")) risk = "High";
          else if (rawRisk.includes("inter")) risk = "Intermediate";

          const rawResult = String(item.treatment_result || "").toLowerCase().trim();
          const isDead = rawResult === "died" || rawResult === "เสียชีวิต";

          if (isDead) {
            summary[risk].died++;
          } else {
            summary[risk].alive++;
          }
        });

        return [
          {
            risk: "High Risk",
            "ผู้ป่วย (มีชีวิต)": summary.High.alive,
            "ผู้เสียชีวิต": summary.High.died
          },
          {
            risk: "Intermediate Risk",
            "ผู้ป่วย (มีชีวิต)": summary.Intermediate.alive,
            "ผู้เสียชีวิต": summary.Intermediate.died
          },
          {
            risk: "Low Risk",
            "ผู้ป่วย (มีชีวิต)": summary.Low.alive,
            "ผู้เสียชีวิต": summary.Low.died
          }
        ];
      }
    }
  ]
},

"TB_PA": {
  layout: [
      { i: 'tb-pa-table', x: 4, y: 0, w: 8, h: 12 },
      { i: 'tb-pa-pie', x: 0, y: 0, w: 4, h: 12 }

  ],

  widgets: [
       {
  id: 'tb-pa-table',
  type: 'table-v2',
  label: 'รายงาน รักษาวัณโรค PA (ราย รพ / อำเภอ)',
  transform: (data) => {
    // 🔥 STEP 1: filter (Logic เดิม)
    const filtered = data.filter(r =>
      r.regis_type === 'New' &&
      r.classify === 'ในปอด (P)' &&
      r.start_date >= '20250901' &&
      r.start_date <= '20251231' &&
      r.rx_result !== 'Change diagnosis'
    );

    // 🔥 STEP 2: dedupe ต่อ patient (Logic เดิม)
    const patientMap = {};
    filtered.forEach(r => {
      const id = r.PATIENT_ID;
      if (!patientMap[id] || r.rx_date > patientMap[id].rx_date) {
        patientMap[id] = r;
      }
    });

    const uniqueRows = Object.values(patientMap);
    const map = {};

    // 🔥 STEP 3: group รายอำเภอ
    uniqueRows.forEach(r => {
      const d = r.AMPUR_NAME
  ? (r.AMPUR_NAME.startsWith('รพ.') ? r.AMPUR_NAME : `รพ.${r.AMPUR_NAME}`)
  : '-';
      if (!map[d]) {
        map[d] = {
          district: d,
          death: 0,
          ltfu: 0,
          on_treatment: 0,
          rr_mdr: 0,
          transfer_out: 0,
          success: 0,
          total_cases: 0,
          net_cases: 0
        };
      }

      const item = map[d];
      item.total_cases++;

      if (r.rx_result === 'Died') item.death++;
      if (r.rx_result === 'Lost to follow-up') item.ltfu++;
      if (r.rx_result === 'On treatment') item.on_treatment++;
      if (r.rx_result === 'RR/MDR ก่อนเดือนที่ 5') item.rr_mdr++;
      if (r.rx_result === 'Transferred out') item.transfer_out++;
      if (['Completed', 'Cured'].includes(r.rx_result)) item.success++;
    });

    // แปลง Map เป็น Array พร้อมคำนวณ Rate รายอำเภอ
    const rows = Object.values(map).map(i => {
      i.net_cases = i.total_cases - i.rr_mdr;
      i.death_rate = i.net_cases ? +(i.death * 100 / i.net_cases).toFixed(2) : 0;
      i.ltfu_rate = i.net_cases ? +(i.ltfu * 100 / i.net_cases).toFixed(2) : 0;
      i.success_rate = i.net_cases ? +(i.success * 100 / i.net_cases).toFixed(2) : 0;
      return i;
    });

    // 🔥 STEP 4: คำนวณแถว "รวม" (Grand Total)
    const total = rows.reduce((acc, curr) => {
      acc.death += curr.death;
      acc.ltfu += curr.ltfu;
      acc.on_treatment += curr.on_treatment;
      acc.rr_mdr += curr.rr_mdr;
      acc.transfer_out += curr.transfer_out;
      acc.success += curr.success;
      acc.total_cases += curr.total_cases;
      acc.net_cases += curr.net_cases;
      return acc;
    }, {
      district: 'รวม', // ป้ายชื่อแถวรวม
      death: 0,
      ltfu: 0,
      on_treatment: 0,
      rr_mdr: 0,
      transfer_out: 0,
      success: 0,
      total_cases: 0,
      net_cases: 0
    });



    // คำนวณ Rate สำหรับแถวรวม
    total.death_rate = total.net_cases ? +(total.death * 100 / total.net_cases).toFixed(2) : 0;
    total.ltfu_rate = total.net_cases ? +(total.ltfu * 100 / total.net_cases).toFixed(2) : 0;
    total.success_rate = total.net_cases ? +(total.success * 100 / total.net_cases).toFixed(2) : 0;

    // คืนค่า array ที่รวมแถวสรุปไว้ท้ายสุด
    return [...rows, total];
  }
},
   {
  id: 'tb-pa-pie',
  type: 'pie',
  label: 'สัดส่วนผลการรักษาทั้งจังหวัดพะเยา',
 props: {
  colorMap: {
    "กำลังรักษา": "#92D050",
    "เสียชีวิต": "#C0504D",
    "ขาดยา": "#4BACC6",
    "โอนออก": "#365988",
    "RR/MDR ก่อนเดือนที่ 5": "#772020",
    "สำเร็จ": "#8064A2"
  }
},
  transform: (data) => {
    const filtered = data.filter(r =>
      r.regis_type === 'New' &&
      r.classify === 'ในปอด (P)' &&
      r.start_date >= '20250901' &&
      r.start_date <= '20251231' &&
      r.rx_result !== 'Change diagnosis'
    );

    const patientMap = {};
    filtered.forEach(r => {
      const id = r.PATIENT_ID;
      if (!patientMap[id] || r.rx_date > patientMap[id].rx_date) {
        patientMap[id] = r;
      }
    });

    const uniqueRows = Object.values(patientMap);

    const summary = {
      "กำลังรักษา": 0,
      "เสียชีวิต": 0,
      "ขาดยา": 0,
      "โอนออก": 0,
      "RR/MDR ก่อนเดือนที่ 5": 0,
      "สำเร็จ": 0
    };

    uniqueRows.forEach(r => {
      if (r.rx_result === 'On treatment') summary["กำลังรักษา"]++;
      else if (r.rx_result === 'Died') summary["เสียชีวิต"]++;
      else if (r.rx_result === 'Lost to follow-up') summary["ขาดยา"]++;
      else if (r.rx_result === 'Transferred out') summary["โอนออก"]++;
      else if (r.rx_result === 'RR/MDR ก่อนเดือนที่ 5') summary["RR/MDR ก่อนเดือนที่ 5"]++;
      else if (['Completed', 'Cured'].includes(r.rx_result)) summary["สำเร็จ"]++;
    });

    // ✅ FIX ORDER กันเพี้ยน
    const ORDER = [
      "กำลังรักษา",
      "เสียชีวิต",
      "ขาดยา",
      "โอนออก",
      "RR/MDR ก่อนเดือนที่ 5",
      "สำเร็จ"
    ];

    return ORDER.map(key => ({
      label: key,
      value: summary[key] || 0
    }));
  }
}
 
  ]
}
,

"TB_TREATMENT_COVERAGE": {
  layout: [
      { i: 'tb-pa-table', x: 0, y: 0, w: 12, h: 12 },
      { i: 'tb-pa-chart', x: 0, y: 0, w: 12, h: 12 }

  ],

  widgets: [
{
  id: 'tb-pa-table',
  type: 'table-v2',
  label: 'ร้อยละความครอบคลุมการรักษาผู้ป่วยวัณโรครายใหม่และกลับเป็นซ้ำ  TB Treatment Coverage',
  transform: (data) => {
    // 1. กำหนดเป้าหมายรายอำเภอ (TCR 100%)
    const TARGET_MAP = {
      'เชียงม่วน': 26,
      'ดอกคำใต้': 94,
      'จุน': 69,
      'เชียงคำ': 106,
      'เมืองพะเยา': 168,
      'ปง': 71,
      'ภูซาง': 44,
      'ภูกามยาว': 29,
      'แม่ใจ': 44
    };

    const PHAYAO_SET = new Set(Object.keys(TARGET_MAP));
    
    // 2. Initialize ค่าเริ่มต้น
    const stats = {};
    for (const district in TARGET_MAP) {
      stats[district] = 0;
    }

    // 3. ประมวลผลนับจำนวนผู้ป่วย (Pt.)
    for (const r of data) {
      const regis = r.regis_type?.trim();
      const rx = r.rx_result?.trim();

      if (!['New', 'Relapse'].includes(regis)) continue;
      if (rx === 'Change diagnosis') continue;

      const pampur = r.PAMPUR_NAME?.trim();
      const ampur = r.AMPUR_NAME?.trim();

      // Logic: ถ้าที่อยู่ (PAMPUR) อยู่นอกพะเยา ให้นับเข้าอำเภอที่มารักษา (AMPUR)
      const area = PHAYAO_SET.has(pampur) ? pampur : ampur;

      if (stats.hasOwnProperty(area)) {
        stats[area] += 1;
      }
    }

    // 4. คำนวณค่าต่างๆ และเพิ่ม Column "คงเหลือ" (remaining)
    let totalTarget = 0;
    let totalPt = 0;

    const output = Object.keys(TARGET_MAP).map(area => {
      const target = TARGET_MAP[area];
      const pt = stats[area];
      const remaining = target - pt; // คำนวณส่วนต่าง
      const percent = target > 0 ? (pt / target) * 100 : 0;

      totalTarget += target;
      totalPt += pt;

      return {
        area: area,
        target: target,
        pt: pt,
        remaining: remaining > 0 ? remaining : 0, // ถ้าเกินเป้าให้แสดงเป็น 0
        achievement: percent.toFixed(2)
      };
    });

    // 5. แถวสรุปผลรวม (Total)
    const totalRemaining = totalTarget - totalPt;
    const totalPercent = totalTarget > 0 ? (totalPt / totalTarget) * 100 : 0;

    output.push({
      area: 'รวม',
      target: totalTarget,
      pt: totalPt,
      remaining: totalRemaining > 0 ? totalRemaining : 0,
      achievement: totalPercent.toFixed(2)
    });

    return output;
  }
},

  ]
}



};

export const getReportConfig = (code) => reportStrategies[code] || reportStrategies["TB_SCREENING_RESULTS"];
import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';

const MyHeatmap = ({ data = [] }) => {
  const formattedData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const topics = [
      ...new Set(
        data
          .map(d => d?.topic)
          .filter(t => typeof t === 'string' && t.trim() !== '')
      )
    ];

    return topics.map(topic => {
      const rows = data.filter(d => d?.topic === topic);
      const cells = rows.map(d => {
        const num = Number(d?.count);
        return {
          x: d?.ampur || 'Unknown',
          y: Number.isFinite(num) ? num : 0 
        };
      });

      return {
        id: topic,
        data: cells
      };
    });
  }, [data]);

  if (!formattedData || formattedData.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: '16px' }}>
        ⚠️ ไม่พบข้อมูลการดำเนินงาน
      </div>
    );
  }

  return (
    <div
      style={{
        height: 550, // เพิ่มความสูงเล็กน้อย
        background: '#ffffff',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        fontFamily: "'Inter', 'Sarabun', sans-serif" // ใช้ Font ที่อ่านง่าย
      }}
    >
      <ResponsiveHeatMap
        data={formattedData}
        
        // ✅ ปรับช่วงสีให้ดู Soft แต่แยกแยะง่าย
        colors={{
          type: 'quantize',
          steps: 5,
          colors: ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e'] 
        }}

        minValue={0}
        maxValue={100}
        
        // ✅ เพิ่ม Margin ฝั่งซ้ายให้ชื่อมาตรการยาวๆ ไม่อึดอัด
        margin={{ top: 90, right: 60, bottom: 60, left: 180 }}
        
        // ✅ ปรับแต่งแกน X (อำเภอ)
        axisTop={{
          tickSize: 0,
          tickPadding: 12,
          tickRotation: -25,
          format: v => v.length > 10 ? `${v.substring(0, 10)}...` : v // ตัดคำถ้าชื่อยาวเกิน
        }}

        // ✅ ปรับแต่งแกน Y (มาตรการ)
        axisLeft={{
          tickSize: 0,
          tickPadding: 15,
          tickRotation: 0,
        }}

        // ✅ ปรับ Design ตัวเลขในช่อง (Cell Labels)
        enableLabels={true}
        label={d => `${Math.round(d.value)}%`}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 3]] // ทำให้ตัวหนังสือเข้มกว่าสีพื้นเพื่อให้อ่านออก
        }}

        // ✅ ปรับแต่ง Cell (ช่องสี่เหลี่ยม)
        borderRadius={4} // เพิ่มความโค้งมนให้ช่องนิดหน่อย
        borderWidth={2}
        borderColor="#ffffff"
        emptyColor="#f8fafc"
        
        // ✅ ปรับแต่ง Tooltip ให้ดู Modern
        hoverTarget="cell"
        tooltip={({ cell }) => (
          <div
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid #334155',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}>
              หัวข้อ: {cell.serieId}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
              <span>อำเภอ: <strong>{cell.data.x}</strong></span>
              <span>ร้อยละ: <strong style={{ color: '#fbbf24' }}>{cell.data.y.toFixed(1)}%</strong></span>
            </div>
          </div>
        )}

        // ✅ ปรับแต่ง Theme ของ Text ทั่วทั้ง Chart
        theme={{
          labels: {
            text: {
              fontSize: 13,
              fontWeight: 600,
            }
          },
          axis: {
            ticks: {
              text: {
                fill: '#475569',
                fontSize: 12,
                fontWeight: 500
              }
            }
          }
        }}
      />
    </div>
  );
};

export default MyHeatmap;
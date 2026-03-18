import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';

const MyHeatmap = ({ data }) => {
  // 1. แปลง Data ให้เข้ากับ Format ของ Nivo
  // Nivo ต้องการ { id: 'ชื่อแกน Y', data: [ { x: 'แกน X', y: 80 }, ... ] }
  const formattedData = React.useMemo(() => {
    const topics = [...new Set(data.map(d => d.topic))];
    return topics.map(topic => ({
      id: topic,
      data: data
        .filter(d => d.topic === topic)
        .map(d => ({
          x: d.ampur,
          y: d.count // นี่คือค่า % ที่คำนวณมาแล้ว
        }))
    }));
  }, [data]);

  return (
    <div style={{ height: '500px', background: '#ffffff', borderRadius: '24px', padding: '20px' }}>
      <ResponsiveHeatMap
        data={formattedData}
        // ตั้งค่าสี: ใช้สี เขียว-เหลือง-แดง แบบที่นิยมใน Dashboard สุขภาพ
        colors={{
          type: 'sequential',
          scheme: 'rdylgn', // Red-Yellow-Green (กลับด้านได้ถ้าต้องการ)
          diverging: false
        }}
        margin={{ top: 60, right: 30, bottom: 30, left: 100 }}
        valueFormat=">-.1f" // แสดงทศนิยม 1 ตำแหน่ง
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendOffset: -40
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        // ปรับแต่งช่อง (Cells)
        enableLabels={true} // เปิดตัวเลขในช่อง
        label={d => `${d.value}%`} // แสดงแค่ตัวเลขกับ %
        labelTextColor={{
            from: 'color',
            modifiers: [['darker', 2]]
        }}
        emptyColor="#f1f5f9"
        borderWidth={2}
        borderColor="#ffffff"
        // ปรับ Tooltip ให้ดูดี
        tooltip={({ cell }) => (
          <div style={{
            background: '#1e293b',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <strong>{cell.serieId}</strong> ({cell.data.x}): {cell.data.y.toFixed(1)}%
          </div>
        )}
      />
    </div>
  );
};

export default MyHeatmap;
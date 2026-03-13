// components/DynamicDonutChart.jsx
import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function DynamicDonutChart({ data, title }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // หา Key ที่เป็นข้อความ เพื่อนำมาเป็น Labels (เช่น ampur, risk_group)
    const labelKey = Object.keys(data[0]).find(
      (key) => typeof data[0][key] === 'string' && key !== 'update_at' && key !== 'update_at_th'
    ) || Object.keys(data[0])[0];

    // หา Key ที่เป็นตัวเลขค่าแรกเพื่อนำมาแสดงสัดส่วนใน Donut Chart
    const numericKey = Object.keys(data[0]).find(
      (key) => typeof data[0][key] === 'number' && key !== 'id' && key !== 'byear'
    );

    if (!numericKey) return null;

    const labels = data.map((item) => item[labelKey] || 'N/A');
    const values = data.map((item) => item[numericKey] || 0);

    // สร้างชุดสี
    const backgroundColors = values.map((_, index) => {
      const hue = (index * (360 / values.length)) % 360;
      return `hsla(${hue}, 70%, 50%, 0.7)`;
    });

    const borderColors = values.map((_, index) => {
      const hue = (index * (360 / values.length)) % 360;
      return `hsla(${hue}, 70%, 50%, 1)`;
    });

    return {
      labels,
      datasets: [
        {
          label: numericKey,
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      title: {
        display: !!title,
        text: title || 'สัดส่วนข้อมูล',
      },
    },
  };

  if (!chartData) {
    return <div className="flex items-center justify-center h-full text-slate-400">ไม่สามารถสร้างกราฟได้ (ข้อมูลไม่ครบถ้วน)</div>;
  }

  return (
    <div className="w-full h-full p-4 flex items-center justify-center">
      <div className="w-full h-[90%]">
        <Doughnut options={options} data={chartData} />
      </div>
    </div>
  );
}
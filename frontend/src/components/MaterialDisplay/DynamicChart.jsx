// components/DynamicChart.jsx (Bar Chart)
import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DynamicChart({ data, title }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labelKey = Object.keys(data[0]).find(
      (key) => typeof data[0][key] === 'string' && key !== 'update_at' && key !== 'update_at_th'
    ) || Object.keys(data[0])[0];

    const numericKeys = Object.keys(data[0]).filter(
      (key) => typeof data[0][key] === 'number' && key !== 'id' && key !== 'byear'
    );

    const labels = data.map((item) => item[labelKey] || 'N/A');

    const datasets = numericKeys.map((key, index) => {
      const hue = (index * 137.5) % 360;
      return {
        label: key,
        data: data.map((item) => item[key] || 0),
        backgroundColor: `hsla(${hue}, 70%, 50%, 0.7)`,
        borderColor: `hsla(${hue}, 70%, 50%, 1)`,
        borderWidth: 1,
      };
    });

    return { labels, datasets };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  if (!chartData || chartData.datasets.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">ไม่สามารถสร้างกราฟได้ (ไม่มีข้อมูลตัวเลข)</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <Bar options={options} data={chartData} />
    </div>
  );
}
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
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// ... (ส่วนการ Import และ Register เหมือนเดิม)

export default function DynamicCountChart({ data, title }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labelKey = Object.keys(data[0]).find(
      (key) => typeof data[0][key] === 'string' && key !== 'update_at' && key !== 'update_at_th'
    ) || Object.keys(data[0])[0];

    const labels = data.map((item) => {
      const rawLabel = String(item[labelKey] || 'N/A');
      return rawLabel.length > 30 ? rawLabel.substring(0, 30) + '...' : rawLabel;
    });

    // 🌟 เปลี่ยนคู่สีเป็น ฟ้า vs ชมพู ตามที่ต้องการ
    const specificKeyMap = {
      'walk_in_count': {
        label: 'Walk-in (มาเอง)',
        bg: 'rgba(54, 162, 235, 0.8)', // 🔵 สีฟ้า (Sky Blue)
        border: 'rgb(54, 162, 235)'
      },
      'screening_count': {
        label: 'Screening (คัดกรอง)',
        bg: 'rgba(255, 99, 132, 0.8)', // 💗 สีชมพู (Pink/Rose)
        border: 'rgb(255, 99, 132)'
      }
    };

    const fallbackColors = [
      { bg: 'rgba(153, 102, 255, 0.8)', border: 'rgb(153, 102, 255)' }, // ม่วง (สำรอง)
      { bg: 'rgba(255, 205, 86, 0.8)', border: 'rgb(255, 205, 86)' },  // เหลือง (สำรอง)
    ];

    const datasets = [];
    const dynamicNumericKeys = Object.keys(data[0]).filter(
      (key) => typeof data[0][key] === 'number' && key !== 'id' && key !== 'byear'
    );

    dynamicNumericKeys.forEach((key, index) => {
      let labelName = key;
      let color;

      if (specificKeyMap[key]) {
        labelName = specificKeyMap[key].label;
        color = specificKeyMap[key];
      } else {
        color = fallbackColors[index % fallbackColors.length];
      }

      datasets.push({
        label: labelName,
        data: data.map((item) => item[key] || 0),
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: 5, // ปรับขอบมนขึ้นนิดนึงให้ดูทันสมัย
      });
    });

    // เรียงลำดับให้ Walk-in (ฟ้า) อยู่ซ้าย และ Screening (ชมพู) อยู่ขวา
    datasets.sort((a, b) => {
      if (a.label.includes('Walk-in')) return -1;
      if (b.label.includes('Walk-in')) return 1;
      return 0;
    });

    return { labels, datasets, labelKey };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { boxWidth: 12, padding: 20, font: { size: 12 } } 
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value) => (value > 0 ? value.toLocaleString() : ''),
        font: { weight: 'bold', size: 11 },
        color: '#475569',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toLocaleString()} ราย`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { drawBorder: false, color: '#f1f5f9' },
       ticks: { 
      // 🌟 เพิ่มบรรทัดนี้เพื่อกำหนดระยะห่างทีละ 40
      stepSize: 40, 
      callback: (value) => value.toLocaleString() 
    }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  if (!chartData || chartData.datasets.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">ไม่พบข้อมูลสำหรับสร้างกราฟ</div>;
  }

  return (
    <div className="w-full h-full p-2">
      <Bar options={options} data={chartData} />
    </div>
  );
}
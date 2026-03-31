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

export default function StackedRiskChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labels = data.map(item => item.risk || item.risk_level || 'N/A');

    // ปรับสีให้ดูเป็น Dashboard มืออาชีพ (ใช้สี Tailwind: Emerald-500 และ Rose-500)
    const datasets = [
      {
        label: 'ผู้ป่วย (มีชีวิต)',
        data: data.map(item => item["ผู้ป่วย (มีชีวิต)"] || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.85)', 
        hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
        borderRadius: 4,
        stack: 'Stack 0',
      },
      {
        label: 'ผู้เสียชีวิต',
        data: data.map(item => item["ผู้เสียชีวิต"] || 0),
        backgroundColor: 'rgba(244, 63, 94, 0.85)',
        hoverBackgroundColor: 'rgba(244, 63, 94, 1)',
        borderRadius: 4,
        stack: 'Stack 0',
      }
    ];

    return { labels, datasets };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false, // ทำให้ Hover ง่ายขึ้นเมื่อเมาส์ชี้ไปที่คอลัมน์
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          usePointStyle: true, 
          padding: 20,
          font: { family: 'Prompt', size: 13, weight: '500' } 
        }
      },
      datalabels: {
        color: '#ffffff',
        font: { family: 'Prompt', weight: 'bold', size: 12 },
        // ซ่อน Label ถ้าค่าเป็น 0 และใส่ลูกน้ำ (Comma) ให้ตัวเลข
        formatter: (value) => (value > 0 ? value.toLocaleString() : ''),
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // สีพื้นหลัง Tooltip (Slate-900)
        titleFont: { family: 'Prompt', size: 14, weight: 'bold' },
        bodyFont: { family: 'Prompt', size: 13 },
        footerFont: { family: 'Prompt', size: 14, weight: 'bold' },
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${context.raw.toLocaleString()} ราย`;
          },
          footer: (tooltipItems) => {
            let total = 0;
            tooltipItems.forEach((item) => { total += item.raw; });
            return `รวมทั้งหมด: ${total.toLocaleString()} ราย`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { family: 'Prompt', size: 13, weight: '500' } }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)', // เส้น Grid สีอ่อนๆ
          drawBorder: false 
        },
        title: { 
          display: true, 
          text: 'จำนวนผู้ป่วย (ราย)', 
          font: { family: 'Prompt', size: 13, weight: 'bold' } 
        },
        ticks: { 
          stepSize: 1,
          font: { family: 'Prompt', size: 12 },
          // ใส่ลูกน้ำ (Comma) ให้แกน Y
          callback: (value) => value.toLocaleString()
        }
      }
    }
  };

  if (!chartData) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 font-['Prompt']">
        ไม่มีข้อมูลการเสียชีวิต
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2" style={{ minHeight: '350px' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
}
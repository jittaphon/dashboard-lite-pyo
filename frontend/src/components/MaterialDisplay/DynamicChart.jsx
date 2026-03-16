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

export default function DynamicChart({ data, title }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labelKey = Object.keys(data[0]).find(
      (key) => typeof data[0][key] === 'string' && key !== 'update_at' && key !== 'update_at_th'
    ) || Object.keys(data[0])[0];

    const numericKeys = Object.keys(data[0]).filter(
      (key) => typeof data[0][key] === 'number' && key !== 'id' && key !== 'byear'
    );

    const labels = data.map((item) => {
      const rawLabel = String(item[labelKey] || 'N/A');
      return rawLabel.length > 30 ? rawLabel.substring(0, 30) + '...' : rawLabel;
    });

    // กำหนดสีล็อคตามลำดับ: แท่งที่ 1 สีฟ้า, แท่งที่ 2 สีแดง, แท่งที่ 3 สีเหลือง
    const presetColors = [
      { bg: 'rgba(54, 162, 235, 0.8)', border: 'rgb(54, 162, 235)' },
      { bg: 'rgba(255, 99, 132, 0.8)', border: 'rgb(255, 99, 132)' },
      { bg: 'rgba(255, 205, 86, 0.8)', border: 'rgb(255, 205, 86)' },
    ];

    const datasets = numericKeys.map((key, index) => {
      const color = presetColors[index % presetColors.length];
      return {
        label: key,
        data: data.map((item) => item[key] || 0),
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    return { labels, datasets, labelKey };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value) => (value > 0 ? value.toFixed(1) + '%' : ''),
        font: { weight: 'bold', size: 10 },
        color: '#475569',
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return data[index][chartData.labelKey] || 'N/A';
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return ` ${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    layout: {
      padding: { top: 30, bottom: 10 }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 110,
        ticks: { callback: (value) => value + '%' }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
          padding: 5
        }
      }
    }
  };

  if (!chartData || chartData.datasets.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">ไม่สามารถสร้างกราฟได้</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <Bar options={options} data={chartData} />
    </div>
  );
}
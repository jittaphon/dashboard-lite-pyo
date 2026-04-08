import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function DynamicChart({
  data = [],
  title = '',
  type = 'pie',
  props = {} // { customColors?, colorMap? }
}) {

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);

    let backgroundColors = [];

    // ✅ Priority 1: ใช้ colorMap (แนะนำ)
    if (props.colorMap) {
      backgroundColors = labels.map(label =>
        props.colorMap[label] || '#cccccc'
      );
    }
    // ✅ Priority 2: ใช้ customColors (array)
    else if (props.customColors) {
      backgroundColors = props.customColors;
    }
    // ✅ Fallback: random color
    else {
      backgroundColors = values.map((_, i) =>
        `hsla(${(i * 60) % 360}, 65%, 50%, 0.8)`
      );
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 20
        },
      ],
    };
  }, [data, props]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { family: 'Sarabun, sans-serif', size: 13 },
          usePointStyle: true,
          padding: 15
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { family: 'Sarabun, sans-serif', size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((ctx.raw / total) * 100).toFixed(1);
            return ` ${ctx.label}: ${ctx.raw} ราย (${percent}%)`;
          }
        }
      }
    },
  };

  const ChartComponent = type === 'doughnut' ? Doughnut : Pie;

  if (!chartData) {
    return (
      <div className="p-10 text-center text-gray-400">
        ไม่มีข้อมูล
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2">
      <ChartComponent options={options} data={chartData} />
    </div>
  );
}
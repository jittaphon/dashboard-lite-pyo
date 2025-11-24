import React, { useEffect, useRef } from "react";
import * as Chart from "chart.js";

const { Chart: ChartJS, registerables } = Chart;
ChartJS.register(...registerables);

// ===== UTIL =====
function calculatePercentage(result, target) {
  if (!target || target === 0) return 0;
  return ((result / target) * 100).toFixed(2);
}

function getColorByPercentage(percentage) {
  return percentage >= 90 ? "#14b8a6" : "#fb923c";
}

// Plugin: แสดงค่าบนแท่ง
const valueLabelPlugin = {
  id: "valueLabelPlugin",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        ctx.fillStyle = "#111";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${value}%`, bar.x, bar.y - 5);
      });
    });
  },
};

export default function BarChart({ geoData, title = "กราฟแท่งแสดงเปอร์เซ็นต์การคัดกรอง" }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  console.log("BarChart Props:", { geoData, title });

  // สร้าง ChartJS
  useEffect(() => {
    if (!chartRef.current || !geoData || geoData.length === 0) return;

    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext("2d");

    // ประมวลผลข้อมูล
    const chartData = geoData.map((item) => {
      const percent = calculatePercentage(item.originalResult, item.target);
      return {
        name: item.name,
        percentage: parseFloat(percent),
        color: getColorByPercentage(percent),
      };
    });

    const labels = chartData.map((e) => e.name);
    const percentages = chartData.map((e) => e.percentage);
    const colors = chartData.map((e) => e.color);

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "เปอร์เซ็นต์",
            data: percentages,
            backgroundColor: colors,
            borderRadius: 8,
            barThickness: "flex",
            maxBarThickness: 40,
            categoryPercentage: 0.6,
            barPercentage: 0.7,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e5e7eb",
            borderWidth: 2,
            titleColor: "#111827",
            bodyColor: "#374151",
            padding: 12,
            displayColors: false,
            cornerRadius: 8,
            callbacks: {
              title: (c) => c[0].label,
              label: (c) => `เปอร์เซ็นต์: ${c.parsed.y}%`,
            },
          },
        },

        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              font: { size: 11 },
              color: "#6b7280",
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              stepSize: 20,
              color: "#6b7280",
              callback: (value) => value + "%"
            },
            grid: {
              color: "#f3f4f6",
            },
          },
        },
      },

      plugins: [valueLabelPlugin],
    });

    return () => chartInstance.current?.destroy();
  }, [geoData]);

  return (
    <div className="w-full h-full">
      <div className="relative rounded-3xl p-8 backdrop-blur-xl bg-white/60 shadow-2xl border border-white/50" 
           style={{
             boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
           }}>
        
        {/* Header with gradient */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h3>
          
          {/* Legend */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-teal-500"></div>
              <span className="text-gray-600">≥ 90%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-400"></div>
              <span className="text-gray-600">&lt; 90%</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="overflow-x-auto">
          <div style={{ height: 450, minWidth: "100%" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Glass effect overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
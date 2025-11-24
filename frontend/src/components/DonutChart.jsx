import React, { useEffect, useRef, useState } from "react";
import * as Chart from "chart.js/auto";

function formatNumber(num) {
  if (num == null) return "-";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export default function DonutChart({ selectedProCode, data, Q }) {

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [summary, setSummary] = useState({
    totalResult: 0,
    totalTarget: 0,
    percentage: 0,
    count: 0
  });

  // คำนวณข้อมูลรวม
  useEffect(() => {
    if (!data || data.length === 0) {
      setSummary({ totalResult: 0, totalTarget: 0, percentage: 0, count: 0 });
      return;
    }

    const totalResult = data.reduce((sum, item) => sum + (item.result || 0), 0);
    const totalTarget = data.reduce((sum, item) => sum + (item.target || 0), 0);
    const percentage = totalTarget > 0 ? ((totalResult / totalTarget) * 100).toFixed(2) : 0;

    setSummary({
      totalResult,
      totalTarget,
      percentage: parseFloat(percentage),
      count: data.length
    });
  }, [data]);

  // สร้าง Donut Chart
  useEffect(() => {
    if (!chartRef.current || summary.totalTarget === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    const remaining = Math.max(0, summary.totalTarget - summary.totalResult);
    
    chartInstance.current = new Chart.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["ผลงานที่ทำได้", "เป้าหมายที่เหลือ"],
        datasets: [{
          data: [summary.totalResult, remaining],
          backgroundColor: [
            summary.percentage >= 80 ? "#10b981" :
            summary.percentage >= 60 ? "#14b8a6" :
            summary.percentage >= 40 ? "#06b6d4" :
            summary.percentage >= 20 ? "#f59e0b" : "#ef4444",
            "#e5e7eb"
          ],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 4,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 16,
              font: {
                size: 13,
                family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              },
              usePointStyle: true,
              pointStyle: "circle"
            }
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 14, weight: "bold" },
            bodyFont: { size: 13 },
            callbacks: {
              label: function(context) {
                const label = context.label || "";
                const value = formatNumber(context.parsed);
                const percent = ((context.parsed / summary.totalTarget) * 100).toFixed(2);
                return `${label}: ${value} คน (${percent}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: "easeInOutQuart"
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [summary]);

  return (
    <div className="bg-white rounded-2xl p-8  shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            สรุปผลการคัดกรอง
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedProCode === "all" ? "ทุกจังหวัด" : `จังหวัดที่เลือก`} • ไตรมาสที่ {Q}
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative w-full max-w-[310px] mx-auto mb-8">
        <canvas ref={chartRef}></canvas>
        
        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
          <div className={`text-4xl font-bold ${
            summary.percentage >= 80 ? 'text-green-500' :
            summary.percentage >= 60 ? 'text-teal-500' :
            summary.percentage >= 40 ? 'text-cyan-500' :
            summary.percentage >= 20 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {summary.percentage}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            ความสำเร็จ
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl text-center text-white">
          <div className="text-xs opacity-90 mb-1">
            ผลงานที่ทำได้
          </div>
          <div className="text-lg font-bold">
            {formatNumber(summary.totalResult)}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-center text-white">
          <div className="text-xs opacity-90 mb-1">
            เป้าหมาย
          </div>
          <div className="text-lg font-bold">
            {formatNumber(summary.totalTarget)}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-center text-white">
          <div className="text-xs opacity-90 mb-1">
            จำนวนพื้นที่
          </div>
          <div className="text-lg font-bold">
            {summary.count}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { FileText, Download, Upload, BarChart2, PieChart, LineChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement
);

export default function MockHealthDashboard() {
  const [chartType, setChartType] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);

  const template = {
    labels: ["อำเภอ 1", "อำเภอ 2", "อำเภอ 3"],
    values: [120, 90, 150],
  };

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template.json";
    link.click();
  };

  const parseUploadedFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setUploadedData(json);
      } catch (e) {
        alert("JSON ไม่ถูกต้อง");
      }
    };
    reader.readAsText(file);
  };

  const chartData = uploadedData
    ? {
        labels: uploadedData.labels,
        datasets: [
          {
            label: "Coverage",
            data: uploadedData.values,
            backgroundColor: "rgba(16, 185, 129, 0.6)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
          },
        ],
      }
    : null;

  const ChartDisplay = () => {
    if (!chartType || !chartData) return null;
    if (chartType === "bar") return <Bar data={chartData} />;
    if (chartType === "line") return <Line data={chartData} />;
    if (chartType === "pie") return <Pie data={chartData} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 p-8 flex flex-col">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-emerald-800 mb-2">Dashboard ระบบสุขภาพ</h1>
        <p className="text-emerald-600 text-lg">วิเคราะห์ข้อมูลสุขภาพด้วยกราฟที่หลากหลาย</p>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full">
        {/* Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card: Chart Selection */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-emerald-100 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-2xl">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-800">เลือกประเภท Chart</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setChartType("bar")}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 ${
                  chartType === "bar"
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg scale-105"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <BarChart2 className="w-6 h-6" />
                <span className="text-sm font-semibold">Bar</span>
              </button>

              <button
                onClick={() => setChartType("line")}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 ${
                  chartType === "line"
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg scale-105"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <LineChart className="w-6 h-6" />
                <span className="text-sm font-semibold">Line</span>
              </button>

              <button
                onClick={() => setChartType("pie")}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 ${
                  chartType === "pie"
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg scale-105"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <PieChart className="w-6 h-6" />
                <span className="text-sm font-semibold">Pie</span>
              </button>
            </div>
          </div>

          {/* Card: Download Template */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-emerald-100 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-2xl">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-800">ดาวน์โหลด</h2>
            </div>

            <button
              onClick={downloadTemplate}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              ดาวน์โหลด Template JSON
            </button>
            
            <p className="text-sm text-emerald-600 mt-4">
              ไฟล์ตัวอย่างสำหรับนำเข้าข้อมูล
            </p>
          </div>

          {/* Card: Upload Data */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-emerald-100 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-2xl">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-800">อัปโหลด</h2>
            </div>

            <label className="w-full px-6 py-4 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all duration-300">
              <input
                type="file"
                accept="application/json"
                onChange={(e) => parseUploadedFile(e.target.files[0])}
                className="hidden"
              />
              <span className="text-emerald-700 font-semibold">เลือกไฟล์ JSON</span>
            </label>

            <p className="text-sm text-emerald-600 mt-4">
              โครงสร้าง: labels[], values[]
            </p>
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-emerald-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-2xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-800">ผลลัพธ์การวิเคราะห์</h2>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
            {chartType && uploadedData ? (
              <div className="w-full max-w-4xl">
                <ChartDisplay />
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white p-8 rounded-3xl shadow-lg inline-block">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-emerald-600 font-semibold text-lg">
                    กรุณาเลือก Chart และอัปโหลดข้อมูล
                  </p>
                  <p className="text-emerald-500 text-sm mt-2">
                    เพื่อเริ่มวิเคราะห์ข้อมูลสุขภาพของคุณ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
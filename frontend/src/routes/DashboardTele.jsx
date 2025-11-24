import React from 'react';
import { MapPin } from 'lucide-react';
import Map from '../components/Map.jsx';

// ปรับโทนสีฟ้าให้สว่างขึ้น แต่ยังเป็น gradient ที่มีน้ำเงินอยู่และไม่ลอยเกินไป
// logic เดิมไม่ถูกแตะต้อง

const DashBoard_Tele = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6FB7FF] via-[#4A90E2] to-[#1E3A8A] p-8"> {/* ฟ้าอ่อน → ฟ้ากลาง → น้ำเงิน */}
      <div className="max-w-7xl mx-auto">
        {/* Main Map Card */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/25 shadow-2xl">
          {/* Map Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-300/30 p-3 rounded-xl backdrop-blur-sm"> {/* สีฟ้าอ่อนขึ้น */}
                <MapPin className="w-6 h-6 text-blue-100" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">Geographic View</h2>
                <p className="text-blue-100 text-sm">Interactive map visualization</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div> {/* Active → ฟ้าสว่าง */}
                <span className="text-white text-sm">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-300 rounded-full"></div> {/* Moderate → ฟ้าอมเขียวอ่อน */}
                <span className="text-white text-sm">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-300 rounded-full"></div> {/* Low → sky ฟ้ากลาง */}
                <span className="text-white text-sm">Low</span>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 h-[700px]">
            <Map />
          </div>

          {/* Map Footer Info */}
          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-blue-300/30 hover:bg-blue-300/40 backdrop-blur-sm text-white rounded-xl border border-blue-200/40 transition-all duration-300 hover:scale-105">
                Refresh Data
              </button>
              <button className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl border border-white/30 transition-all duration-300 hover:scale-105">
                Export
              </button>
            </div>
            <p className="text-blue-100 text-sm">Last updated: Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard_Tele;
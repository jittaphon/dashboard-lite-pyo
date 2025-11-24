import React from 'react';
import { MapPin } from 'lucide-react';
import Map from '../components/Map.jsx';

// ปรับโทนสีฟ้าให้สว่างขึ้น แต่ยังเป็น gradient ที่มีน้ำเงินอยู่และไม่ลอยเกินไป
// logic เดิมไม่ถูกแตะต้อง

const DashBoard_Tele = () => {
  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-[#6FB7FF] via-[#4A90E2] to-[#1E3A8A] overflow-hidden">
      
      {/* Top Header Bar - Floating */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/25 shadow-xl">
          <div className="bg-blue-300/30 p-2 rounded-xl backdrop-blur-sm">
            <MapPin className="w-5 h-5 text-blue-100" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-sm">นัดหมายออนไลน์ในโรงพยาบาล 4 คลินิก บนหมอพร้อม Station</h2>
            <p className="text-blue-100 text-xs">จังหวัดพะเยา</p>
          </div>
        </div>

        {/* Legend - Floating */}
        <div className="flex gap-3 bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/25 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span className="text-white text-sm font-medium">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-300 rounded-full"></div>
            <span className="text-white text-sm font-medium">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-sky-300 rounded-full"></div>
            <span className="text-white text-sm font-medium">Low</span>
          </div>
        </div>
      </div>

      {/* Map - Full Screen */}
      <div className="absolute inset-0 pt-28 pb-20 px-6">
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/25">
          <Map />
        </div>
      </div>

      {/* Bottom Footer - Floating */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/25 shadow-xl">
          <p className="text-blue-100 text-sm">Last updated: ข้อมูล ณ วันที่ 24 พฤศจิกายน 2568</p>
        </div>
      </div>

    </div>
  );
};

export default DashBoard_Tele;
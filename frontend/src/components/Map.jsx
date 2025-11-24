import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import React from "react";
import L from "leaflet";
import axios from "axios";
// FitBounds: ซูมให้ครอบจังหวัดพะเยา
function FitBounds({ geoData }) {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      const layer = L.geoJSON(geoData);
      map.fitBounds(layer.getBounds());
    }
  }, [geoData, map]);
  return null;
}

// Legend: แสดงคำอธิบายสี
function Legend() {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend bg-white p-3 rounded-lg shadow-lg text-sm");
      div.innerHTML = `
        <div class="font-bold mb-1">คำอธิบาย</div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-4 h-4 inline-block rounded bg-red-500"></span> พื้นที่เสี่ยงฝนตกหนักมาก
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-4 h-4 inline-block rounded bg-yellow-400"></span> พื้นที่เสี่ยงฝนตกหนัก
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 inline-block rounded bg-green-500"></span> ปลอดภัย
        </div>
      `;
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map]);
  return null;
}

export default function PhayaoMap() {
  const amphoes = ["ดอกคำใต้","จุน","เชียงคำ","ปง","ภูซาง","แม่ใจ","ภูกามยาว","เชียงม่วน"];
  const [geoData, setGeoData] = useState(null);
  const [nowTime, setNowTime] = useState(new Date());
  // อัพเดทเวลา real-time ทุก 1 นาที
  useEffect(() => {
    const interval = setInterval(() => setNowTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

 const formatDateTime = (date) => {
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};
    
function getTmdStarttime() {
  const now = new Date();

  // ปัดขึ้นเป็นชั่วโมงถัดไป
  let slot = now.getHours() + 1;

  // ถ้าเลย 23 → ข้ามไปวันถัดไป 00:00
  if (slot === 24) {
    slot = 0;
    now.setDate(now.getDate() + 1);
  }

  now.setHours(slot, 0, 0, 0);

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}


  useEffect(() => {
    fetch("/datahub/dash_data/public/districts.geojson")
      .then(res => res.json())
      .then(data => {
        const phayao = {
          ...data,
          features: data.features.filter(f => f.properties.pro_th === "พะเยา"),
        };
        setGeoData(phayao);
      });
  }, []);




  return (
    <div className="w-full max-w-5xl mx-auto mt-2 p-4">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">


</div>


      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <MapContainer
          center={[19.169, 99.905]}
          zoom={10}
          style={{ height: "420px", width: "100%" }}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          touchZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
         
        </MapContainer>
      </div>
      
      
    </div>
  );
}

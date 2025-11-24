import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import React from "react";
import L from "leaflet";

// ----------------------------------
//  Mock Data
// ----------------------------------
const mockData = {
  "เมืองพะเยา": 60,
  "เชียงคำ": 80,
  "จุน": 60,
  "เชียงม่วน": 80,
  "ภูกามยาว": 80,
  "ภูซาง": 80,
  "ปง": 45,
  "แม่ใจ": 45,
  "ดอกคำใต้": 45
};

function getColor(ampName) {
  const val = mockData[ampName] ?? 100;
  if (val > 75) return "#22c55e"; // เขียว
  if (val >= 50) return "#eab308"; // เหลือง
  return "#ef4444"; // แดง
}

// ----------------------------------
// Fit Bounds
// ----------------------------------
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

// ----------------------------------
// Custom Tooltip
// ----------------------------------
function customTooltipContent(amp, val, color) {
  return `
    <div style="
      background: white;
      padding: 8px 12px;
      border-radius: 14px;
      box-shadow: 0 6px 14px rgba(0,0,0,0.18);
      border-left: 6px solid ${color};
      font-size: 14px;
      transition: all .25s ease;
    ">
      <div style="font-weight: 600; margin-bottom: 4px;">${amp}</div>
      <div style="opacity: 0.8;">ค่าประเมิน: <strong>${val}%</strong></div>
    </div>
  `;
}

// ----------------------------------
// Legend (Tailwind + Beautiful)
// ----------------------------------
function TailwindLegend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
      <div class="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-200 text-sm space-y-3 animate-fadeIn">

        <div class="text-xs text-gray-500 leading-snug">
          <strong class="text-gray-700">คำอธิบาย:</strong><br/>
          โรงพยาบาลในจังหวัดเปิดนัดหมายออนไลน์พร้อมกัน
          <span class="font-semibold text-gray-700">4 คลินิกขึ้นไป</span>
        </div>

        <div class="font-semibold text-gray-700 pt-1 border-t border-gray-200">
          ระดับผลลัพธ์
        </div>

        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded bg-[#22c55e]"></span>
          > 75% (เปิดบริการแล้ว 4 คลินิก)
        </div>

        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded bg-[#eab308]"></span>
          50–75% (เปิดบริการแล้วแต่ไม่ครบ 4 คลินิก)
        </div>

        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded bg-[#ef4444]"></span>
          < 50% (ยังไม่ได้ดำเนินการ)
        </div>
      </div>
      `;
      return div;
    };

    legend.addTo(map);

    return () => map.removeControl(legend);
  }, [map]);

  return null;
}

// ----------------------------------
// Main
// ----------------------------------
export default function PhayaoMap() {
  const [geoData, setGeoData] = useState(null);

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

  // ----------------------------------
  // Hover Effect
  // ----------------------------------
  const highlightStyle = {
    weight: 2,
    color: "#ffffff",
    fillOpacity: 0.95,
    className: "transition-all duration-300"
  };

  const resetStyle = layer => {
    layer.setStyle({
      fillColor: getColor(layer.feature.properties.amp_th),
      fillOpacity: 0.75,
      color: "#ffffff",
      weight: 1,
    });
  };

  // ----------------------------------
  // Run for each polygon
  // ----------------------------------
  const onEachFeature = (feature, layer) => {
    const amp = feature.properties.amp_th;
    const val = mockData[amp];
    const color = getColor(amp);

    layer.setStyle({
      fillColor: color,
      fillOpacity: 0.75,
      color: "#ffffff",
      weight: 1,
    });

    // Hover effect
    layer.on({
      mouseover: e => {
        e.target.setStyle(highlightStyle);
      },
      mouseout: e => {
        resetStyle(e.target);
      },
    });

    // Custom Tooltip
    layer.bindTooltip(customTooltipContent(amp, val, color), {
      sticky: true,
      direction: "top",
      opacity: 1,
      className: "leaflet-tooltip-custom"
    });
  };

  return (
  
      <MapContainer
        center={[19.169, 99.905]}
        zoom={10}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
      >
        {/* Beautiful White Tile */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        />

        {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}
        {geoData && <FitBounds geoData={geoData} />}

        <TailwindLegend />
      </MapContainer>

  );
}

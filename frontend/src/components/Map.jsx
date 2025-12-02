import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// ----------------------------------
//  Mock Data
// ----------------------------------



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

        {geoData && <GeoJSON data={geoData}  />}
        {geoData && <FitBounds geoData={geoData} />}

 
      </MapContainer>

  );
}

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function Heatmap() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    // include all relevant collections (old + new)
    const collections = [
      "posts",
      "stray_animal_posts",
      "lost_pet_posts",
      "unknown_status",
    ];
    const unsubscribeFns = [];

    collections.forEach((colName) => {
      const colRef = collection(db, colName);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const newPoints = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // handles both new and legacy Firestore location structures
            if (data.location?.lat && data.location?.lng) {
              newPoints.push([data.location.lat, data.location.lng]);
            } else if (data.lat && data.lng) {
              newPoints.push([data.lat, data.lng]);
            }
          });

          setPoints((prevPoints) => {
            const combined = [...prevPoints, ...newPoints];
            const unique = Array.from(new Set(combined.map(JSON.stringify)), JSON.parse);
            return unique;
          });
        },
        (error) => {
          console.error(`Error listening to ${colName}:`, error);
        }
      );
      unsubscribeFns.push(unsubscribe);
    });

    return () => {
      unsubscribeFns.forEach((unsub) => unsub());
    };
  }, []);

  function HeatmapLayer({ points }) {
    const map = useMap();

    useEffect(() => {
      if (points.length === 0) return;

      const heat = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      }).addTo(map);

      return () => heat.remove();
    }, [map, points]);

    return null;
  }

  return (
    <div className="max-w-[1000px] mx-auto h-auto space-y-4 bg-[#fafafa]">
      <div className="border border-gray-300 flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm overflow-hidden">
        <main className="w-screen space-y-2 p-2">
          <h1 className="text-lg font-semibold">Heatmap</h1>
          {/* Leaflet Heatmap */}
          <div className="h-[500px] w-full border rounded-md overflow-hidden">
            <MapContainer
              center={[14.629508172604881, 121.04187250878618]} // CIIT coordinates
              zoom={15}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <HeatmapLayer points={points} />
            </MapContainer>
          </div>
        </main>
      </div>
    </div>
  );
}

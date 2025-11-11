import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { OrbitProgress } from "react-loading-indicators";

export default function Heatmap() {
  const [points, setPoints] = useState([]);
  const [topAreas, setTopAreas] = useState([]);
  const [areaNames, setAreaNames] = useState([]);
  const [isLoading,setIsLoading] = useState(true);

  useEffect(() => {
    const collections = ["posts"];
    const unsubscribeFns = [];

    collections.forEach((colName) => {
      const colRef = collection(db, colName);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const newPoints = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.location?.lat && data.location?.lng) {
              newPoints.push([data.location.lat, data.location.lng]);
            } else if (data.lat && data.lng) {
              newPoints.push([data.lat, data.lng]);
            }
          });

          setPoints((prevPoints) => {
            const combined = [...prevPoints, ...newPoints];
            const unique = Array.from(
              new Set(combined.map(JSON.stringify)),
              JSON.parse
            );
            return unique;
          });
        },
        (error) => {
          console.error(`Error listening to ${colName}:`, error);
        }
      );
      unsubscribeFns.push(unsubscribe);
    });

    return () => unsubscribeFns.forEach((unsub) => unsub());
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

  function summarizeTopAreas(points) {
    const counts = {};

    points.forEach(([lat, lng]) => {
      const roundedLat = lat.toFixed(2); 
      const roundedLng = lng.toFixed(2);
      const key = `${roundedLat},${roundedLng}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([coords, count]) => {
        const [lat, lng] = coords.split(",").map(Number);
        return { lat, lng, count };
      });

    return sorted;
  }

useEffect(() => {
  if (topAreas.length > 0) {
    fetchAreaNames(topAreas).then((results) => {
      const merged = results.reduce((acc, area) => {
        const existing = acc.find((a) => a.name === area.name);
        if (existing) {
          existing.count += area.count;
        } else {
          acc.push({ ...area });
        }
        return acc;
      }, []);

      const sorted = merged.sort((a, b) => b.count - a.count).slice(0, 5);
      setAreaNames(sorted);

      setIsLoading(false);
    });
  } else if (points.length > 0 && topAreas.length === 0) {
    setIsLoading(false);
  }
}, [topAreas]);


useEffect(() => {
  if (points.length > 0) {
    setTopAreas(summarizeTopAreas(points));
  }
}, [points]);


  async function fetchAreaNames(topAreas) {
    const results = await Promise.all(
      topAreas.map(async (area) => {
         const functionBaseUrl = window.location.hostname === "localhost"
    ? "http://127.0.0.1:5001/furs-project-7a0a3/us-central1/api" // Local emulator
    : "https://us-central1-furs-project-7a0a3.cloudfunctions.net/api"; 
    
        try {
          const res = await fetch(
            `${functionBaseUrl}/reverse?lat=${area.lat}&lon=${area.lng}&format=json&accept-language=en`
          );
          const json = await res.json();
          const addr = json.address || {};


          const name =
            addr.suburb ||
            addr.village ||
            addr.neighbourhood ||
            addr.city_district ||
            addr.city ||
            addr.state ||
            "Unknown area";

          return { ...area, name };
        } catch {
          return { ...area, name: "Unknown area" };
        }
      })
    );
    return results;
  }


  return (
    <div className="max-w-[1000px] mx-auto h-auto space-y-4 bg-[#fafafa] rounded-lg shadow-sm p-5 border border-gray-200">
      <div className=" flex flex-wrap sm:flex-nowrap items-center gap-3 overflow-hidden">
        <main className="w-screen space-y-2 p-2">
          <h1 className="text-xl text-green-700  font-bold">Heatmap</h1>
          <p className="text-gray-700 text-sm">
            This heatmap highlights areas with a high concentration of stray
            animal sightings, grouped approximately by barangay or district.
          </p>
          
          {/* ✅ START LOADING CHECK */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[500px] w-full border border-gray-300 rounded-md">
              <OrbitProgress color="#2e7d32" size="large" />
              <p className="mt-4 text-gray-600">Loading map data and calculating top areas...</p>
            </div>
          ) : (
            <>
              {/* Heatmap */}
              <div className="h-[500px] w-full border border-gray-300 rounded-md overflow-hidden">
                <MapContainer
                  center={[14.6295, 121.0419]}
                  zoom={15}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%"}}
                >
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <HeatmapLayer points={points} />
                </MapContainer>
              </div>

              {/* Top 5 Areas Section (Only show if NOT loading) */}
              <div className="flex justify-center">
                <div className="text-center">
                  <h2 className="font-semibold text-lg text-green-700 mb-2">Top 5 Areas</h2>
                  {areaNames.length > 0 ? (
                    <ul className="text-sm text-gray-700 list-none space-y-2">
                      {areaNames.map((area, index) => (
                        <li key={index}>
                          <span className="font-medium">
                            #{index + 1}: {area.name}
                          </span>
                          <br />
                          <span className="text-gray-500 text-xs">
                            ({area.count} reports)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Not enough data yet.</p>
                  )}
                </div>
              </div>
            </>
          )} 
          {/* ✅ END LOADING CHECK */}

        </main>
      </div>
    </div>
  );
}
  

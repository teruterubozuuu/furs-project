import React from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

export default function Heatmap() {
  //Dummy coordinates for testing
  const points = [
    [14.629300236602989, 121.04090773929181], //somewhere near kamuning ciit
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.629300236602989, 121.04090773929181],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
    [14.5995, 120.9842],
  ];

  function HeatmapLayer({ points }) {
    const map = useMap();

    React.useEffect(() => {
      const heat = L.heatLayer(points, { radius: 25 }).addTo(map);
      return () => {
        heat.remove();
      };
    }, [map, points]);

    return null;
  }

  return (
    <div className="max-w-[1000px] mx-auto h-auto space-y-4  bg-[#fafafa]">
      <div className="border border-gray-300 flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm overflow-hidden">
        <main className="w-screen space-y-2 p-2">
          <h1>Heatmap</h1>
          {/*Insert leaflet heatmap*/}
          <div className="h-[500px] w-full">
            <MapContainer
              center={[14.5995, 120.9842]} // Manila coordinates
              zoom={13}
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

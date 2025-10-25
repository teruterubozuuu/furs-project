import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15, { animate: true });
  }, [position]);
  return null;
}

function LocationMarker({ setPosition, canPin, setCanPin }) {
  useMapEvents({
    click(e) {
      if (canPin) {
        setPosition(e.latlng);
        setCanPin(false);
      }
    },
  });
  return null;
}

export default function SelectLocation({ onClose, onSelect }) {
  const [position, setPosition] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [canPin, setCanPin] = useState(false);
  const [loadingType, setLoadingType] = useState(""); 
  const [loadingMsg, setLoadingMsg] = useState("");

  const showToast = (msg) => alert(msg); 

  // handles current location
  const handleCurrent = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported by your browser.");
      return;
    }

    setCanPin(false);
    setLoadingType("current");
    setLoadingMsg("Locating your current location…");

    let hasShownToast = false;

    const delayMsg = setTimeout(() => {
      setLoadingMsg("Still locating… please wait a few seconds…");
    }, 5000);

    const timeout = setTimeout(() => {
      if (!hasShownToast) {
        showToast("Unable to retrieve your location.");
        hasShownToast = true;
      }
      setLoadingType("");
      setLoadingMsg("");
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(delayMsg);
        clearTimeout(timeout);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setLoadingType("");
        setLoadingMsg("");
      },
      (err) => {
        clearTimeout(delayMsg);
        clearTimeout(timeout);
        if (!hasShownToast) {
          showToast("Unable to retrieve your location.");
          hasShownToast = true;
        }
        console.error(err);
        setLoadingType("");
        setLoadingMsg("");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // handles manual search
  const handleSearch = async () => {
    if (!manualInput.trim()) return;

    setCanPin(false);
    setLoadingType("search");
    setLoadingMsg("Searching for location…");

    let hasShownToast = false;

    const delayMsg = setTimeout(() => {
      setLoadingMsg("Still searching… please wait a few seconds…");
    }, 5000);

    const timeout = setTimeout(() => {
      if (!hasShownToast) {
        showToast("Search timed out. Please try again.");
        hasShownToast = true;
      }
      setLoadingType("");
      setLoadingMsg("");
    }, 10000);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${manualInput}`
      );
      const data = await response.json();

      clearTimeout(delayMsg);
      clearTimeout(timeout);

      if (data.length > 0) {
        const found = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        setPosition(found);
      } else {
        if (!hasShownToast) {
          showToast("No results found for that location.");
          hasShownToast = true;
        }
      }
    } catch (err) {
      console.error(err);
      if (!hasShownToast) {
        showToast("Error fetching location data.");
        hasShownToast = true;
      }
    } finally {
      clearTimeout(delayMsg);
      clearTimeout(timeout);
      setLoadingType("");
      setLoadingMsg("");
    }
  };

  // enables pinning mode 
  const enablePinMode = () => {
    setCanPin(true);
  };

  const isLoading = loadingType !== "";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[999]">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-lg p-5 relative animate-fadeIn">
        {/* header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg text-green-700 flex items-center gap-2">
            <i className="bi bi-geo-alt-fill text-[#fbc02d]"></i>
            Select Location
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition cursor-pointer text-lg"
          >
            ×
          </button>
        </div>

        {/* buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={handleCurrent}
            disabled={isLoading}
            className={`${
              loadingType === "current" ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            } text-white px-3 py-2 rounded-lg transition flex items-center gap-1`}
          >
            <i className="bi bi-crosshair"></i>
            {loadingType === "current" ? "Locating current location…" : "Use Current"}
          </button>

          <button
            onClick={enablePinMode}
            disabled={isLoading}
            className={`${
              canPin ? "bg-yellow-600" : "bg-yellow-500 hover:bg-yellow-600"
            } text-white px-3 py-2 rounded-lg transition flex items-center gap-1`}
          >
            <i className="bi bi-geo"></i>
            {canPin ? "Pinning Active" : "Pin on Map"}
          </button>
        </div>

        {/* manual search */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type location (e.g., Kamuning Road)"
            className="border flex-1 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-green-200 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`${
              loadingType === "search" ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-3 py-2 rounded-lg transition text-sm flex items-center gap-1`}
          >
            <i className="bi bi-search"></i>
            {loadingType === "search" ? "Searching…" : "Search"}
          </button>
        </div>

        {/* map */}
        <div className="h-60 mb-4 rounded-lg overflow-hidden border border-gray-200 relative">
          {(loadingType === "current" || loadingType === "search") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-[1000] text-gray-600 text-sm">
              <div className="loader border-2 border-t-green-600 rounded-full w-6 h-6 animate-spin mb-2"></div>
              {loadingMsg}
            </div>
          )}
          <MapContainer
            center={position || [14.5995, 120.9842]}
            zoom={13}
            className="h-full w-full rounded-lg"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {position && <Marker position={position} icon={markerIcon} />}
            <RecenterMap position={position} />
            <LocationMarker setPosition={setPosition} canPin={canPin} setCanPin={setCanPin} />
          </MapContainer>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!position) {
                showToast("Please select a location first.");
                return;
              }
              onSelect(position);
            }}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

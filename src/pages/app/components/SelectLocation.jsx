import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import Fuse from "fuse.js";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16, { animate: true });
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [landmark, setLandmark] = useState("");

  const abortControllerRef = useRef(null);
  const debounceRef = useRef(null);
  const toastShownRef = useRef({ current: false, search: false });

  const showToast = (msg, type = "current") => {
    if (!toastShownRef.current[type]) {
      alert(msg);
      toastShownRef.current[type] = true;
      setTimeout(() => {
        toastShownRef.current[type] = false;
      }, 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("input") && !event.target.closest("ul")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // automatically gets the user's location when the map opens
  useEffect(() => {
    if (!position) {
      handleCurrent();
    }
  }, []);

  // handles the current location
  const handleCurrent = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.");
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
        showToast("Unable to retrieve your location.", "current");
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
        showToast("Current location detected!", "current");
      },
      (err) => {
        clearTimeout(delayMsg);
        clearTimeout(timeout);

        let message = "";
        if (err.code === err.PERMISSION_DENIED) {
          message =
            "Location permission denied. Please enable location access in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message =
            "Location information is unavailable. Please check your internet or GPS.";
        } else if (err.code === err.TIMEOUT) {
          message = "Request timed out. Please try again.";
        } else {
          message = "An unknown error occurred while retrieving your location.";
        }

        if (!hasShownToast) {
          showToast(message, "current");
          hasShownToast = true;
        }

        console.error(err);
        setLoadingType("");
        setLoadingMsg("");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // fetches location suggestions as the user types (with fuzzy matching)
  const fetchSuggestions = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=10`,
          { signal: controller.signal }
        );
        const data = await response.json();

        // appplied fuzzy matching
        const fuse = new Fuse(data, {
          keys: ["display_name"],
          threshold: 0.4, // 0 = exact match, 1 = match anything
        });

        const results = fuse.search(query);
        const finalResults =
          results.length > 0 ? results.map((r) => r.item) : data;

        setSuggestions(finalResults.slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching suggestions:", err);
        }
      }
    }, 400); // waitss for 400ms after typing stops
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
        showToast("Search timed out. Please try again.", "search");
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
        showToast("Location pinned from search!", "search");
      } else {
        if (!hasShownToast) {
          showToast("No results found for that location.", "search");
          hasShownToast = true;
        }
      }
    } catch (err) {
      console.error(err);
      if (!hasShownToast) {
        showToast("Error fetching location data.", "search");
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
      <div className="bg-white rounded-2xl shadow-lg max-w-lg p-5 relative animate-fadeIn m-3">
        {/* header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-semibold text-lg text-green-700 flex items-center gap-2">
              <i className="bi bi-geo-alt-fill text-[#fbc02d]"></i>
              Select Location
            </h2>
            <p className="text-gray-500 text-xs italic">
              Specify the location where the stray animal was spotted. For lost
              pets, indicate where the animal was last seen.
            </p>
          </div>

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
              loadingType === "current"
                ? "bg-green-400"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-3 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer`}
          >
            <i className="bi bi-crosshair"></i>
            {loadingType === "current"
              ? "Locating current location…"
              : "Use Current"}
          </button>

          <button
            onClick={enablePinMode}
            disabled={isLoading}
            className={`${
              canPin ? "bg-yellow-600" : "bg-yellow-500 hover:bg-yellow-600"
            } text-white px-3 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer`}
          >
            <i className="bi bi-geo"></i>
            {canPin ? "Pinning Active" : "Pin on Map"}
          </button>
        </div>

        {/* manual search */}
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => {
              const val = e.target.value;
              setManualInput(val);
              fetchSuggestions(val);
            }}
            placeholder="Type location (e.g., Kamuning Road)"
            className="border flex-1 rounded-lg px-3 py-2 focus:outline-none text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`${
              loadingType === "search"
                ? "bg-blue-400"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-3 py-2 rounded-lg transition text-sm flex items-center gap-1 cursor-pointer`}
          >
            <i className="bi bi-search"></i>
            {loadingType === "search" ? "Searching…" : "Search"}
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto mb-3">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => {
                  const coords = {
                    lat: parseFloat(s.lat),
                    lng: parseFloat(s.lon),
                  };
                  setPosition(coords);
                  setManualInput(s.display_name);
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="px-3 py-2 text-sm hover:bg-green-100 cursor-pointer transition"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}

        {/* map */}
        <div className="h-60 rounded-lg overflow-hidden border border-gray-200 relative">
          {(loadingType === "current" || loadingType === "search") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-[1000] text-gray-600 text-sm">
              <div className="loader border-2 border-t-green-600 rounded-full w-6 h-6 animate-spin mb-2"></div>
              {loadingMsg}
            </div>
          )}
          <MapContainer
            center={position || [14.629508, 121.041873]}
            zoom={16}
            className="h-full w-full rounded-lg"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {position && <Marker position={position} icon={markerIcon} />}
            <RecenterMap position={position} />
            <LocationMarker
              setPosition={setPosition}
              canPin={canPin}
              setCanPin={setCanPin}
            />
          </MapContainer>
        </div>

        {/* Add Landmark */}
        <div className="my-4">
          <p className="text-sm text-gray-500 mb-2 italic font-medium">
            Add a nearby landmark to help others easily recognize the location.
          </p>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g., Near City Hall or beside the gas station"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-600 w-full text-sm"
          />
        </div>

        {/* footer */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!position) {
                showToast("Please select a location first.", "confirm");
                return;
              }
              onSelect({ ...position, landmark });
            }}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition text-sm cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

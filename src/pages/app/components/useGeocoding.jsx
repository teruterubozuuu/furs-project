// hooks/useGeocoding.js
import { useState, useEffect } from "react";

const addressCache = new Map();


const functionBaseUrl =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5001/furs-project-7a0a3/us-central1/api" // Local emulator
    : "https://us-central1-furs-project-7a0a3.cloudfunctions.net/api"; // Production

export default function useGeocoding(location) {
  const [address, setAddress] = useState(
    location?.lat && location?.lng ? "Loading address..." : "Location not available"
  );
  const key = `${location?.lat}:${location?.lng}`;

  useEffect(() => {
    // 1. Check for location data
    if (!location?.lat || !location?.lng) {
      setAddress("Location not available");
      return;
    }

    // 2. Check the cache
    if (addressCache.has(key)) {
      setAddress(addressCache.get(key));
      return;
    }

    // 3. Fetch the address (only if not in cache)
    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `${functionBaseUrl}/reverse?lat=${location.lat}&lon=${location.lng}`
        );

        if (!res.ok) throw new Error(`HTTP status: ${res.status}`);

        const json = await res.json();
        const newAddress = json.display_name || "Address not found";

        // Update cache and state
        addressCache.set(key, newAddress);
        setAddress(newAddress);
      } catch (error) {
        console.error("Geocoding error:", error);
        setAddress("Address error");
      }
    };

    fetchAddress();

  }, [location?.lat, location?.lng, key]); // Depend on lat/lng

  return address;
}
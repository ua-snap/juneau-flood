import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "./SearchDesktop.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

// Juneau bounding box (~20mi radius)
const bbox = "-135.147043,58.097567,-134.027043,58.677567";
const proximity = "-134.587043,58.387567";

const Search = ({ mapRef }) => {
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  const searchMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);

  /* Detect mobile / desktop */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Fetch autocomplete suggestions */
  const fetchSuggestions = async (query) => {
    if (!query) return setSuggestions([]);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?autocomplete=true&bbox=${bbox}&proximity=${proximity}&access_token=${mapboxgl.accessToken}`,
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  /* Handle suggestion click */
  const handleSuggestionSelect = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;

    if (searchMarkerRef.current) searchMarkerRef.current.remove();
    searchMarkerRef.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    setAddress(feature.place_name);
    setSuggestions([]);
  };

  /* Manual search */
  const searchAddress = async () => {
    if (!address.trim()) return;
    setIsSearching(true);
    try {
      setErrorMessage("");
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address,
        )}.json?bbox=${bbox}&proximity=${proximity}&access_token=${mapboxgl.accessToken}`,
      );
      const data = await response.json();

      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        if (searchMarkerRef.current) searchMarkerRef.current.remove();

        searchMarkerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5 });
      } else {
        setErrorMessage("No results found.");
      }
    } catch {
      setErrorMessage("Search failed. Try again.");
    } finally {
      setIsSearching(false);
    }
  };

  /* Locate user */
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;

        if (userMarkerRef.current) userMarkerRef.current.remove();
        userMarkerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);

        mapRef.current.flyTo({ center: [longitude, latitude], zoom: 17.5 });
      },
      () => alert("Unable to retrieve your location"),
    );
  };

  const containerClass = `search-bar-container`;

  return (
    <div className={containerClass}>
      <input
        className="search-bar"
        type="text"
        placeholder="Search address..."
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          fetchSuggestions(e.target.value);
        }}
      />
      {suggestions.length > 0 && (
        <ul className="dropdown-suggestions">
          {suggestions.map((feature) => (
            <li
              key={feature.id}
              onClick={() => handleSuggestionSelect(feature)}
            >
              {feature.place_name}
            </li>
          ))}
        </ul>
      )}
      <button className="search-button">Search</button>
      <button className="locate-button" onClick={handleLocate}>
        📍
      </button>
    </div>
  );
};

export default Search;

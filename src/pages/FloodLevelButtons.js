import React, { useState } from "react";
import "./FloodLevelButtons.css";

const customColors = [
  "#c3b91e", // Yellow-Green
  "#e68a1e", // Orange
  "#f4a700", // Bright Orange
  "#23b7c8", // Cyan
  "#0056d6", // Blue
  "#d63b3b", // Red
  "#9b3dbd", // Purple
  "#d94a8c", // Pink
  "#3cb043", // Green
  "#2abf72", // Light Green
];

const floodLevels = Array.from({ length: 10 }, (_, i) => {
  const floodLevel = 9 + i; // Start at 9 ft
  const geojsonLevel = 65 + i; // Corresponding geojson level
  return {
    id: `flood${geojsonLevel}`,
    name: `${floodLevel} ft`,
    geojson: `/geojson2/${geojsonLevel}.geojson`,
    color: customColors[i % customColors.length], // Apply colors in the specified order
  };
});

const FloodLevelButtons = ({ mapRef }) => {
  const [selectedFlood, setSelectedFlood] = useState(null);

  const toggleFloodLevel = (floodId) => {
    if (selectedFlood === floodId) {
      setSelectedFlood(null);
      if (mapRef.current) {
        mapRef.current.setLayoutProperty(
          `${floodId}-fill`,
          "visibility",
          "none",
        );
      }
    } else {
      if (selectedFlood && mapRef.current) {
        mapRef.current.setLayoutProperty(
          `${selectedFlood}-fill`,
          "visibility",
          "none",
        );
      }

      setSelectedFlood(floodId);
      if (mapRef.current) {
        mapRef.current.setLayoutProperty(
          `${floodId}-fill`,
          "visibility",
          "visible",
        );
      }
    }
  };

  return (
    <div className="flood-buttons-container">
      {floodLevels.map((flood) => (
        <button
          key={flood.id}
          onClick={() => toggleFloodLevel(flood.id)}
          className={`flood-button ${selectedFlood === flood.id ? "selected" : ""}`}
          style={{
            background: selectedFlood === flood.id ? flood.color : "#007bffbe",
            color: selectedFlood === flood.id ? "white" : "#fff",
          }}
        >
          {flood.name}
        </button>
      ))}
    </div>
  );
};

export default FloodLevelButtons;

// FloodStepper.js — Updated for Mapbox vector tiles (no .setData)
import React, { useState, useEffect, useCallback } from "react";
import "./FloodStepper.css";

const customColors = [
  "#87c210",
  "#c3b91e",
  "#e68a1e",
  "#31a354",
  "#3182bd",
  "#124187",
  "#d63b3b",
  "#9b3dbd",
  "#d13c8f",
  "#c2185b",
  "#756bb1",
  "#f59380",
  "#ba4976",
];

const FloodStepper = ({
  mapRef,
  selectedFloodLevel,
  setSelectedFloodLevel,
  isMenuHidden,
  hideOnDesktop = false,
  hescoMode = false,
  onFloodLayerChange = () => {},
}) => {
  const floodLevel = selectedFloodLevel;
  const [isLayerVisible, setIsLayerVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Add the "All" level before 8 ft
  const levels = ["All", ...Array.from({ length: 13 }, (_, i) => i + 8)]; // ["All", 8..20]

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update visible flood layer on map
  const updateFloodLayer = useCallback(
    (level) => {
      if (!mapRef.current) return;
      const map = mapRef.current;

      // Hide all flood layers first
      const layers = map.getStyle().layers || [];
      layers.forEach((layer) => {
        if (
          layer.id.includes("flood") &&
          (layer.id.endsWith("-fill") || layer.id.endsWith("-outline"))
        ) {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      });

      if (level === "All") {
        layers.forEach((layer) => {
          if (layer.id.includes("flood") && layer.id.endsWith("-fill")) {
            map.setLayoutProperty(layer.id, "visibility", "visible");
            map.setPaintProperty(layer.id, "fill-opacity", 0.25); // lower opacity for stacking
          }
        });
        return;
      }

      // Otherwise show only the selected fill layer
      const layerId = `flood${64 + (level - 8)}-fill`;
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", "visible");
      } else {
        console.warn(`Layer ${layerId} not found`);
      }

      onFloodLayerChange();
    },
    [mapRef, onFloodLayerChange],
  );

  useEffect(() => {
    if (selectedFloodLevel) updateFloodLayer(selectedFloodLevel);
  }, [selectedFloodLevel, hescoMode, updateFloodLayer]);

  // Handle stepper up/down buttons
  const changeFloodLevel = (direction) => {
    const currentIndex = levels.indexOf(selectedFloodLevel);
    const newIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < levels.length) {
      setSelectedFloodLevel(levels[newIndex]);
    }
  };

  // Toggle layer visibility
  const toggleFloodVisibility = () => {
    if (floodLevel === "All") return; // Disable toggle in "All" mode
    const layerId = `flood${64 + (floodLevel - 8)}-fill`;
    const newVisibility = isLayerVisible ? "none" : "visible";
    setIsLayerVisible(!isLayerVisible);

    if (mapRef.current?.getLayer(layerId)) {
      mapRef.current.setLayoutProperty(layerId, "visibility", newVisibility);
      onFloodLayerChange();
    }
  };

  if (hideOnDesktop && !isMobile) return null;

  return (
    <div className="flood-stepper-wrapper">
      <div className={`stepper-container ${isMenuHidden ? "menu-hidden" : ""}`}>
        <button
          className="stepper-button"
          onClick={() => changeFloodLevel("down")}
          disabled={levels.indexOf(floodLevel) === 0} // disable when at "All"
        >
          −
        </button>

        <div
          className={`flood-level-card ${isLayerVisible ? "" : "dimmed"}`}
          style={{
            backgroundColor:
              floodLevel === "All" ? "#316fffdd" : customColors[floodLevel - 8],
          }}
          onClick={toggleFloodVisibility}
        >
          <div className="water-text">Mendenhall Lake</div>
          {floodLevel === "All" ? "All Levels" : `${floodLevel} ft`}
        </div>

        <button
          className="stepper-button"
          onClick={() => changeFloodLevel("up")}
          disabled={levels.indexOf(floodLevel) === levels.length - 1} // disable at top
        >
          +
        </button>
      </div>
    </div>
  );
};

export default FloodStepper;

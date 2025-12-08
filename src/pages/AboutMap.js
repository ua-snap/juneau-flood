import React, { useState, useEffect, useRef } from "react";
import "./AboutMap.css";
import Model from "./Model";

const AboutMap = () => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function adjustHeight() {
      if (!containerRef.current || !isHovered) return;

      const rect = containerRef.current.getBoundingClientRect();
      const remaining = window.innerHeight - rect.top - 10;

      containerRef.current.style.setProperty(
        "--remaining-height",
        `${remaining}px`
      );
    }

    adjustHeight(); 

    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [isHovered]); 

  return (
    <div
      ref={containerRef}
      className={`flood-records-container2 ${isHovered ? "expanded" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered ? (
        <span className="tooltip-icon2">About Flood Maps</span>
      ) : (
        <div className="tooltip-title2">
          <h2>About Flood Maps</h2>
          <Model />
          <div className="tooltip-text3">
            Flood inundation maps show potential impacts between 8ft - 20ft.
            Impacts at 8ft are limited to low-lying areas near the river and
            shoreline, while impacts at 20ft show widespread flooding throughout
            Juneau.
            <p />
            These maps are based on historical flood data, topographical
            analysis, and hydrological modeling to show potential scenarios.
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutMap;

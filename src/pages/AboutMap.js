import React, { useState } from "react";
import "./AboutMap.css";
import Model from "./Model";

const AboutMap = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
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
            Juneau. <p></p>These maps are based on a combination of historical
            flood data, topographical analysis, and hydrological modeling to
            provide a comprehensive view of potential flood scenarios.
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutMap;

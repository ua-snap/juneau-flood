// WaterLevelCard.js
import React from "react";
import { getFloodStage } from "./utils/floodStages";
import "./WaterLevelCard.css";

const WaterLevelCard = ({ level, onHover, onLeave }) => {
  const currentStage = getFloodStage(level.value);

  return (
        <a 
      href="https://waterdata.usgs.gov/monitoring-location/USGS-15052500/#dataTypeId=continuous-00065--1654777834&period=P7D&showFieldMeasurements=true"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", color: "inherit" }}
    >
    
    <div 
      className="level-card"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <p>
        Lake Level: <strong>{`${level.value} ft`}</strong>
      </p>

      <p>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
          {currentStage?.label || "OFFLINE"}
        </span>
      </p>

      <p
        style={{
          fontSize: "0.66rem",
          marginBottom: ".3rem",
          marginTop: "-.2rem",
        }}
      >
        {level.dateTime || "N/A"}
      </p>
    </div>
    </a>
  );
};

export default WaterLevelCard;

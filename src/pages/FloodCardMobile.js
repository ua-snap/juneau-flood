// FloodCardMobile.js
import React from "react";
import "./FloodCardMobile.css";
import { getFloodStage } from "../utils/floodStages"; // ✅ adjust this path if needed

const FloodCardMobile = ({ waterLevels = [] }) => {
  return (
    <div className="level-card-mobile">
      {waterLevels.map((level) => {
        const currentStage = getFloodStage(level.value);
        return (
          <p key={level.id} className="level-card-mobile-text">
            Lake Level: <strong>{`${level.value}`}</strong> ft |{" "}
            <span className="stage">{currentStage?.label || "OFFLINE"}</span> |{" "}
            <span className="date">{level.dateTime || "N/A"}</span>
          </p>
        );
      })}
    </div>
  );
};

export default FloodCardMobile;

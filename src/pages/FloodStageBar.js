import React, { useState, useEffect, useRef } from "react";
import "./FloodStageBar.css";

const FloodStageBar = () => {
  const [waterLevel, setWaterLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [hoveredStage, setHoveredStage] = useState(null);
  const modalRef = useRef(null);

  const fetchWaterLevels = async () => {
    const gageId = "15052500";
    const apiUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gageId}&parameterCd=00065&siteStatus=active`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const timeSeries =
        data?.value?.timeSeries?.[0]?.values?.[0]?.value?.[0]?.value;

      if (!timeSeries) {
        throw new Error("No water level data available");
      }

      const level = parseFloat(timeSeries);
      if (isNaN(level)) throw new Error("Invalid water level data");

      setWaterLevel(level);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterLevels();
    const interval = setInterval(fetchWaterLevels, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const stages = [
    {
      label: "No Flood Stage",
      range: [0, 8],
      color: "#28a745",
      info: "Water level is below flood risk 0ft - 8ft",
    },
    {
      label: "Action Stage",
      range: [8, 9],
      color: "#e9f502",
      info: "Flooding risk starts 8ft - 9ft",
    },
    {
      label: "Minor Flood Stage",
      range: [9, 10],
      color: "#F4A100",
      info: "Flooding risk 9ft - 10ft",
    },
    {
      label: "Moderate Flood Stage",
      range: [10, 14],
      color: "#E2371D",
      info: "Flooding risk 10ft - 14ft",
    },
    {
      label: "Major Flood Stage",
      range: [14, Infinity],
      color: "#9419A3",
      info: "Flooding risk 14ft+",
    },
  ];

  const handleHover = (event, stage) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalInfo(stage);
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + rect.width / 2,
    });
    setHoveredStage(stage.label);
  };

  const handleMouseLeave = () => {
    setModalInfo(null);
    setHoveredStage(null);
  };

  return (
    <div className="flood-stage-container">
      {loading ? (
        <p>Loading water level data...</p>
      ) : error ? (
        <p className="error-message">Error: {error}</p>
      ) : (
        <FloodBar
          waterLevel={waterLevel}
          stages={stages}
          handleHover={handleHover}
          handleMouseLeave={handleMouseLeave}
          hoveredStage={hoveredStage}
        />
      )}

      {modalInfo && dropdownPosition && (
        <div
          ref={modalRef}
          className="modal-dropdown"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            border: `2.5px solid ${modalInfo.color}`,
            position: "absolute",
          }}
        >
          <div className="modal-content">
            <p>{modalInfo.info}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FloodBar = ({
  waterLevel,
  stages,
  handleHover,
  handleMouseLeave,
  hoveredStage,
}) => {
  return (
    <div className="flood-stage-bar">
      {stages.map((stage) => {
        const isCurrentStage =
          waterLevel >= stage.range[0] && waterLevel < stage.range[1];
        const isHovered = hoveredStage === stage.label;

        const backgroundColor =
          isCurrentStage || isHovered ? stage.color : "#e0e0e0";

        return (
          <div
            key={stage.label}
            className={`flood-stage-section ${isCurrentStage ? "highlight" : ""}`}
            style={{
              backgroundColor,
            }}
            onMouseEnter={(event) => handleHover(event, stage)}
            onMouseLeave={handleMouseLeave}
          >
            <span
              className={`stage-label ${!isCurrentStage ? "normal-text" : "bold-text"}`}
            >
              {stage.label}{" "}
              {isCurrentStage && <span className="current-water-level"></span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default FloodStageBar;

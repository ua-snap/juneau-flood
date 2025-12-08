import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./FloodGraph.css";

const S3_CSV_URL =
  "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/FloodEvents.csv";

const getFloodStageColor = (stage) => {
  if (stage >= 8 && stage < 9) return "#ffeb3b"; // Action Stage (8–9 ft)
  if (stage >= 9 && stage < 10) return "#fdae61"; // Minor Flood (9–10 ft)
  if (stage >= 10 && stage < 14) return "#d73027"; // Moderate Flood (10–14 ft)
  return "#7b3294"; // Major Flood (>14 ft)
};

const FloodGraph = () => {
  const [scatterData, setScatterData] = useState([]);
  const [eventCardData, setEventCardData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickedOnPoint, setClickedOnPoint] = useState(false);
  const [eventCardColor, setEventCardColor] = useState("#00509e");
  const [maxFloodEvent, setMaxFloodEvent] = useState(null);
  const [recentFloodEvent, setRecentFloodEvent] = useState(null);

  // === Load & Parse CSV ===
  useEffect(() => {
    fetch(S3_CSV_URL)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setLoading(false);
            let scatterDataProcessed = [];
            let eventCardDataProcessed = [];
            let maxEvent = null;
            let recentEvent = null;

            result.data.forEach((row) => {
              const id = row["Crest Date"] + row["Crest Stage D.S. Gage (ft)"];
              const stage = parseFloat(row["Crest Stage D.S. Gage (ft)"]);
              const color = getFloodStageColor(stage);

              const dataPoint = {
                x: row["Crest Date"],
                y: stage,
                fill: color,
                id,
              };
              scatterDataProcessed.push(dataPoint);

              eventCardDataProcessed.push({
                id,
                releaseDate: row["Release Start Date"] || "Unknown",
                releaseStage: row["Release Stage D.S. Gage (ft)"] || "Unknown",
                crestDate: row["Crest Date"],
                crestStage: row["Crest Stage D.S. Gage (ft)"],
                color,
              });

              if (!maxEvent || stage > maxEvent.y) maxEvent = dataPoint;
              if (
                !recentEvent ||
                new Date(row["Crest Date"]) > new Date(recentEvent.x)
              )
                recentEvent = dataPoint;
            });

            setScatterData(
              scatterDataProcessed.sort(
                (a, b) => new Date(a.x) - new Date(b.x),
              ),
            );
            setEventCardData(eventCardDataProcessed);
            setMaxFloodEvent(maxEvent);
            setRecentFloodEvent(recentEvent);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading CSV from S3:", error);
        setLoading(false);
      });
  }, []);

  // === Interactions ===
  const handlePointClick = (dataPoint) => {
    const matchingEvent = eventCardData.find(
      (event) => event.id === dataPoint.id,
    );
    setSelectedEvent(matchingEvent);
    setClickedOnPoint(true);
    if (matchingEvent) setEventCardColor(matchingEvent.color);
  };

  const handleBackgroundClick = (e) => {
    if (
      !clickedOnPoint &&
      !e.target.closest(".event-info-card") &&
      !e.target.closest(".scatter-chart-wrapper")
    ) {
      setSelectedEvent(null);
    }
    setClickedOnPoint(false);
  };

  const handleMouseEnter = (data) => setHoveredPoint(data.id);
  const handleMouseLeave = () => setHoveredPoint(null);
  const handleEventCardClick = () => setSelectedEvent(null);

  // === Custom Point Renderer (Option 1 applied here) ===
  const renderCustomShape = (props) => {
    // Destructure only what’s needed; never spread all props.
    const { cx, cy, fill, payload } = props;

    const isHovered = hoveredPoint === payload.id;
    const isSelected = selectedEvent && selectedEvent.id === payload.id;
    const isMaxFlood = maxFloodEvent && payload.id === maxFloodEvent.id;
    const isRecentFlood =
      recentFloodEvent && payload.id === recentFloodEvent.id;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 9 : isSelected ? 7 : 5}
          fill={fill}
          className="scatter-point"
          stroke={isMaxFlood ? "hotpink" : isRecentFlood ? "blue" : "none"}
          strokeWidth={isMaxFlood || isRecentFlood ? 3 : 0}
        />
      </g>
    );
  };

  // === UI ===
  return (
    <div className="flood-graph-container" onClick={handleBackgroundClick}>
      {loading ? (
        <div className="loading">Loading flood data...</div>
      ) : (
        <>
          <div className="scatter-chart-wrapper">
            <h3 className="flood-graph-title">
              Mendenhall Glacial Lake Outburst Flood Events Over Time
            </h3>
            <h4 className="flood-graph-subtitle">
              Select Points To Explore The Data
            </h4>

            <ResponsiveContainer width="100%" height={400} debounce={100}>
              <ScatterChart
                margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid />
                <XAxis
                  type="category"
                  dataKey="x"
                  name="Peak Water Level Date"
                  label={{
                    value: "Peak Lake Water Level Date",
                    position: "bottom",
                    style: { fontWeight: "bold", fill: "black" },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Peak Water Level Stage (ft)"
                  label={{
                    value: "Peak Lake Water Level Stage (ft)",
                    angle: -90,
                    position: "outsideLeft",
                    dx: -25,
                    style: { fontWeight: "bold", fill: "black" },
                  }}
                />
                <Scatter
                  name="Flood Events"
                  data={scatterData}
                  shape={renderCustomShape}
                  onClick={(value) => handlePointClick(value)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  cursor="pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>

            <div className="flood-legend">
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: "#ffeb3b" }}
                ></span>
                Action Stage (8–9 ft)
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: "#fdae61" }}
                ></span>
                Minor Flood (9–10 ft)
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: "#d73027" }}
                ></span>
                Moderate Flood (10–14 ft)
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: "#7b3294" }}
                ></span>
                Major Flood (&gt;14&nbsp;ft)
              </div>
              <div className="legend-item">
                <span
                  className="legend-outline"
                  style={{ borderColor: "hotpink" }}
                ></span>
                Largest Flood
              </div>
              <div className="legend-item">
                <span
                  className="legend-outline"
                  style={{ borderColor: "blue" }}
                ></span>
                Most Recent Flood
              </div>
            </div>
          </div>

          {selectedEvent && (
            <div
              className="event-info-card"
              onClick={handleEventCardClick}
              style={{
                borderRight: `5px solid ${eventCardColor}`,
                "--hover-color": `${eventCardColor}20`,
              }}
            >
              <h3 className="event-title">Flood Event Info</h3>
              <p>
                <strong>Release Start Date:</strong> {selectedEvent.releaseDate}
              </p>
              <p>
                <strong>Pre-flood Level:</strong> {selectedEvent.releaseStage}{" "}
                ft
              </p>
              <p>
                <strong>Flood Peak Level Date:</strong>{" "}
                {selectedEvent.crestDate}
              </p>
              <p>
                <strong>Flood Peak Level:</strong> {selectedEvent.crestStage} ft
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FloodGraph;

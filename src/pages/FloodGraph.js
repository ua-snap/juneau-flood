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
  if (stage >= 8 && stage < 9) return "#ffeb3b";
  if (stage >= 9 && stage < 10) return "#fdae61";
  if (stage >= 10 && stage < 14) return "#d73027";
  return "#7b3294";
};

const FloodGraph = () => {
  const [scatterData, setScatterData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [maxFloodEvent, setMaxFloodEvent] = useState(null);
  const [recentFloodEvent, setRecentFloodEvent] = useState(null);

  useEffect(() => {
    fetch(S3_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setLoading(false);
            let scatterDataProcessed = [];
            let maxEvent = null;
            let recentEvent = null;

            result.data.forEach((row) => {
              const date = new Date(row["Crest Date"]);
              if (isNaN(date)) return;

              const timestamp = date.getTime();
              const stage = parseFloat(row["Crest Stage D.S. Gage (ft)"]);
              const color = getFloodStageColor(stage);
              const id = row["Crest Date"] + row["Crest Stage D.S. Gage (ft)"];

              scatterDataProcessed.push({
                x: timestamp,
                y: stage,
                fill: color,
                id,
                releaseDate: row["Release Start Date"] || "Unknown",
                crestStage: row["Crest Stage D.S. Gage (ft)"],
              });

              if (!maxEvent || stage > maxEvent.y) maxEvent = { x: timestamp, y: stage, id };
              if (!recentEvent || timestamp > recentEvent.x) recentEvent = { x: timestamp, y: stage, id };
            });

            scatterDataProcessed.sort((a, b) => a.x - b.x);
            setScatterData(scatterDataProcessed);
            setMaxFloodEvent(maxEvent);
            setRecentFloodEvent(recentEvent);
          },
        });
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
        setLoading(false);
      });
  }, []);

  const handleMouseEnter = (data, event) => {
    setHoveredPoint(data.id);
    setPopupData(data);
    setPopupPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setPopupData(null);
  };

  const renderCustomShape = (props) => {
    const { cx, cy, fill, payload } = props;
    const isHovered = hoveredPoint === payload.id;
    const isMaxFlood = maxFloodEvent && payload.id === maxFloodEvent.id;
    const isRecentFlood = recentFloodEvent && payload.id === recentFloodEvent.id;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 10 : 6}
          fill={fill}
          stroke={isMaxFlood ? "#ff007f" : isRecentFlood ? "#2563eb" : "none"}
          strokeWidth={isMaxFlood || isRecentFlood ? 3 : 0}
          onMouseEnter={(e) => handleMouseEnter(payload, e)}
          onMouseLeave={handleMouseLeave}
        />
      </g>
    );
  };

  const formatDateTick = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  return (
    <div className="flood-graph-container" style={{ position: "relative" }}>
      {loading ? (
        <div className="loading">Loading flood data...</div>
      ) : (
        <>
          <div className="scatter-chart-wrapper">
            <h3 className="flood-graph-title">
              Glacial Lake Outburst Flood Events Graph
            </h3>
            <h4 className="flood-table-subtitle">
            Select Points To Explore Flood Data
          </h4>

            <ResponsiveContainer width="100%" height={400} debounce={100}>
              <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Date"
                  tickFormatter={formatDateTick}
                  tick={{ fontSize: 13, fill: "#111827" }}
                  domain={["dataMin", "dataMax"]}
                  label={{
                    value: "Peak Lake Water Level Date",
                    position: "bottom",
                    style: { fontWeight: "bold", fill: "#111827" },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Peak Water Level Stage (ft)"
                  tick={{ fontSize: 13, fill: "#111827" }}
                  label={{
                    value: "Peak Lake Water Level Stage (ft)",
                    angle: -90,
                    position: "outsideLeft",
                    dx: -25,
                    style: { fontWeight: "bold", fill: "#111827" },
                  }}
                />
                <Scatter
                  name="Flood Events"
                  data={scatterData}
                  shape={renderCustomShape}
                  cursor="pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>

            <div className="flood-legend">
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#ffeb3b" }}></span>Action Stage (8–9 ft)</div>
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#fdae61" }}></span>Minor Flood (9–10 ft)</div>
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#d73027" }}></span>Moderate Flood (10–14 ft)</div>
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#7b3294" }}></span>Major Flood (&gt;14 ft)</div>
              <div className="legend-item"><span className="legend-outline" style={{ borderColor: "#ff007f" }}></span>Largest Flood</div>
              <div className="legend-item"><span className="legend-outline" style={{ borderColor: "#2563eb" }}></span>Most Recent Flood</div>
            </div>
          </div>

          {popupData && (
            <div
              className="glof-mapbox-popup mapboxgl-popup"
              style={{
                position: "fixed",
                left: popupPosition.x,
                top: popupPosition.y,
              }}
            >
              <div className="mapboxgl-popup-content">
                <p><strong> {popupData.crestStage} ft</strong></p>
                <p>{popupData.releaseDate}</p>
                
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FloodGraph;

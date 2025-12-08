import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./FloodKey.css";

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

// Flood levels 8–20 ft
const floodLevels = Array.from({ length: 13 }, (_, i) => 8 + i);

// Historical flood records
const floodRecords = [
  { level: 16.67, year: 2025 },
  { level: 15.99, year: 2024 },
  { level: 14.97, year: 2023 },
];

const S3_CSV_URL =
  "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/FloodEvents.csv";

const FloodKey = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredYear, setHoveredYear] = useState(null);
  const [eventCounts, setEventCounts] = useState({});

  // Fetch CSV & count events by level
  useEffect(() => {
    fetch(S3_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const counts = {};
            result.data.forEach((row) => {
              const levelStr =
                row["Crest Stage D.S. Gage (ft)"] ||
                row["Peak Water Level at Mendenhall Lake (ft)"];
              const level = parseFloat(levelStr);
              if (!isNaN(level)) {
                const bucket = Math.floor(level);
                counts[bucket] = (counts[bucket] || 0) + 1;
              }
            });
            setEventCounts(counts);
          },
        });
      })
      .catch((err) => console.error("Error loading flood CSV:", err));
  }, []);

  return (
    <div
      className={`flood-records-container ${isHovered ? "expanded" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredYear(null);
      }}
    >
      <a
        href="https://www.juneauflood.com/#/flood-events"
        target="_blank"
        rel="noopener noreferrer"
        className="flood-records-title"
      >
        Flood Events
        <span className="flood-events-tooltip">
          Recorded glacial lake outbust floods by NWS. Years indicate the
          highest ever recorded lake levels.
        </span>
      </a>

      {floodLevels.map((level, i) => {
        const record = floodRecords.find((r) => Math.floor(r.level) === level);
        const eventCount = eventCounts[level] || 0;
        const offsetPercent = record
          ? ((record.level - level) / 1) * 100
          : null;

        return (
          <div key={level} className="flood-records-row">
            <div
              className="flood-pill"
              style={{
                backgroundColor: customColors[i],
                borderTopLeftRadius:
                  i === floodLevels.length - 1 ? "10px" : "0",
                borderTopRightRadius:
                  i === floodLevels.length - 1 ? "10px" : "0",
                borderBottomLeftRadius: i === 0 ? "10px" : "0",
                borderBottomRightRadius: i === 0 ? "10px" : "0",
              }}
            >
              <div className="flood-text-wrapper">
                <span className="flood-label default-label">
                  <strong>{level}</strong>
                  <span className="flood-unit">ft</span>
                </span>
                <span className="flood-label hover-label">
                  <strong>{level}</strong>
                  <span className="flood-unit">ft</span>
                  <span className="flood-count">
                    &nbsp;-&nbsp;Events: {eventCount}
                  </span>
                </span>
              </div>

              {/* Dynamic positioned record marker */}
              {record && (
                <div
                  className="record-marker"
                  style={{ bottom: `${offsetPercent}%` }}
                  onMouseEnter={() => setHoveredYear(record.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  <div className="record-line" />
                  <span className="record-year">{record.year}</span>

                  {/* Tooltip showing flood peak */}
                  {hoveredYear === record.year && (
                    <div className="flood-tooltip">
                      {record.level.toFixed(2)}ft
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FloodKey;

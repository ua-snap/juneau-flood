import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // CSV parser
import "./FloodTable.css"; // Import styles

const S3_CSV_URL =
  "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/FloodEvents.csv";

const COLUMN_NAME_MAPPING = {
  "Release Stage D.S. Gage (ft)":
    "Pre Flood Water Level at Mendenhall Lake (ft)",
  "D.S. Gage Release Flow (cfs)":
    "Pre-flood Streamflow in Mendenhall River (cfs)",
  "Crest Date": "Peak Water Level Date",
  "Crest Stage D.S. Gage (ft)": "Peak Water Level at Mendenhall Lake (ft)",
  "D.S. Gage Crest Flow (cfs)": "Peak Flow in Mendenhall River (cfs)",
  Impacts: "NWS Impacts",
};

const EXCLUDED_COLUMNS = [
  "Remarks",
  "Lake Peak Stage (ft)",
  "Release Volume (ac-ft)",
];

const getFloodStageColor = (stage) => {
  if (stage < 9) return "lightyellow";
  if (stage >= 9 && stage < 10) return "lightsalmon";
  if (stage >= 10 && stage < 14) return "lightcoral";
  return "plum";
};

const FloodTable = () => {
  const [, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expanded, setExpanded] = useState(false);

  const previewCount = 3;
  const visibleCount = 5;

  useEffect(() => {
    fetch(S3_CSV_URL)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rawData = result.data;

            // Process data and add index column
            const processedData = rawData.map((row, index) => {
              const newRow = { Index: index + 1 };
              Object.keys(row).forEach((key) => {
                if (!EXCLUDED_COLUMNS.includes(key)) {
                  const newKey = COLUMN_NAME_MAPPING[key] || key;
                  newRow[newKey] = row[key];
                }
              });
              return newRow;
            });

            const newHeaders = [
              "Index",
              ...Object.keys(processedData[0] || {}).filter(
                (h) => h !== "Index",
              ),
            ];

            setData(processedData);
            setSortedData(processedData);
            setHeaders(newHeaders);
            setLoading(false);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching CSV:", error);
        setLoading(false);
      });
  }, []);

  const handleSort = (column) => {
    const direction =
      sortConfig.key === column && sortConfig.direction === "asc"
        ? "desc"
        : "asc";

    const isDateColumn = (value) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(value) || !isNaN(Date.parse(value));
    };

    const sorted = [...sortedData].sort((a, b) => {
      const aRaw = a[column];
      const bRaw = b[column];

      // Check for date comparison
      if (isDateColumn(aRaw) && isDateColumn(bRaw)) {
        const aDate = new Date(aRaw);
        const bDate = new Date(bRaw);
        return direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Check for numeric comparison
      const aValue = parseFloat(aRaw);
      const bValue = parseFloat(bRaw);

      if (!isNaN(aValue) && !isNaN(bValue)) {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Default to string comparison
      return direction === "asc"
        ? String(aRaw).localeCompare(String(bRaw))
        : String(bRaw).localeCompare(String(aRaw));
    });

    setSortedData(sorted);
    setSortConfig({ key: column, direction });
  };

  return (
    <div className="flood-table-container">
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <h3 className="flood-table-title">
            Mendenhall Glacial Lake Outburst Flood Events Table
          </h3>
          <h4 className="flood-table-subtitle">
            Select Columns To Explore Flood Data
          </h4>

          <table className="flood-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="sortable"
                    onClick={() => handleSort(header)}
                  >
                    {header}{" "}
                    {sortConfig.key === header
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="no-data">
                    No data available
                  </td>
                </tr>
              ) : (
                sortedData
                  .slice(
                    0,
                    expanded ? sortedData.length : visibleCount + previewCount,
                  )
                  .map((row, rowIndex) => {
                    const isPreviewRow = !expanded && rowIndex >= visibleCount;
                    let opacity = 1;

                    if (isPreviewRow) {
                      const previewIndex = rowIndex - visibleCount;
                      opacity = 0.7 - previewIndex * 0.2;
                    }

                    return (
                      <tr
                        key={rowIndex}
                        style={{
                          opacity,
                          transition: "opacity 0.3s ease-in-out",
                        }}
                      >
                        {headers.map((header, colIndex) => {
                          const isFloodStageColumn =
                            header ===
                            "Peak Water Level at Mendenhall Lake (ft)";
                          const cellStyle = isFloodStageColumn
                            ? {
                                backgroundColor: getFloodStageColor(
                                  parseFloat(row[header]),
                                ),
                              }
                            : {};

                          return (
                            <td key={colIndex} style={cellStyle}>
                              {row[header] || "—"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
          {sortedData.length > visibleCount && (
            <button
              className="expand-button"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default FloodTable;

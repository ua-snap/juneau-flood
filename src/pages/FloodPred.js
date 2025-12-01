import React, { useState, useEffect } from "react";
import "./FloodPred.css";

const FloodPred = ({ onClose }) => {
  const [nwsFloodForecast, setNwsFloodForecast] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissible, setIsDismissible] = useState(false); // Default to non-dismissible

  useEffect(() => {
    const fetchFloodData = async () => {
      try {
        const nwsRes = await fetch(
          "https://api.weather.gov/alerts/active?zone=AKZ025",
          {
            headers: {
              "User-Agent":
                "JuneauFloodApp (https://github.com/codefean/juneau-flood-beta)",
            },
          },
        );
        const nwsData = await nwsRes.json();

        if (nwsData.features.length > 0) {
          const alert = nwsData.features[0].properties;
          setNwsFloodForecast(
            alert.headline || alert.event || "Advisory Issued",
          );
          setIsDismissible(false); // Prevent dismissal when there is an alert
        } else {
          setNwsFloodForecast("No Active Alerts.");
          setIsDismissible(true); // Allow dismissal when no alert
        }
      } catch (error) {
        console.error("Error fetching status:", error);
        setNwsFloodForecast("Data unavailable. Check NWS website.");
        setIsDismissible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFloodData();
    const interval = setInterval(fetchFloodData, 500000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    if (!isDismissible) return;
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className="flood-prediction">
      {loading ? (
        <p>Loading forecast...</p>
      ) : (
        <div
          className={`flood-pred-details ${isVisible ? "visible" : "hidden"}`}
        >
          <div
            className={`flood-pred-card alert ${isDismissible ? "clickable" : "non-dismissible"}`}
            onClick={isDismissible ? handleDismiss : null}
          >
            <h2>National Weather Service Flood Forecast</h2>
            <p>{nwsFloodForecast}</p>

            <div className="more-info-container">
              <a
                href="https://www.weather.gov/ajk/suicideBasin"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="more-info-btn">NWS Flood Forecast</button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloodPred;

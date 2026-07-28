import React, { useState, useEffect } from "react";
import "./FloodInfoPopup.css";

const FloodInfoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasDismissedPopup = localStorage.getItem("floodPopupDismissed");
    if (!hasDismissedPopup && window.innerWidth >= 768) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("floodPopupDismissed", "true"); 
  };

  if (!isVisible) return null;

  return (
    <div className="flood-popup-overlay">
      <div className="flood-popup-box">
        <h2>Evacuation Zone</h2>

        <p className="reduce-top-margin">
          <strong>
          </strong>
        </p>

        <div className="popup-info">
          <p>
            <strong>These maps show potential flood inundation, they do NOT show recommended evacuation areas.
            Do not plan evacuation activities based on information on this map. 
            Visit           <a
            href="https://experience.arcgis.com/experience/df76d4284f0749c28f3197644a73f18a"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            HERE 
          </a> to view the current evacuation map and evacuation planning information. </strong>
          </p>
        </div>

        <p className="popup-disclaimer">
          This tool is for <em>informational purposes only</em>. For emergency
          flood information, refer to the
            National Weather Service & City & Borough of Juneau Emergency Management

          .
        </p>

        <button onClick={handleClose} className="popup-close-button">
          <strong>Accept</strong>
        </button>
      </div>
    </div>
  );
};

export default FloodInfoPopup;

import React, { useEffect, useState } from "react";
import "./EvacuationPopup.css";

const EvacuationPopup = ({
  level = 17,
  autoClose = false,
  autoCloseDelay = 5000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => setVisible(false), autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, visible]);

  if (!visible) return null;

  return (
    <div
      className="flood-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flood-popup-title"
    >
      <div className="flood-popup-box">
        <h2 id="flood-popup-title">Current Flood Evacuation Zone</h2>
        <p></p>
        <p className="evacuation-text">
          <strong>The Suicide Basin glacial outburst underway. </strong>
        </p>
        <p className="evacuation-text">
          The City & Borough of Juneau recommends that residents in the 17ft
          lake level inundation zone (shown with HESCO barriers OFF) evacuate.
        </p>

        <p className="evacuation-text">
          The flood peak is forecasted for Wednesday between 8AM - 12PM at a
          16.3 - 16.8ft lake level.
        </p>
        <button
          className="popup-close-button"
          onClick={() => setVisible(false)}
        >
          <strong>OK</strong>
        </button>
      </div>
    </div>
  );
};

export default EvacuationPopup;

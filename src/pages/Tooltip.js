import React from "react";
import "./Tooltip.css";

const TooltipMarker = ({ markers, handleMarkerClick, activeInfo, imageId }) => {
  return (
    <>
      {markers.map((marker, index) => (
        <button
          key={index}
          className="info-marker"
          style={{
            top: marker.top, // Position in percentage
            left: marker.left, // Position in percentage
          }}
          onClick={(e) => handleMarkerClick(marker, e, imageId)}
        >
          ?
        </button>
      ))}
      {activeInfo?.imageId === imageId && (
        <div
          className="info-box"
          style={{ top: `${activeInfo.top}px`, left: `${activeInfo.left}px` }}
        >
          {activeInfo.text}
        </div>
      )}
    </>
  );
};

export default TooltipMarker;

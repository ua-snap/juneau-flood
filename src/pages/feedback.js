import React from "react";
import "./feedback.css";
import "./FloodEvents.css";

const Feedback = ({ headers, data, loading, scatterData }) => {
  return (
    <div className="feedback-page">
      {/* === Flood Events Section === */}
      <div className="flood-feedback-container">
        <h2 className="flood-feedback-title">Feedback and Suggestions</h2>
        <h3 className="flood-feedback-subheading">
          Share Your Thoughts to Improve The Dashboard
        </h3>

        <div className="about-feedback-card">
          <p>
            We’re seeking your feedback to help improve the Juneau Flood
            Dashboard. Please share your ideas through the feedback form.
          </p>
        </div>
      </div>

      {/* === Feedback Form === */}
      <div className="feedback-container">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScpAxn2kehZVgTVavv0DLuR0tRNAMwqEQnGI-NzFGt831lS1A/viewform?usp=header"
          width="97.5%"
          height="800"
          title="Feedback Form"
        ></iframe>
      </div>
    </div>
  );
};

export default Feedback;

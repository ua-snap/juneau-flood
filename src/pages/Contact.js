import React from "react";
import { NavLink } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <ul className="home-links">
        <li>
          <NavLink to="/flood-levels" className="home-link">
            Flood Map
          </NavLink>
          <p className="home-description">
            Live view of the glacial flood zone at various flood levels, with
            toggles for HESCO barrier protection.
          </p>
        </li>
        <li>
          <NavLink to="/flood-forecast" className="home-link">
            Flood Forecasting
          </NavLink>
          <p className="home-description">
            How to understand flood forecasts based on gage heights and image
            data from Suicide Basin.
          </p>
        </li>
        <li>
          <NavLink to="/flood-events" className="home-link">
            Flood Events
          </NavLink>
          <p className="home-description">
            Historical flood event data including impact reports and peak
            discharge statistics.
          </p>
        </li>
        <li>
          <NavLink to="/suicide-basin" className="home-link">
            Suicide Basin
          </NavLink>
          <p className="home-description">
            How Suicide Basin works and context for recent lake outburst events.
          </p>
        </li>
      </ul>

      <p className="beta-note">
        This site is in beta. Report bugs to{" "}
        <a href="mailto:ewhood@alaska.edu">ewhood@alaska.edu</a> or{" "}
        <a href="mailto:sfagan2@alaska.edu">sfagan2@alaska.edu</a>.
      </p>
    </div>
  );
};

export default Home;

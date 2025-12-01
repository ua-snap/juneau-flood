import React, { useState, useEffect } from "react";
import "./FloodForecast.css";

import Tooltip from "./Tooltip";
import FloodStageBar from "./FloodStageBar";

// Main component
const FloodPrediction = () => {
  // State for live images and water level
  const [imageUrl, setImageUrl] = useState("");
  const [hydroGraphUrl, setHydroGraphUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [waterLevel, setWaterLevel] = useState(null);
  const [error, setError] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null);

  // Load fresh images on mount and every hour
  useEffect(() => {
    const updateImages = () => {
      setImageUrl(
        `https://www.weather.gov/images/ajk/suicideBasin/current.jpg?timestamp=${Date.now()}`,
      );
      setHydroGraphUrl(
        `https://water.noaa.gov/resources/hydrographs/mnda2_hg.png?timestamp=${Date.now()}`,
      );
      setLoading(false);
    };

    updateImages();
    const interval = setInterval(updateImages, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Handles clicking on visual tooltip markers
  const handleMarkerClick = (marker, event, imageId) => {
    const wrapperRect = event.target
      .closest(".image-wrapper")
      .getBoundingClientRect();
    const markerRect = event.target.getBoundingClientRect();

    // Toggle visibility if clicking the same marker
    if (
      activeInfo &&
      activeInfo.imageId === imageId &&
      activeInfo.text === marker.text
    ) {
      setActiveInfo(null);
    } else {
      setActiveInfo({
        imageId,
        text: marker.text,
        top: markerRect.top - wrapperRect.top + markerRect.height + 5,
        left: markerRect.left - wrapperRect.left + markerRect.width / 2,
      });
    }
  };

  // Closes tooltip info box if clicked outside
  const closeInfoBox = (e) => {
    if (!e.target.closest(".info-box") && !e.target.closest(".info-marker")) {
      setActiveInfo(null);
    }
  };

  // Tooltip marker positions for Suicide Basin and Mendenhall
  const markers = {
    suicideBasin: [
      { top: "55%", left: "19.5%", text: "Current glacial lake water levels" },
      {
        top: "70%",
        left: "48.5%",
        text: "Movement of floating ice can impact water level measurements on the hydrograph.",
      },
    ],
    mendenhallLake: [],
  };

  // Fetch real-time Mendenhall Lake water levels from USGS
  const fetchWaterLevels = async () => {
    const gageId = "15052500";
    const apiUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gageId}&parameterCd=00065&siteStatus=active`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const timeSeries =
        data?.value?.timeSeries?.[0]?.values?.[0]?.value?.[0]?.value;

      if (!timeSeries) {
        throw new Error("No water level data available");
      }

      const level = parseFloat(timeSeries);
      if (isNaN(level)) throw new Error("Invalid water level data");

      setWaterLevel(level);
      setError(null);
    } catch (error) {
      console.error("Error fetching water level:", error);
      setError(error.message);
    }
  };

  // Poll for lake level every 60s
  useEffect(() => {
    fetchWaterLevels();
    const interval = setInterval(fetchWaterLevels, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Translate water level into descriptive stage
  const getFloodStage = (level) => {
    if (level === null) return "Loading...";
    if (level < 0) return "No Water Level Data Available";
    if (level < 8) return `No Flood Risk at ${level.toFixed(1)}ft of water`;
    if (level < 9) return `Action Stage at ${level.toFixed(1)}ft of water`;
    if (level < 11)
      return `Minor Flood Stage at ${level.toFixed(1)}ft of water`;
    if (level < 14)
      return `Moderate Flood Stage at ${level.toFixed(1)}ft of water`;
    return `Major Flood Stage at ${level.toFixed(1)} ft`;
  };

  // ------------------- COMPONENT UI -------------------

  return (
    <div className="flood-tracker" onClick={closeInfoBox}>
      {/* Title & Subheading */}
      <h1 className="flood-forecasting-title">Explore Flood Forecasting</h1>
      <h3 className="flood-forecasting-subheading">
        Understanding Water Levels in Suicide Basin & Mendenhall Lake
      </h3>

      {/* Suicide Basin Section */}
      <div className="about-forecast-card">
        <p>
          This page provides information about real-time monitoring efforts. The
          USGS monitors Suicide Basin using time-lapse cameras and a laser range
          finder to track water levels —{" "}
          <strong>
            though icebergs that float in front of the laser may cause levels to
            jump around
          </strong>
          . Mendenhall Lake levels are also tracked continuously at a site on
          the west shore. Lake level is an important predictor of downstream
          flood impacts following an outburst from Suicide Basin.
        </p>
      </div>

      {/* Image Section */}

      <div className="flood-content">
        {/* Suicide Basin Section */}
        <h2 className="section-title">Suicide Basin Water Level</h2>
        <div className="image-pair-container">
          {/* Suicide Basin Image */}
          <div className="image-container suicide-basin-container">
            {loading ? (
              <p>Loading image...</p>
            ) : (
              <div className="image-wrapper suicide-basin-wrapper">
                <img
                  src={imageUrl}
                  alt="Live view of Suicide Basin glacial pool"
                  className="flood-image suicide-basin-image"
                  onError={(e) => (e.target.src = "/fallback-image.jpg")}
                />
                <p className="image-caption">
                  Latest USGS Image of Suicide Basin
                </p>

                <Tooltip
                  markers={markers.suicideBasin}
                  handleMarkerClick={handleMarkerClick}
                  activeInfo={activeInfo}
                  imageId="suicideBasin"
                />
              </div>
            )}
          </div>

          {/* NOAA Hydrograph for Suicide Basin */}
          <div className="image-container additional-image-container">
            <div className="image-wrapper additional-image-wrapper">
              <img
                src="https://water.noaa.gov/resources/hydrographs/jsba2_hg.png"
                alt="NOAA Hydrograph"
                className="flood-image additional-image"
                style={{ width: "92%", maxWidth: "900px", height: "auto" }}
                onError={(e) => (e.target.src = "/fallback-image.jpg")}
              />
              <p className="image-caption">
                Latest Water Elevation (Pool Height) for Suicide Basin Glacial
                Dammed Lake
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Education Section - GLOF Forecasting */}
      <div className="detail-card black-text">
        <h2>Forecasting Glacial Lake Outburst Floods (GLOFs)</h2>
        <p>
          Suicide Basin is a glacier-dammed lake that can suddenly release large
          volumes of water, triggering outburst floods that impact the
          Mendenhall Valley. Forecasting these floods requires constant
          monitoring of water levels and understanding changes in the basin’s
          structure over time. The USGS tracks Suicide Basin using time-lapse
          cameras with elevation scale bars and precise laser range finders.
          However, floating icebergs can skew readings by altering the visible
          water surface. Monitoring is active from spring through fall.
        </p>

        <ul>
          <li>
            <strong>Flood Potential:</strong> The volume of water and the
            release rate from Suicide Basin determine flooding severity.
            Researchers use drone-based surveys to create three-dimensional
            terrain models and estimate total water volume.
          </li>
          <li>
            <strong>Changing Water Elevations:</strong> The basin’s capacity
            evolves over time due to glacier thinning, iceberg calving, and
            internal ice melt—affecting how much water it can store before an
            outburst.
          </li>
          <li>
            <strong>Time to Prepare:</strong> Once drainage begins, floodwaters
            typically reach Mendenhall Lake within 1–2 days, offering a brief
            window for preparation.{" "}
            <a
              href="https://flood-events.s3.us-east-2.amazonaws.com/NOAA_Hydrograph.png"
              target="_blank"
              rel="noreferrer"
            >
              Here's how the hydrograph looked when this occured in 2024.
            </a>
          </li>
          <li>
            <strong>Flood Season:</strong> Outburst floods most commonly occur
            between June and October, with peak events typically in July and
            August.
          </li>
        </ul>

        <button
          className="more-data-button"
          onClick={() =>
            window.open("https://www.weather.gov/ajk/suicideBasin")
          }
        >
          More Info
        </button>
      </div>

      {/* Mendenhall Lake Level Section */}

      <div className="lake-level-content">
        <h2 className="section-title-lake">Mendenhall Lake Level</h2>
        {/* Flex container for Hydrograph & Text */}
        <div className="lake-level-wrapper">
          {/* NOAA Hydrograph */}
          <div className="image-wrapper">
            {loading ? (
              <p>Loading graph...</p>
            ) : (
              <>
                <img
                  src={hydroGraphUrl}
                  alt="Mendenhall lake water level hydrograph"
                  className="mendenhall-lake-image"
                  onError={(e) => (e.target.src = "/fallback-graph.jpg")}
                />
                <p className="image-caption">
                  Latest NOAA Hydrograph for Mendenhall Lake
                </p>
                <Tooltip
                  markers={markers.mendenhallLake}
                  handleMarkerClick={handleMarkerClick}
                  activeInfo={activeInfo}
                  imageId="mendenhallLake"
                />
                {/* ADD BLUE SQUARE TOOLTIP */}
                <div
                  className="blue-square-tooltip"
                  style={{
                    position: "absolute",
                    top: "2.5%",
                    left: "50%",
                    width: "400px",
                    height: "14px",
                    backgroundColor: "#0d008d",
                    borderRadius: "2px",
                    cursor: "pointer",
                  }}
                ></div>
              </>
            )}
          </div>

          <div className="detail-card black-text flooding-info">
            <h2 style={{ textAlign: "left" }}>
              Mendenhall Lake Level & Flood Conditions
            </h2>
            <p>
              Mendenhall Lake is a glacially-fed lake at the terminus of
              Mendenhall Glacier. Water levels fluctuate due to seasonal
              melting, precipitation, and outburst floods. The{" "}
              <a
                href="https://waterdata.usgs.gov/monitoring-location/15052500/#dataTypeId=continuous-00065--1654777834&period=P7D&showMedian=false"
                target="_blank"
                rel="noopener noreferrer"
              >
                USGS monitors water level
              </a>{" "}
              (also referred to as stage) along the lake’s west shore to track
              these changes in real time.
            </p>
            <p>
              The water level in Mendenhall Lake is measured every 15 minutes by
              a sensor in the lake. The NWS uses forecasts of rainfall, glacier
              melt, and water release from Suicide Basin to forecast water
              levels in Mendenhall Lake (graph, left). During outburst floods,
              lake levels can rise rapidly, posing a significant flood risk. For
              example, during the August 2024 outburst flood, the water level in
              Mendenhall Lake{" "}
              <a
                href="https://flood-events.s3.us-east-2.amazonaws.com/mlake_hydrograph.png"
                target="_blank"
                rel="noreferrer"
              >
                surged by over 10 ft in just two days.
              </a>{" "}
              Such extreme fluctuations highlight the importance of continuous
              monitoring and early warnings.
            </p>
            <p>
              When the water level in Mendenhall Lake is forecasted to exceed
              the flood stage, a flood watch or warning is issued. When the
              water level exceeds 9ft, flooding can occur in Mendenhall Valley.
              Flood stages for Mendenhall Lake range from minor (9-10 ft) to
              major (14+ ft) and are color coded to highlight known impacts
              documented by the NWS (below).
            </p>
          </div>
        </div>
      </div>

      <div className="flood-stage-container">
        {/* Dynamic Flood Stage Display */}
        <div className="flood-stage-container">
          <FloodStageBar />
          <h2 className="current-flood-stage-title">
            Current Flood Stage:{" "}
            <span className="flood-stage-text">
              {error ? `Error: ${error}` : getFloodStage(waterLevel)}
            </span>
          </h2>
        </div>
      </div>

      <div className="detail-card black-text">
        <h2>Understanding Flood Stages</h2>
        <p>
          Flood stages indicate the severity of flooding based on lake water
          levels. These stages help communities, emergency responders, and
          individuals assess potential risks and take necessary precautions. The
          National Weather Service defines four primary flood categories: Action
          Stage, Minor, Moderate, and Major Flooding. The current flood stage
          and water level is shown above.
        </p>

        <div>
          <strong>Action Stage (8 - 9ft):</strong> Water levels have reached
          bankfull conditions and minor flooding will occur above this level.
          Residents should begin to take mitigation actions for flooding events
          based on their location.
          <ul>
            <li>
              <strong>8 ft:</strong> Bankfull risk starts.
            </li>
          </ul>
        </div>

        <div>
          <strong>Minor Flooding (9 - 10.5 ft):</strong>
          <ul>
            <li>
              <strong>9 ft:</strong> Water starts covering Skaters Cabin Rd and
              flows into Mendenhall Campground.
            </li>
            <li>
              <strong>9.5 ft:</strong> 0.5 ft of water covers Skaters Cabin Rd.
              Campsite 7 flooded; water over the road between campsites 8 and 9.
            </li>
            <li>
              <strong>10 ft:</strong> Mendenhall Campground inundated with up to
              3 ft of water. Skaters Cabin Rd has up to 1.5 ft of water.
              Portions of West Glacier Trail impassable. Minor yard flooding on
              View Dr begins.
            </li>
            <li>
              <strong>10.5 ft:</strong> Over 3 ft of water near Mt. McGinnis
              trailhead. Mendenhall Campground evacuation starts.
            </li>
          </ul>
        </div>

        <div>
          <strong>Moderate Flooding (11 - 14 ft):</strong>
          <ul>
            <li>
              <strong>11 ft:</strong> Yards flood on View Dr (up to 1.5 ft of
              water). Bank erosion begins below Back Loop Bridge. Backyard
              flooding on Meander Way. Dredge Lake Trail impassable; floodwaters
              reach Dredge Lake.
            </li>
            <li>
              <strong>11.5 ft:</strong> Road past 9374 View Dr begins to flood.
              Water nears some homes at end of View Dr.
            </li>
            <li>
              <strong>12 ft:</strong> Bank erosion worsens. 0.5 ft water on road
              past 9374 View Dr. Flooding begins in some homes on View Dr.
            </li>
            <li>
              <strong>12.5 ft:</strong> 2–4 ft of water in Meander Way
              backyards.
            </li>
            <li>
              <strong>13 ft:</strong> 2 ft of water on road past 9374 View Dr.
              1–2 ft of water in some homes on View Dr.
            </li>
            <li>
              <strong>13.5 ft:</strong> Water backs up behind homes between
              Riverside Dr and Mendenhall River School. Yard flooding begins on
              River Rd. Severe bank erosion along the river.
            </li>
            <li>
              <strong>14 ft:</strong> Road past 9374 View Dr impassable. More
              homes on View Dr see moderate to major flooding. Water approaches
              driveways on River Rd.
            </li>
          </ul>
        </div>

        <div>
          <strong>Major Flooding (14+ ft):</strong>
          <ul>
            <li>
              <strong>15 ft:</strong> Major home flooding on View Dr. Water in
              backyards and driveways along River Rd. Up to 1 ft of water on
              Riverside Dr near Tournure St and Mendenhall River School.
            </li>
            <li>
              <strong>16 ft:</strong> Water overtops banks near Wildmeadow Ln.
              0.5 ft water at Skaters Cabin Rd & Arctic Cir intersection.
              Backyard flooding begins between Tamarack Ct and Whitewater Ct.
              Flooding near River Rd and Meadow Ln.
            </li>
            <li>
              <strong>17 ft:</strong> Homes flooded near Wildmeadow Ln and
              Meadow Ln to Eagle St. Businesses in Vintage Park Blvd threatened.
              Tournure St covered in water. All of View Dr flooded.
            </li>
            <li>
              <strong>18 ft:</strong> Water over both sides of Back Loop Rd near
              Mint Way to Chelsea Ct. Mendenhall Loop Rd and Egan Dr begin
              flooding. Businesses between Sherwood Ln and Bentwood Pl impacted.
              Water in low areas of neighborhoods east of Radcliffe Rd.
            </li>
            <li>
              <strong>19 ft:</strong> Roads like Slim Williams Way, Black Wolf
              Way, and Pond Vista Dr flooded. Homes on Tournure St inundated.
              Egan Dr and Mendenhall Mall Rd flooded and impassable. Widespread
              home and business flooding near Mendenhall River.
            </li>
            <li>
              <strong>20 ft:</strong> Backyards along Gladstone St flooded.
              Homes south of Mendenhall Loop Rd inundated. Widespread flooding
              on both sides of Mendenhall River. Egan Dr impassable in multiple
              locations. Mendenhall wastewater treatment plant affected.
            </li>
          </ul>

          <button
            className="more-data-button"
            onClick={() => window.open("https://water.noaa.gov/gauges/MNDA2")}
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloodPrediction;

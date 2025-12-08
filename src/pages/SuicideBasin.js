import "./SuicideBasin.css";
import SBmodel from "./SBmodel";
import "./StoryMap.css";

const SuicideBasin = () => {
  // ------------------- COMPONENT UI -------------------
  return (
    <div className="suicide-basin-container">
      {/* Title Section */}
      <div className="suicide-basin">
        <h2>How Suicide Basin Works</h2>
      </div>
      <p className="suicide-basin-subheading">
        Understand the Annual Glacial Lake Outburst Floods
      </p>

      {/* Suicide Basin Info Card */}
      <div className="suicide-basin-info-card">
        <p>
          Suicide Basin is an over-deepened bedrock basin located approximately
          3km up the Mendenhall Glacier in Juneau, Alaska. It was formed by the
          retreat of the Suicide Glacier, which left an open space alongside the
          Mendenhall Glacier. Suicide Basin plays a crucial role in the
          formation of recurring glacial lake outburst floods (GLOFs) because
          Mendenhall Glacier acts as a dam that allows meltwater to accumulate
          in the basin. When water stored in the basin escapes beneath the ice
          dam, billions of gallons of water can be released into Mendenhall
          Lake, leading to flooding downstream.
        </p>
      </div>
      <div className="story-map-container">
        <iframe
          src="https://storymaps.arcgis.com/stories/72cef125bbfa4f989356bf9350cd5d63"
          width="100%"
          height="675px"
          frameBorder="0"
          allowFullScreen
          allow="geolocation"
          title="StoryMap"
        ></iframe>
      </div>
    </div>
  );
};

export default SuicideBasin;

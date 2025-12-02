import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Home.css";
import "./FloodForecast.css";
import Slider from "react-slick";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./SuicideBasin.css";

// cd /Users/seanfagan/Desktop/juneau-flood-alpha
// https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/flood-impacts/

const images = [
  {
    src: "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/flood-impacts/home_video.mp4",
    title: "August 23rd 2023 - 14.97 ft Mendenhall Lake Level",
    description: "Credit: Sam Nolan",
  },
  {
    src: "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/flood-impacts/flood_image1.png",
    title: "August 3rd 2024 - 15.99 ft Mendenhall Lake Level",
    description: "Credit: Alaska National Guard",
  },
  {
    src: "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/flood-impacts/flood_image2.png",
    title: "August 3rd 2024 - 15.99 ft Mendenhall Lake Level",
    description: "Credit: Alaska National Guard",
  },
  {
    src: "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/flood-impacts/flood_image3.png",
    title: "August 3rd 2024 - 15.99 ft Mendenhall Lake Level",
    description: "Credit: Alaska National Guard",
  },
  {
    src: "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/flood-impacts/2025_impacts1.png",
    title: "August 13th 2025 - 16.67 ft Mendenhall Lake Level",
    description: "Credit: City and Borough of Juneau",
  },
  {
    src: "https://juneauflood-basin-images.s3.us-west-2.amazonaws.com/flood-impacts/2025_impacts2.png",
    title: "August 13th, 2025 - 16.67 ft Mendenhall Lake Level",
    description: "Credit: City and Borough of Juneau",
  },
];

const cardData = [
  {
    title: "Flood Maps",
    link: "/flood-map",
    image: "/images/flood-map.jpg",
    description:
      "View the glacial flood zone at various lake levels, with or without HESCO barriers",
  },
  {
    title: "Flood Forecasting",
    link: "/flood-forecast",
    image: "/images/flood-forecast.jpg",
    description:
      "Flood forecasts based on Suicide Basin & Mendenhall Lake water levels",
  },
  {
    title: "Flood Events",
    link: "/flood-events",
    image: "/images/flood-events.jpg",
    description:
      "Historical data from outburst floods, including peak water level and streamflow",
  },
  {
    title: "Suicide Basin",
    link: "/suicide-basin",
    image: "/images/suicide-basin.jpg",
    description:
      "Learn how Suicide Basin was formed and how it releases outburst floods",
  },
];

const faqData = [
  {
    question: "What are glacial lake outburst floods (GLOFs)?",
    answer:
      "Glacial lake outburst floods (GLOFs) happen when ice-dammed or moraine-dammed lakes release large volumes of water to downstream river systems.",
  },
  {
    question: "Why are GLOFs occurring annually in Suicide Basin?",
    answer:
      "Mendenhall Glacier acts as a dam that impounds melt water in Suicide Basin. Each summer, water fills the basin until it can lift the glacier and find a drainage channel underneath to flow into Mendenhall Lake. The release of water from Suicide Basin can cause flooding downstream in Mendenhall Lake and Mendenhall River.",
  },
  {
    question:
      "How does 1 ft of additional water level in Mendenhall Lake increase the level of flood waters downstream in Mendenhall Valley?",
    answer:
      "Changes in the water level in Mendenhall Lake are not equivalent to the changes in the level of flood waters downstream. Moderate increases in the water level in Mendenhall Lake can dramatically increase the volume of water flowing in Mendenhall River. For example, in the 2023 outburst flood, the water level in Mendenhall Lake peaked at 15 ft, which resulted in a streamflow of 34,200 cubic feet per second (cfs) in Mendenhall River. In 2024, the lake level peaked at 16 ft during the flood, which resulted in a streamflow of 42,700 cfs. Thus, the increase in lake level from 15 ft to 16 ft caused streamflow to increase by 25%. This substantial increase in streamflow is why the 1 ft increase in lake level caused the flood water peak in the valley to increase by multiple feet in 2024.",
  },
  {
    question:
      "How long does it take the water from Suicide Basin to reach Mendenhall Valley?",
    answer:
      "Once water starts flowing out of Suicide Basin underneath Mendenhall Glacier, it takes around 40 hours for the flood peak to reach Mendenhall Valley.",
  },
  {
    question:
      "How will the recession of Mendenhall Glacier affect glacial lake outburst floods from Suicide Basin?",
    answer:
      "The thinning and retreat of Mendenhall Glacier will decrease the threat of outburst floods from Suicide Basin in coming decades. Suicide Basin will no longer be capable of producing outburst floods once the glacier retreats above the opening of the basin. In the meantime, it is possible that the basin will expand outward into the Mendenhall Glacier, increasing its water holding capacity for a period of years before it eventually decreases and disappears.",
  },
  {
    question: "How long will the GLOFs occur at Mendenhall glacier?",
    answer:
      "GLOFs will continue to occur as long as Mendenhall Glacier has enough ice to form a dam at the entrance to Suicide Basin. Based on current rates of thinning and retreat it is likely that the Mendenhall Glacier will retreat up to Suicide Basin in the next 25-35 years. It is also possible that new ice-marginal basins could form higher up Mendenhall Glacier in the future.",
  },
  {
    question: "What are the scenarios for a flood release from Suicide Basin?",
    answer: (
      <>
        <p>
          There are three primary scenarios describing how much water drains
          from the glacier-dammed lake during a Glacial Lake Outburst Flood
          (GLOF):
        </p>
        <ol>
          <li>
            <strong>Full Volume Release</strong>: All water in the lake drains
            in a single event, even if the lake wasn’t at full capacity
            beforehand.
          </li>
          <li>
            <strong>Full Basin Release</strong>: The lake was at full capacity
            (equal to the dam height) and then drained almost completely.
          </li>
          <li>
            <strong>Partial Basin Release</strong>: Only part of the water
            drains during the flood; a significant volume remains in the lake
            afterward.
          </li>
        </ol>
      </>
    ),
  },
  {
    question:
      "How much does the water level in Mendenhall Lake change during a GLOF?",
    answer: (
      <>
        <p>
          Large outburst floods such as the August, 2024 event can raise the
          water level in Mendenhall Lake by 10 ft or more in the course of a few
          days. During smaller GLOFs, such as the July 2015 event, the rise in
          the lake level can be much smaller (~2 ft).
        </p>
      </>
    ),
  },
];

const resourceLinks = [
  {
    title: "City & Borough of Juneau",
    url: "https://juneau.org/emergency/emergency-flood-response",
    color: "#30964b",
  },
  {
    title: "National Weather Service",
    url: "https://www.weather.gov/safety/flood",
    color: "#1f77b4",
  },
  {
    title: "State of Alaska",
    url: "https://ready.alaska.gov/Flood",
    color: "#9467bd",
  },
];

const educationLinks = [
  {
    title: "Story Map: Understand the Mendenhall GLOF",
    url: "https://storymaps.arcgis.com/stories/72cef125bbfa4f989356bf9350cd5d63",
    color: "#1f77b4",
  },
  {
    title: "Story Map: How Suicide Basin is Monitored",
    url: "https://storymaps.arcgis.com/stories/2ad8631c1abb4dfab3ec92b34f27ba8c",
    color: "#1f77b4",
  },
  {
    title: "2024 Suicide Basin Flood Report",
    url: "https://www.weather.gov/media/ajk/suicideBasin/08_2024%20-%20Mendenhall%20River%20Flooding.pdf",
    color: "#1f77b4",
  },
];

const Home = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAllFAQs, setShowAllFAQs] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const previewFAQCount = 4;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = (e) => setIsMobile(e.matches);
    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      toggleFAQ(index);
    }
  };

  // Track current slide index
  const [, setCurrentSlide] = useState(0);

  // Custom Arrow Components
  const NextArrow = ({ onClick }) => (
    <div className="slider-arrow2 next" onClick={onClick}>
      <FaArrowRight />
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div className="slider-arrow2 prev" onClick={onClick}>
      <FaArrowLeft />
    </div>
  );

  // Slider settings with custom arrows
  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (index) => setCurrentSlide(index),
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="home-container">
      <div className="card-grid">
        {cardData
          .filter((card) => !card.mobileOnly || isMobile)
          .map((card, index) => {
            const isExternal = /^https?:\/\//i.test(card.link);
            const CardInner = (
              <>
                <img src={card.image} alt={card.title} className="card-image" />
                <div className="card-overlay">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                </div>
              </>
            );
            return isExternal ? (
              <a
                key={index}
                href={card.link}
                className="card"
                target="_blank"
                rel="noopener noreferrer"
              >
                {CardInner}
              </a>
            ) : (
              <NavLink to={card.link} key={index} className="card">
                {CardInner}
              </NavLink>
            );
          })}
      </div>

      <div className="home-intro">
        <div className="home-about-card">
          <h3>About</h3>
          <p>
            This dashboard was created and is maintained by the University of
            Alaska Southeast in partnership with the Alaska Climate Adaptation
            Science Center. The page provides an interactive view of the{" "}
            <a
              href="https://juneau.org/engineering-public-works/flood-inundation-maps"
              target="_blank"
              rel="noopener noreferrer"
            >
              flood inundation maps
            </a>{" "}
            contracted by the City and Borough of Juneau for the Mendenhall
            Valley. It also contains information about glacial lake outburst
            floods (GLOFs) from Suicide Basin. Use the cards above to explore
            flood maps, flood forecasting, past outburst flood events, and
            understand how outburst floods originate from Suicide Basin and
            impact the Juneau area. This website is for planning purposes only.
            For the National Weather Service monitoring page click below.
          </p>
          <div className="button-wrapper">
            <a
              href="https://www.weather.gov/ajk/suicideBasin"
              target="_blank"
              rel="noopener noreferrer"
              className="home-button"
            >
              NWS Monitoring Page
            </a>
          </div>
        </div>

        <div className="home-flood-card">
          <h3>Flood Impacts</h3>

          <div className="impact-slider">
            <Slider {...settings}>
              {images.map((item, index) => (
                <div key={index} className="slide-wrapper">
                  {item.src.endsWith(".mp4") ? (
                    <video
                      className="impact-media"
                      src={item.src}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="impact-media"
                      loading="lazy"
                    />
                  )}
                  <div className="slide-caption">
                    <h4>{item.title}</h4>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <p></p>
        </div>

        <div className="resources-wrapper">
          <div className="home-about-card">
            <h3>Flood Safety Resources</h3>
            <ul className="resource-list">
              {resourceLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                    style={{ borderLeftColor: link.color }}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-about-card">
            <h3>Educational Resources</h3>
            <ul className="resource-list">
              {educationLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                    style={{ borderLeftColor: link.color }}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="home-about-card">
          <h3>Frequently Asked Questions</h3>
          {faqData
            .slice(0, showAllFAQs ? faqData.length : previewFAQCount)
            .map((faq, index) => {
              const isPreview = !showAllFAQs && index >= previewFAQCount;
              return (
                <div
                  key={index}
                  className={`faq-row ${openIndex === index ? "open" : ""}`}
                  onClick={() => toggleFAQ(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={openIndex === index}
                  style={{
                    opacity: isPreview ? 0.7 : 1,
                    transition: "opacity 0.3s ease-in-out",
                  }}
                >
                  <div className="faq-question">
                    {faq.question}
                    <span
                      className={`faq-toggle-icon ${openIndex === index ? "rotated" : ""}`}
                    >
                      {openIndex === index ? "−" : "+"}
                    </span>
                  </div>
                  <div
                    className={`faq-answer ${openIndex === index ? "show" : ""}`}
                  >
                    {faq.answer}
                  </div>
                  {index !== faqData.length - 1 && (
                    <hr className="faq-divider" />
                  )}
                </div>
              );
            })}
          {faqData.length > previewFAQCount && (
            <div className="button-wrapper">
              <button
                className="faq-button"
                onClick={() => setShowAllFAQs(!showAllFAQs)}
              >
                {showAllFAQs ? "Show Less" : "Show More"}
              </button>
            </div>
          )}
        </div>

        <div className="home-about-card">
          <h3>Contact Us</h3>
          <p>
            This dashboard is maintained by the University of Alaska Southeast.
            For questions or comments, please contact:
            <br />
            <strong>UAS-GLOF-info@alaska.edu</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

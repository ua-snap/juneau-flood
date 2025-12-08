import React, { useState } from "react";
import Slider from "react-slick";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import "./FloodImages.css"; // Import styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const FloodImage = () => {
  const images = [
    {
      src: "https://www.weather.gov/images/ajk/suicideBasin/archive/2022/SuicideBasinLoop_Raw_2022_Compressed.gif",
      title: "2022",
    },
    {
      src: "https://www.weather.gov/images/ajk/suicideBasin/archive/2023/SuicideBasinLoop_Raw_2023_Compressed.gif",
      title: "2023",
    },
    {
      src: "https://www.climate.gov/sites/default/files/2024-08/SuicideBasinOutburst2024.gif",
      title: "2024",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false); // Assuming static content, but keeping this in case of dynamic loading later

  // Custom Arrow Components
  const NextArrow = ({ onClick }) => (
    <div className="slider-arrow next" onClick={onClick}>
      <FaArrowRight />
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div className="slider-arrow prev" onClick={onClick}>
      <FaArrowLeft />
    </div>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (index) => setCurrentSlide(index),
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="flood-image-container">
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <h3 className="flood-image-title">
            {" "}
            Historical Suicide Basin Flood Season Timelapses
          </h3>
          <h4 className="flood-image-subtitle">
            Select Arrows to See Annual Flood Events
          </h4>

          <div className="glof-timelapse-content">
            <div className="glof-timelapse-slider">
              <Slider {...settings}>
                {images.map((image, index) => (
                  <div key={index} className="glof-slide">
                    <img
                      src={image.src}
                      alt={image.title}
                      className="glof-timelapse-image"
                    />
                  </div>
                ))}
              </Slider>
            </div>
            <div className="glof-image-card">
              <h3>{images[currentSlide].title}</h3>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloodImage;

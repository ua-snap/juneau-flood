// LakeGages.js
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import mapboxgl from "mapbox-gl";
import "./LakeGages.css";

const GAGE_SITES = [
  {
    id: "15052500",
    name: "Mendenhall Lake Level",
    lat: 58.4293972,
    lng: -134.5745592,
  },
  {
    id: "1505248590",
    name: "Suicide Basin Level",
    lat: 58.4595556,
    lng: -134.5038333,
  },
];

const formatAlaskaTime = (iso) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Anchorage",
    timeStyle: "short",
    dateStyle: "medium",
  }).format(new Date(iso));
};

const fetchGageLevel = async (gage) => {
  try {
    const res = await fetch(
      `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gage.id}&parameterCd=00065&siteStatus=active`
    );
    if (!res.ok) throw new Error();

    const data = await res.json();
    const values = data?.value?.timeSeries?.[0]?.values?.[0]?.value;

    if (!values || values.length === 0) {
      return {
        ...gage,
        value: "N/A",
        dateTime: "N/A",
        status: "Offline",
      };
    }

    const latest = values[values.length - 1];

    return {
      ...gage,
      value: parseFloat(latest.value) > 0 ? latest.value : "N/A",
      dateTime: formatAlaskaTime(latest.dateTime),
      status: "Online",
    };
  } catch {
    return {
      ...gage,
      value: "N/A",
      dateTime: "N/A",
      status: "Offline",
    };
  }
};

const LakeGages = forwardRef(({ mapRef }, ref) => {
  const [gageObjects, setGageObjects] = useState({});

  const updatePopup = (popup, gageData) => {
    popup.setHTML(`
      <b>${gageData.name}</b><br/>
      Level: <strong>${gageData.value} ft</strong><br/>
      <span style="font-size: .75rem">${gageData.dateTime}</span>
    `);
  };

  const createMarkers = (map) => {
    const markers = {};

    GAGE_SITES.forEach((gage) => {
      const el = document.createElement("div");
      el.className = "usgs-marker";

      const popup = new mapboxgl.Popup({
        offset: 15,
        closeButton: false,
        closeOnClick: false,
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([gage.lng, gage.lat])
        .addTo(map);

      el.addEventListener("mouseenter", () => {
        popup.setLngLat([gage.lng, gage.lat]);
        popup.setHTML(`<b>${gage.name}</b><br/>Loading…`);
        popup.addTo(map);
        fetchGageLevel(gage).then((data) => updatePopup(popup, data));
      });

      el.addEventListener("click", () => {
     if (gage.id === "15052500") {
     window.open(
      "https://waterdata.usgs.gov/monitoring-location/USGS-15052500/#dataTypeId=continuous-00065--1654777834&period=P7D&showFieldMeasurements=true",
      "_blank",
      "noopener,noreferrer"
    );
    }
      if (gage.id === "1505248590") {
    window.open(
      "https://water.noaa.gov/gauges/JSBA2",
      "_blank",
      "noopener,noreferrer"
    );
  }
});

      el.addEventListener("mouseleave", () => popup.remove());

      markers[gage.id] = { marker, popup, gage };
    });

    setGageObjects(markers);
  };

  useEffect(() => {
    if (!Object.keys(gageObjects).length) return;

    const interval = setInterval(() => {
      Object.values(gageObjects).forEach(({ popup, gage }) => {
        fetchGageLevel(gage).then((data) => updatePopup(popup, data));
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [gageObjects]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const init = () => createMarkers(map);

    if (map.isStyleLoaded()) init();
    else map.once("load", init);
  }, [mapRef.current]);

useImperativeHandle(ref, () => ({
  async showPopupForGage(id) {
    const obj = gageObjects[id];
    if (!obj) return;

    const { popup, gage, marker } = obj;

    const el = marker.getElement();
    el.classList.add("usgs-marker--active");

    popup.setLngLat([gage.lng, gage.lat]);
    popup.setHTML(`<b>${gage.name}</b><br/>Loading…`);
    popup.addTo(mapRef.current);

    const data = await fetchGageLevel(gage);
    updatePopup(popup, data);
  },

  hidePopupForGage(id) {
    const obj = gageObjects[id];
    if (!obj) return;

    const { popup, marker } = obj;
    const el = marker.getElement();

    el.classList.remove("usgs-marker--active");
    popup.remove();
  },

  }));

  return null;
});

export default LakeGages;

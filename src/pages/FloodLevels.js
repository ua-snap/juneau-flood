import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "./FloodLevels.css";
import FloodStageMenu from "./FloodStageMenu";
import FloodStepper from "./FloodStepper";
import FloodInfoPopup from "./FloodInfoPopup";
import { getFloodStage } from "./utils/floodStages";
import Search from "./Search.js";
import FloodRecordsBar from "./FloodKey.js";
import FloodCardMobile from "./FloodCardMobile";
import AboutMap from "./AboutMap";

export const parcelTileset = {
  url: "mapbox://mapfean.74ijmvrj",
  sourceLayer: "juneau_props",
  sourceId: "juneau_parcels",
};

const customColors = [
  "#87c210",
  "#c3b91e",
  "#e68a1e",
  "#31a354",
  "#3182bd",
  "#124187",
  "#d63b3b",
  "#9b3dbd",
  "#d13c8f",
  "#c2185b",
  "#756bb1",
  "#f59380",
  "#ba4976",
];

const FloodLevels = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [selectedFloodLevel, setSelectedFloodLevel] = useState(9);
  const [menuOpen, setMenuOpen] = useState(() => window.innerWidth >= 800);
  const [hescoMode, setHescoMode] = useState(false);
  const [errorMessage] = useState("");
  const [waterLevels, setWaterLevels] = useState([]);
  const [loadingLayers, setLoadingLayers] = useState(false);
  const popupRef = useRef(null);
  const hoverHandlersRef = useRef({ move: null, out: null });
  const [mapReady, setMapReady] = useState(false);
  const [gageMarkers, setGageMarkers] = useState([]);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const setupHoverPopup = useCallback((activeLayerId) => {
    const map = mapRef.current;
    if (!map || !activeLayerId) return;

    if (!map.getLayer(activeLayerId)) {
      setTimeout(() => setupHoverPopup(activeLayerId), 250);
      return;
    }

    if (hoverHandlersRef.current.move) {
      map.off("mousemove", hoverHandlersRef.current.move);
      hoverHandlersRef.current.move = null;
    }
    if (hoverHandlersRef.current.out) {
      map.off("mouseout", hoverHandlersRef.current.out);
      hoverHandlersRef.current.out = null;
    }

    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: "hover-popup",
      });
    }

    let hoveredParcelId = null;

    const moveHandler = (e) => {
      const floodFeatures = map.queryRenderedFeatures(e.point, {
        layers: [activeLayerId],
      });
      const floodFeature = floodFeatures && floodFeatures[0];

      const parcelFeatures = map.queryRenderedFeatures(e.point, {
        layers: ["parcels-fill"],
      });
      const parcelFeature = parcelFeatures && parcelFeatures[0];

      let address = "Unknown";
      if (parcelFeature) {
        const parcelProps = parcelFeature.properties || {};
        address = parcelProps.site_addrs ?? "Unknown";

        const taxId = parcelProps.tax_id ?? "";
        if (hoveredParcelId !== taxId) {
          hoveredParcelId = taxId;
          map.setFilter("parcels-highlight", ["==", "tax_id", taxId]);
        }
      } else {
        hoveredParcelId = null;
        map.setFilter("parcels-highlight", ["==", "tax_id", ""]);
      }

      if (floodFeature) {
        const floodProps = floodFeature.properties || {};
        const depth = floodProps.DN ?? floodProps.depth ?? "Unknown";

        const addressLine =
          address && address !== "Unknown"
            ? `<br/><b>Address:</b> ${address}`
            : "";

        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML(
            `
    <div>
      <p><b>Water Depth: </b>${depth} ft</p>
      ${addressLine ? `<p><b>Address:</b> ${address}</p>` : ""}
    </div>
  `,
          )
          .addTo(map);
        map.getCanvas().style.cursor = "crosshair";
      } else if (parcelFeature) {
        if (address && address !== "Unknown") {
          popupRef.current
            .setLngLat(e.lngLat)
            .setHTML(
              `
    <div>
      <p><b>Address:</b> ${address}</p>
    </div>
  `,
            )
            .addTo(map);
        } else {
          popupRef.current.remove();
        }
        map.getCanvas().style.cursor = "crosshair";
      } else {
        popupRef.current.remove();
        map.getCanvas().style.cursor = "";
      }
    };

    const outHandler = () => {
      popupRef.current.remove();
      map.getCanvas().style.cursor = "";
      hoveredParcelId = null;
      map.setFilter("parcels-highlight", ["==", "tax_id", ""]);
    };

    map.on("mousemove", moveHandler);
    map.on("mouseout", outHandler);

    hoverHandlersRef.current.move = moveHandler;
    hoverHandlersRef.current.out = outHandler;
  }, []);

  const tilesetMap = {
    base: {
      64: "ccav82q0",
      65: "3z7whbfp",
      66: "8kk8etzn",
      67: "akq41oym",
      68: "5vsqqhd8",
      69: "awu2n97c",
      70: "a2ttaa7t",
      71: "0rlea0ym",
      72: "44bl8opr",
      73: "65em8or7",
      74: "9qrkn8pk",
      75: "3ktp8nyu",
      76: "avpruavl",
    },
    hesco: {
      70: "cjs05ojz",
      71: "1z6funv6",
      72: "9kmxxb2g",
      73: "4nh8p66z",
      74: "cz0f7io4",
    },
  };

  const updateFloodLayers = (mode) => {
    setLoadingLayers(true);
    const map = mapRef.current;
    const validLevels = Array.from({ length: 13 }, (_, i) => 64 + i);
    const visibleLayerId = `flood${64 + (selectedFloodLevel - 8)}-fill`;

    validLevels.forEach((level) => {
      const layerId = `flood${level}-fill`;
      const sourceId = `flood${level}`;
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    });

    let loadedCount = 0;

    [...validLevels].reverse().forEach((level) => {
      const floodId = `flood${level}`;
      const fillId = `${floodId}-fill`;
      const visible = floodId === `flood${64 + (selectedFloodLevel - 8)}`;
      const tilesetId = mode ? tilesetMap.hesco[level] : tilesetMap.base[level];

      if (mode && !tilesetId) {
        loadedCount++;
        if (loadedCount === validLevels.length) {
          setLoadingLayers(false);
          map.once("idle", () => setupHoverPopup(visibleLayerId));
        }
        return;
      }

      const sourceLayerName = mode ? `flood${level}` : String(level);

      map.addSource(floodId, {
        type: "vector",
        url: `mapbox://mapfean.${tilesetId}`,
      });

      map.addLayer({
        id: fillId,
        type: "fill",
        source: floodId,
        "source-layer": sourceLayerName,
        layout: { visibility: visible ? "visible" : "none" },
        paint: {
          "fill-color": customColors[level - 64],
          "fill-opacity": 0.5,
        },
      });

      loadedCount++;
      if (loadedCount === validLevels.length) {
        setLoadingLayers(false);
        if (selectedFloodLevel !== "All") {
          map.once("idle", () => setupHoverPopup(visible ? fillId : null));
        }
      }
    });
  };

  const toggleHescoMode = () => {
    setHescoMode((prev) => {
      const newMode = !prev;
      if (!newMode && window.innerWidth < 768) {
        window.location.reload();
      } else {
        updateFloodLayers(newMode);
        const visibleLayerId = `flood${64 + (selectedFloodLevel - 8)}-fill`;
        setTimeout(() => setupHoverPopup(visibleLayerId), 300);
      }
      return newMode;
    });
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [-134.572823, 58.397411],
        zoom: 11,
      });

      mapRef.current.on("load", () => {
        updateFloodLayers(hescoMode);
        const map = mapRef.current;
        const initialLayerId = `flood${64 + (selectedFloodLevel - 8)}-fill`;
        map.once("idle", () => setupHoverPopup(initialLayerId));
        map.getCanvas().style.cursor = "crosshair";

        mapRef.current.addSource(parcelTileset.sourceId, {
          type: "vector",
          url: parcelTileset.url,
        });

        mapRef.current.addLayer({
          id: "parcels-fill",
          type: "fill",
          source: parcelTileset.sourceId,
          "source-layer": parcelTileset.sourceLayer,
          paint: {
            "fill-color": "#000000",
            "fill-opacity": 0,
          },
        });

        mapRef.current.addLayer({
          id: "parcels-outline",
          type: "line",
          source: parcelTileset.sourceId,
          "source-layer": parcelTileset.sourceLayer,
          paint: {
            "line-color": "#000000",
            "line-opacity": 0,
          },
        });

        mapRef.current.addLayer({
          id: "parcels-highlight",
          type: "line",
          source: parcelTileset.sourceId,
          "source-layer": parcelTileset.sourceLayer,
          paint: {
            "line-color": "blue",
            "line-width": 2,
            "line-opacity": 0.8,
          },
          filter: ["==", "tax_id", ""],
        });

        const markerCoordinates = [
          {
            id: "15052500",
            lat: 58.4293972,
            lng: -134.5745592,
            name: "USGS Mendenhall Lake Level Gage",
            link: "https://waterdata.usgs.gov/monitoring-location/15052500/",
          },
          {
            id: "1505248590",
            lat: 58.4595556,
            lng: -134.5038333,
            name: "USGS Suicide Basin Level Gage",
            link: "https://waterdata.usgs.gov/monitoring-location/1505248590/",
          },
        ];

        const markers = markerCoordinates.map((coord) => {
          const el = document.createElement("div");
          el.className = "usgs-marker";
          const marker = new mapboxgl.Marker(el)
            .setLngLat([coord.lng, coord.lat])
            .addTo(mapRef.current);
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<b>${coord.name}</b><br/>Loading…`,
          );
          marker.setPopup(popup);
          return { ...coord, marker, popup };
        });
        setGageMarkers(markers);

        setMapReady(true);
      });
    }
  }, [hescoMode, setupHoverPopup]);

  useEffect(() => {
    if (hescoMode && (selectedFloodLevel < 14 || selectedFloodLevel > 18)) {
      setHescoMode(false);
      updateFloodLayers(false);
    }
  }, [selectedFloodLevel, hescoMode]);

  const handleFloodLayerChange = useCallback(() => {
    const layerId = `flood${64 + (selectedFloodLevel - 8)}-fill`;
    if (mapRef.current?.getLayer(layerId)) {
      setupHoverPopup(layerId);
    }
  }, [selectedFloodLevel, setupHoverPopup]);

  useEffect(() => {
    const fetchWaterLevels = async () => {
      const gages = [{ id: "15052500", name: "Mendenhall Lake Stage Level" }];
      try {
        const fetchedLevels = await Promise.all(
          gages.map(async (gage) => {
            try {
              const response = await fetch(
                `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gage.id}&parameterCd=00065&siteStatus=active`,
              );
              if (!response.ok)
                throw new Error(`HTTP status ${response.status}`);
              const data = await response.json();
              const values = data?.value?.timeSeries?.[0]?.values?.[0]?.value;
              if (values?.length > 0) {
                const latest = values[values.length - 1];
                const alaskaTime = new Intl.DateTimeFormat("en-US", {
                  timeZone: "America/Anchorage",
                  timeStyle: "short",
                  dateStyle: "medium",
                }).format(new Date(latest.dateTime));
                return {
                  id: gage.id,
                  name: gage.name,
                  value: parseFloat(latest.value) > 0 ? latest.value : "N/A",
                  dateTime: alaskaTime,
                  status: "Online",
                };
              }
              return {
                id: gage.id,
                name: gage.name,
                value: "N/A",
                dateTime: "N/A",
                status: "Offline",
              };
            } catch {
              return {
                id: gage.id,
                name: gage.name,
                value: "N/A",
                dateTime: "N/A",
                status: "Offline",
              };
            }
          }),
        );
        setWaterLevels(fetchedLevels);
      } catch (error) {
        console.error("Error fetching water levels:", error);
      }
    };
    fetchWaterLevels();
    const interval = setInterval(fetchWaterLevels, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapReady || gageMarkers.length === 0 || waterLevels.length === 0)
      return;

    gageMarkers.forEach(({ id, popup }) => {
      const level = waterLevels.find((l) => l.id === id);
      if (level) {
        popup.setHTML(`
        <a href="https://waterdata.usgs.gov/monitoring-location/${id}/" target="_blank" rel="noopener noreferrer">  
          <b>${level.name}</b><br/>      </a>
          Current Level: <strong>${level.value} ft</strong><br/>
          <small>${level.dateTime}</small>
          

      `);
      } else {
        popup.setHTML(`
        <div style="top: 15px;">
        <a href="https://waterdata.usgs.gov/monitoring-location/${id}/" target="_blank" rel="noopener noreferrer">
          <b>USGS Suicide Basin Gage</b><br/>        </a>
          Current Level: <strong>OFFLINE</strong><br/>

      `);
      }
    });
  }, [mapReady, gageMarkers, waterLevels]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="main-content floodlevels-page">
      <FloodInfoPopup />
      <div
        id="map"
        ref={mapContainerRef}
        style={{ height: "110vh", width: "110vw" }}
      />

      <div className="flood-stepper-container">
        <FloodStepper
          mapRef={mapRef}
          selectedFloodLevel={selectedFloodLevel}
          setSelectedFloodLevel={setSelectedFloodLevel}
          isMenuHidden={!menuOpen}
          hideOnDesktop={true}
          hescoMode={hescoMode}
          onFloodLayerChange={handleFloodLayerChange}
        />
      </div>

      {menuOpen && (
        <div
          id="controls"
          style={{
            position: "absolute",
            top: "160px",
            left: "15px",
            zIndex: 1,
          }}
        >
          {errorMessage && (
            <div style={{ color: "red", marginTop: "10px" }}>
              {errorMessage}
            </div>
          )}
          <FloodStepper
            mapRef={mapRef}
            selectedFloodLevel={selectedFloodLevel}
            setSelectedFloodLevel={setSelectedFloodLevel}
            isMenuHidden={!menuOpen}
            hideOnDesktop={false}
            hescoMode={hescoMode}
            onFloodLayerChange={handleFloodLayerChange}
          />
          <button
            data-tooltip="HESCO maps are only available for 14ft - 18ft & assume fully functional barriers"
            onClick={() => {
              if (selectedFloodLevel >= 14) toggleHescoMode();
            }}
            className={`hesco-toggle-button ${
              hescoMode ? "hesco-on" : "hesco-off"
            }`}
            disabled={
              loadingLayers ||
              selectedFloodLevel < 14 ||
              selectedFloodLevel > 18
            }
          >
            {loadingLayers
              ? "Loading HESCO Data…"
              : hescoMode
                ? "HESCO Barriers ON"
                : "HESCO Barriers OFF (14-18ft)"}
          </button>
          <FloodStageMenu
            setFloodLevelFromMenu={setSelectedFloodLevel}
            onFloodLayerChange={() =>
              setupHoverPopup(`flood${64 + (selectedFloodLevel - 8)}-fill`)
            }
          />
          <div style={{ marginTop: "20px" }}>
            {waterLevels.map((level) => {
              const currentStage = getFloodStage(level.value);
              return (
                <div key={level.id} className="level-card">
                  <p>
                    <a style={{ color: "white" }}>Lake Level:</a>
                    <strong>{` ${level.value} ft`}</strong>
                  </p>
                  <p>
                    <span style={{ color: "white" }}>
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          lineHeight: "1px",
                        }}
                      >
                        {currentStage?.label || "OFFLINE"}
                      </span>
                    </span>
                  </p>
                  <p style={{ fontSize: "0.66rem", lineHeight: "2px" }}>
                    {level.dateTime || "N/A"}
                  </p>
                </div>
              );
            })}
          </div>
          <AboutMap />
        </div>
      )}

      <FloodRecordsBar />
      <Search mapRef={mapRef} waterLevels={waterLevels} />
      <FloodCardMobile waterLevels={waterLevels} />
      <button
        title="HESCO maps are only available for 14ft - 18ft & assume fully functional barriers"
        onClick={() => {
          if (selectedFloodLevel >= 14) toggleHescoMode();
        }}
        className={`hesco-toggle-button-mobile ${
          hescoMode ? "hesco-on" : "hesco-off"
        }`}
        disabled={
          loadingLayers || selectedFloodLevel < 14 || selectedFloodLevel > 18
        }
      >
        {loadingLayers
          ? "Loading HESCO Data…"
          : hescoMode
            ? "HESCO Barriers ON"
            : "HESCO Barriers OFF (14-18ft)"}
      </button>

      {loadingLayers && (
        <div className="map-loading-overlay">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
};

export default FloodLevels;

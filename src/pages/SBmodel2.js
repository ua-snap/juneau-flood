import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./SBmodel2.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function Topographic3DTerrainMap() {
  const mapContainer = useRef(null);
  const animationRef = useRef(null);
  const wrapperRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);

  // state for location
  const [location, setLocation] = useState({
    modelOrigin: [-134.575402, 58.393573],
    orbitCenter: [-134.575402, 58.393573],
  });

  useEffect(() => {
    const { modelOrigin, orbitCenter } = location;
    const modelAltitude = 30;

    // pick zoom level depending on screen width
    const initialZoom = window.innerWidth < 915 ? 12.2 : 12.7;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: modelOrigin,
      zoom: initialZoom,
      pitch: 65,
      bearing: 0,
      antialias: true,
    });

    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 12,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 0.9 });

      map.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.3,
        range: [0.5, 15],
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.15,
      });

      map.setLights([
        {
          id: "sunlight",
          type: "directional",
          color: "white",
          intensity: 0.8,
          position: [1.5, 90, 80],
        },
      ]);

      const mercatorCoord = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude,
      );
      const modelTransform = {
        translateX: mercatorCoord.x,
        translateY: mercatorCoord.y,
        translateZ: mercatorCoord.z,
        scale: mercatorCoord.meterInMercatorCoordinateUnits(),
      };

      const customLayer = {
        id: "3d-model",
        type: "custom",
        renderingMode: "3d",
        onAdd: function (map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(0, 100, 100).normalize();
          this.scene.add(directionalLight);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
          this.scene.add(ambientLight);

          const loader = new GLTFLoader();
          loader.load(
            "/models/suicide_basin.glb",
            (gltf) => {
              this.model = gltf.scene;
              this.model.rotation.set(0, 0, Math.PI / 8);

              const box = new THREE.Box3().setFromObject(this.model);
              const size = new THREE.Vector3();
              box.getSize(size);

              const maxDim = Math.max(size.x, size.y, size.z);
              const targetSize = 2000;
              const scale = targetSize / maxDim;

              this.model.scale.set(scale, scale, scale);
              this.scene.add(this.model);
            },
            undefined,
            (error) => console.error("❌ Error loading GLB:", error),
          );

          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
          });
          this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(
              modelTransform.translateX,
              modelTransform.translateY,
              modelTransform.translateZ,
            )
            .scale(
              new THREE.Vector3(
                modelTransform.scale,
                -modelTransform.scale,
                modelTransform.scale,
              ),
            );

          this.camera.projectionMatrix = m.multiply(l);
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
        },
      };

      map.addLayer(customLayer);

      let angle = 0;
      const speedFactor = 9300;

      function animateCamera(timestamp) {
        if (!paused) {
          angle = timestamp / speedFactor;
          const radius = 0.01;
          const lng = orbitCenter[0] + radius * Math.cos(angle);
          const lat = orbitCenter[1] + radius * Math.sin(angle);

          map.setCenter([lng, lat]);
          map.setBearing((angle * 180) / Math.PI);
          map.setZoom(13);
        }
        animationRef.current = requestAnimationFrame(animateCamera);
      }
      animateCamera(0);
    });

    return () => {
      cancelAnimationFrame(animationRef.current);
      map.remove();
    };
  }, [paused, location]);

  // === Fullscreen toggle ===
  const toggleFullscreen = () => {
    const el = wrapperRef.current;

    if (!el) return;

    if (!document.fullscreenElement && !isFakeFullscreen) {
      // Try real fullscreen
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      } else {
        // Fallback for iOS Safari
        el.style.position = "fixed";
        el.style.top = 0;
        el.style.left = 0;
        el.style.width = "100vw";
        el.style.height = "100vh";
        el.style.zIndex = 9999;
        setIsFakeFullscreen(true);
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      if (isFakeFullscreen) {
        el.removeAttribute("style");
        setIsFakeFullscreen(false);
      }
    }
  };

  return (
    <div className="map-wrapper2" ref={wrapperRef}>
      <div ref={mapContainer} className="map-container2" />

      {/* Overlay Data Box */}
      <div className="data-box">
        <h4>Suicide Basin for Scale</h4>
        <p>
          Model shows Suicide Basin on <strong>8/13/2025</strong>: Empty after
          the <em>largest flood event</em> on record.
        </p>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="pause-btn" onClick={() => setPaused((p) => !p)}>
          {paused ? "▶ Resume Orbit" : "⏸ Pause Orbit"}
        </button>

        <button
          onClick={() =>
            setLocation({
              modelOrigin: [-134.575402, 58.393573],
              orbitCenter: [-134.575402, 58.393573],
            })
          }
        >
          Mendenhall Valley
        </button>

        <button
          onClick={() =>
            setLocation({
              modelOrigin: [-134.4197, 58.3019],
              orbitCenter: [-134.4197, 58.3019],
            })
          }
        >
          Downtown Juneau
        </button>
      </div>

      {/* Fullscreen Button */}
      <button className="fullscreen-btn" onClick={toggleFullscreen}>
        ⛶ Fullscreen
      </button>
    </div>
  );
}

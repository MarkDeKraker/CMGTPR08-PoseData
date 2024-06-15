import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { GoogleMap, LoadScript, useGoogleMap } from "@react-google-maps/api";

function App() {
  const [count, setCount] = useState(0);
  const mapRef = useRef(null);

  const containerStyle = {
    width: "1000px",
    height: "1000px",
  };

  const center = {
    lat: 51.9173975,
    lng: 4.4849059,
  };

  return (
    <>
      <div>
        <div>
          <h1 className="font-medium text-2xl">
            Google maps bedienen met je handen - Mark de Kraker
          </h1>
        </div>
        <div className="grid grid-cols-2">
          <div>
            <video></video>
          </div>
          <div>
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={18}
                ref={mapRef}
              >
                <MapControls />
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
}

const MapControls = () => {
  const map = useGoogleMap();

  const panLeft = () => {
    if (map) {
      const center = map.getCenter();
      if (center != undefined) {
        const lat = center.lat();
        const lng = center.lng();
        map.panTo({ lat, lng: lng - 0.00125 });
      }
    }
  };

  const panRight = () => {
    if (map) {
      const center = map.getCenter();
      if (center != undefined) {
        const lat = center.lat();
        const lng = center.lng();
        map.panTo({ lat, lng: lng + 0.00125 });
      }
    }
  };

  const panUp = () => {
    if (map) {
      const center = map.getCenter();
      if (center != undefined) {
        const lat = center.lat();
        const lng = center.lng();
        map.panTo({ lat: lat + 0.00125, lng });
      }
    }
  };

  const panDown = () => {
    if (map) {
      const center = map.getCenter();
      if (center != undefined) {
        const lat = center.lat();
        const lng = center.lng();
        map.panTo({ lat: lat - 0.00125, lng });
      }
    }
  };

  const zoomIn = () => {
    if (map) {
      const zoom = map.getZoom();
      if (zoom != undefined) {
        map.setZoom(zoom + 1);
      }
    }
  };

  const zoomOut = () => {
    if (map) {
      const zoom = map.getZoom();
      if (zoom != undefined) {
        map.setZoom(zoom - 1);
      }
    }
  };

  return (
    <div className="absolute top-20">
      <button className="bg-black rounded-lg p-2 text-white" onClick={panLeft}>
        Pan Left
      </button>
      <button className="bg-black rounded-lg p-2 text-white" onClick={panRight}>
        Pan Right
      </button>
      <button className="bg-black rounded-lg p-2 text-white" onClick={panUp}>
        Pan Up
      </button>
      <button className="bg-black rounded-lg p-2 text-white" onClick={panDown}>
        Pan Down
      </button>
      <button className="bg-black rounded-lg p-2 text-white" onClick={zoomIn}>
        Zoom In
      </button>
      <button className="bg-black rounded-lg p-2 text-white" onClick={zoomOut}>
        Zoom Out
      </button>
    </div>
  );
};

export default App;

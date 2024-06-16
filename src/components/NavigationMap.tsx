import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Hands, Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import posedata from "../assets/json/poses-data.json";
import { PoseData, PoseItem } from "../types/PoseData";
import knn from "knear";
import {
  IconHandFinger,
  IconHandGrab,
  IconHandStop,
} from "@tabler/icons-react";

function NavigationMap() {
  //#region Configuration
  const mapRef = useRef<google.maps.Map | null>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastActionTime = useRef<number>(0);
  const [hasError, setHasError] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });

  const k = 3;
  const machine = useRef(new knn.kNear(k));

  const containerStyle = {
    width: "750px",
    height: "500px",
  };

  const center = {
    lat: 51.9173975,
    lng: 4.4849059,
  };

  // Check if enough time has passed since last action to avoid spamming actions
  const canPerformAction = () => {
    const now = Date.now();
    return now - lastActionTime.current >= 2000;
  };

  // Update last action time to current time
  const updateLastActionTime = () => {
    lastActionTime.current = Date.now();
  };

  // Check if the data item is valid
  function isValidDataItem(item: PoseItem): item is PoseItem {
    return (
      typeof item.label === "string" &&
      Array.isArray(item.vector) &&
      item.vector.every((v: number) => typeof v === "number")
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function validateJson(json: any): json is PoseData {
    if (
      typeof json !== "object" ||
      json === null ||
      !Array.isArray(json.data)
    ) {
      console.log("Invalid JSON data");
      return false;
    }

    return json.data.every((item: PoseItem) => isValidDataItem(item));
  }
  //#endregion
  //#region Pan and Zoom functions
  const panRight = () => {
    if (canPerformAction()) {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        if (currentCenter == undefined) return;
        const newCenter = {
          lat: currentCenter.lat(),
          lng: currentCenter.lng() + 0.00125,
        };
        mapRef.current.panTo(newCenter);
        updateLastActionTime();
      }
    }
  };

  const panLeft = () => {
    if (canPerformAction()) {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        if (currentCenter == undefined) return;
        const newCenter = {
          lat: currentCenter.lat(),
          lng: currentCenter.lng() - 0.00125,
        };
        mapRef.current.panTo(newCenter);
        updateLastActionTime();
      }
    }
  };

  const panUp = () => {
    if (canPerformAction()) {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        if (currentCenter == undefined) return;
        const newCenter = {
          lat: currentCenter.lat() + 0.00125,
          lng: currentCenter.lng(),
        };
        mapRef.current.panTo(newCenter);
        updateLastActionTime();
      }
    }
  };

  const panDown = () => {
    if (canPerformAction()) {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        if (currentCenter == undefined) return;
        const newCenter = {
          lat: currentCenter.lat() - 0.00125,
          lng: currentCenter.lng(),
        };
        mapRef.current.panTo(newCenter);
        updateLastActionTime();
      }
    }
  };

  const zoomIn = () => {
    if (canPerformAction()) {
      if (mapRef.current) {
        const currentZoom = mapRef.current.getZoom();
        if (currentZoom == undefined) return;
        mapRef.current.setZoom(currentZoom + 1);
        updateLastActionTime();
      }
    }
  };

  const zoomOut = () => {
    if (canPerformAction()) {
      if (mapRef.current) {
        const currentZoom = mapRef.current.getZoom();
        if (currentZoom == undefined) return;
        mapRef.current.setZoom(currentZoom - 1);
        updateLastActionTime();
      }
    }
  };
  //#endregion

  useEffect(() => {
    // First validate the JSON data before processing it in the machine learning model
    if (!validateJson(posedata)) {
      setHasError(true);
      return;
    }

    // Foreach pose data item, learn the pose data in the machine learning model
    posedata.data.forEach((pose) => {
      machine.current.learn(pose.vector, pose.label);
    });
  }, []);

  useEffect(() => {
    // Load the hands model
    const hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    // Configure the hands model with the following options
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // Callback function for when the model has results (detects hands in the video stream)
    hands.onResults(onResults);

    // Get the webcam reference
    const videoElement = webcamRef.current;

    // If the video element is available, start the camera and apply the hands model to draw the landmarks
    if (videoElement) {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: 750,
        height: 500,
      });
      camera.start();
    }

    // Callback function for when the model has results
    function onResults(results: Results) {
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;

      const canvasCtx = canvasElement.getContext("2d");
      if (!canvasCtx) return;

      // Draw the video stream on the canvas
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Draw the landmarks on the canvas
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });

          // Get the pose detected from the landmarks, and make a new array with the x, y, and z coordinates so that the machine can classify it.
          const poseDetected = landmarks.flatMap((landmark) => [
            landmark.x,
            landmark.y,
            landmark.z,
          ]);

          // Classify the pose detected by the machine learning model
          const result = machine.current.classify(poseDetected);

          // Perform the action based on the result based on the learned pose data
          if (mapRef.current != null && result != null) {
            switch (result) {
              case "finger left":
                panLeft();
                break;
              case "finger right":
                panRight();
                break;
              case "finger up":
                panUp();
                break;
              case "finger down":
                panDown();
                break;
              case "fingers open":
                zoomIn();
                break;
              case "fingers closed":
                zoomOut();
                break;
              case "finger top":
                panUp();
                break;
            }
          }
        }
      }
      canvasCtx.restore();
    }
  }, []);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map as google.maps.Map;
  };

  return (
    <>
      <div>
        <div className="border-2 p-5 rounded-lg shadow-lg m-5">
          {!hasError ? (
            <div className="grid grid-cols-2 w-full gap-20">
              <div className="w-[570px] mx-auto">
                <video
                  ref={webcamRef}
                  className="hidden"
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} className="z-20 h-[500px] w-[750px]" />
              </div>
              <div>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={16}
                    onLoad={onLoad}
                  ></GoogleMap>
                ) : (
                  <div>Webcam is aan het laden..</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-center font-medium">
                Er is een fout opgetreden bij het laden van de data
              </h1>
            </div>
          )}
        </div>
        <div className="border-2 p-5 rounded-lg shadow-lg m-5">
          <p className="text-center font-medium">
            Beweeg de map door onderstaande handgebaren te maken
          </p>
          <div className="flex space-x-2 justify-center">
            <div
              onClick={zoomIn}
              className="flex space-x-2 border-2 rounded-lg p-2 cursor-pointer hover:bg-slate-200"
            >
              <IconHandStop size={24} />
              <p>Zoom in</p>
            </div>
            <div
              onClick={zoomOut}
              className="flex space-x-2 border-2 rounded-lg p-2 cursor-pointer hover:bg-slate-200"
            >
              <IconHandGrab size={24} />
              <p>Zoom out</p>
            </div>
            <div
              onClick={panUp}
              className="flex space-x-2 border-2 rounded-lg p-2 cursor-pointer hover:bg-slate-200"
            >
              <IconHandFinger size={24} />
              <p>Omhoog</p>
            </div>
            <div
              onClick={panDown}
              className="flex space-x-2 border-2 rounded-lg p-2 cursor-pointer hover:bg-slate-200"
            >
              <IconHandFinger size={24} className="rotate-180" />
              <p>Omlaag</p>
            </div>
            <div
              onClick={panRight}
              className="flex space-x-2 border-2 rounded-lg p-2 cursor-pointer hover:bg-slate-200 "
            >
              <IconHandFinger size={24} className="rotate-90" />
              <p>Rechts</p>
            </div>
            <div
              onClick={panLeft}
              className="flex space-x-2 border-2 rounded-lg p-2 cursor-pointer hover:bg-slate-200"
            >
              <IconHandFinger size={24} className="rotate-[270deg]" />
              <p>Links</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavigationMap;

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../utils/UserContext";
import SceneRenderer from "../components/SceneRenderer";
import { API_URL, AxiosDefined, OverlayData } from "../utils/contants";
import React from "react";

export default function PlayerScreen() {
  const { id } = useParams();
  const [videoURL, setVideoURL] = useState<string>("");
  //   const [videoURL = ]
  const [OverlayState, setOverlayState] = useState<OverlayData[]>([]);

  const [videoProcessingStatus, setVideoProcessingStatus] = React.useState<
    "processing" | "done" | "idle"
  >("idle");

  useEffect(() => {
    (async () => {
      const response = await AxiosDefined.get(API_URL + "/job/" + id + "/data");

      setOverlayState(response.data.overlayData);
      setVideoProcessingStatus("done");

      setVideoURL(API_URL + "/stream/" + id + "/index.m3u8");
    })();
  }, []);

  return (
    <>
      <div className="h-full w-full grid place-content-center">
        {videoProcessingStatus === "idle" ? (
          <div className="h-[270px]  w-[479px] grid place-content-center  bg-gray-300/35 text-white font-medium rounded-md">
            Getting Player Ready
          </div>
        ) : (
          <>
            <main className=" bg-[#110E1B] grid place-content-center">
              <SceneRenderer
                viewerOnly
                key={id}
                height={270}
                width={479}
                url={videoURL}
                Overlay={OverlayState}
                setOverlay={setOverlayState}
              />
            </main>
          </>
        )}
      </div>
    </>
  );
}

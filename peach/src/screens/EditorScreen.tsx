import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../utils/UserContext";
import SceneRenderer from "../components/SceneRenderer";
import { API_URL, AxiosDefined, OverlayData } from "../utils/contants";
import React from "react";
import { cn } from "../lib/utils";
import { Back, BoxArrowLeft } from "react-bootstrap-icons";

export default function EditorScreen() {
  const { state } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoURL, setVideoURL] = useState<string>("");
  //   const [videoURL = ]
  const [OverlayState, setOverlayState] = useState<OverlayData[]>([]);

  const [SaveRequest, setSaveRequest] = React.useState<
    "ongoing" | "settled" | "idle"
  >("idle");

  const [videoProcessingStatus, setVideoProcessingStatus] = React.useState<
    "processing" | "done" | "idle"
  >("idle");

  //   useEffect(() => {
  //     if (state.loggedIn === false) {
  //       navigate("/playback/" + id);
  //     }
  //   }, []);
  console.log(OverlayState);
  useEffect(() => {
    if (state.loggedIn === false) {
      navigate("/player/" + id);
    }
    // let Intervale;
    (async () => {
      //   setVideoProcessingStatus("processing");
      //   Intervale = setInterval(async () => {
      //     const response = await AxiosDefined.get(API_URL + "/job/" + id);
      //     if (response.data.status == "running") {
      //       setVideoProcessingStatus("done");
      //       clearInterval(Intervale);
      //     }
      //   }, 1000);
      const response = await AxiosDefined.get(API_URL + "/job/" + id + "/data");

      setOverlayState(response.data.overlayData);
      setVideoProcessingStatus("done");
      setTimeout(() => {
        setVideoURL(API_URL + "/stream/" + id + "/index.m3u8");
      }, 50);
    })();

    // return () => {
    // //   clearInterval(Intervale);
    // };
  }, []);

  useEffect(() => {
    const Timeout = setTimeout(() => {
      setSaveRequest("idle");
    }, 3000);
    return () => {
      clearTimeout(Timeout);
    };
  }, [SaveRequest]);

  useEffect(() => {}, []);
  return (
    <>
      <div className="h-full w-full grid place-content-center">
        {videoProcessingStatus === "idle" ? (
          <div className="h-[270px]  w-[479px] grid place-content-center  bg-gray-300/35 text-white font-medium rounded-md">
            Getting Editor Ready
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                navigate("/dashboard");
              }}
              className="ml-auto mb-4 w-fit"
            >
              <BoxArrowLeft color="white" />
            </button>
            <main className=" bg-[#110E1B] grid place-content-center">
              <SceneRenderer
                key={id}
                height={270}
                width={479}
                url={videoURL}
                Overlay={OverlayState}
                setOverlay={setOverlayState}
              />
              <button
                onClick={async () => {
                  setSaveRequest("ongoing");
                  const response = await AxiosDefined.post(
                    API_URL + "/job/" + id + "/data",
                    {
                      overlayData: OverlayState,
                    }
                  );
                  if (response.status === 200) {
                    setSaveRequest("settled");
                  }
                }}
                className="block mt-10  bg-white font-medium py-1 rounded-md hover:brightness-50 transition-all"
              >
                Save Overlay
              </button>

              <div
                className={cn(
                  "bg-[#191528] text-green-400 font-medium mt-2 py-1 text-center",
                  {
                    invisible: SaveRequest === "idle",
                  }
                )}
              >
                Save Successful
              </div>
            </main>
          </>
        )}
        {/* {videoProcessingStatus === "processing" ? (
          <>
            <div className="h-[270px] animate-pulse w-[479px] bg-gray-300/40 grid place-content-center">
              <p className="text-white">Processing Video</p>
            </div>
          </>
        ) : (
          <></>
        )} */}
        {}
        {/* <main className=" bg-[#110E1B] grid place-content-center">
          <SceneRenderer
            height={270}
            width={479}
            url={API_URL + "/stream/" + id + "/index.m3u8"}
            Overlay={OverlayState}
            setOverlay={setOverlayState}
          />
        </main> */}
      </div>
    </>
  );
}

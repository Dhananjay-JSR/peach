import React, { useEffect, MutableRefObject } from "react";
import {
  Play,
  Pause,
  ArrowRepeat,
  VolumeMute,
  VolumeUpFill,
  VolumeDownFill,
} from "react-bootstrap-icons";
import ReactPlayer, { ReactPlayerProps } from "react-player";
import BaseReactPlayer from "react-player/base";
import { getTrackBackground, Range } from "react-range";
import { cn } from "../../lib/utils";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
enum SpeedStats {
  "0.5x" = 0.5,
  "1x" = 1,
  "1.5x" = 1.5,
  "2x" = 2,
}

const VideoPlayer = React.forwardRef(
  ({
    Ref,
    children,
    url,
    height,
    width,
  }: {
    children: React.ReactNode;
    Ref: React.MutableRefObject<HTMLDivElement | undefined>;
    url: string;
    height: number;
    width: number;
  }) => {
    const VideoPlayerRef = React.useRef<BaseReactPlayer<ReactPlayerProps>>();

    const [PlayerPlaying, setPlayerPlaying] = React.useState(false);
    const [PlayerVolume, setPlayerVolume] = React.useState([50]);
    const [PlayerSpeed, setPlayerSpeed] = React.useState<SpeedStats>(
      SpeedStats["1x"]
    );
    const [PlayerMuted, setPlayerMuted] = React.useState(false);
    const [PlayerLoop, setPlayerLoop] = React.useState(false);
    const [PlayerSeek, setPlayerSeek] = React.useState([0]);
    const [isSeeking, setIsSeeking] = React.useState(false);
    const [duration, setDuration] = React.useState(0);

    useEffect(() => {
      if (isSeeking) {
        VideoPlayerRef.current?.seekTo(PlayerSeek[0] / 100, "fraction");
      }
    }, [isSeeking, PlayerSeek]);

    useEffect(() => {
      const player = VideoPlayerRef.current;
      if (player) {
        setDuration(player.getDuration());
      }
    }, [VideoPlayerRef]);
    return (
      <>
        <section
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
          className=" rounded-md relative overflow-hidden"
          ref={Ref as MutableRefObject<HTMLDivElement>}
        >
          <section
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
            className=" absolute left-0 top-0 z-20"
          >
            {children}
          </section>
          <ReactPlayer
            onDuration={(data) => {
              setDuration(data);
            }}
            loop={PlayerLoop}
            onProgress={(data) => {
              setPlayerSeek([data.played * 100]);
            }}
            playing={PlayerPlaying}
            volume={PlayerVolume[0] / 100}
            playbackRate={PlayerSpeed}
            muted={PlayerMuted}
            ref={
              VideoPlayerRef as MutableRefObject<
                BaseReactPlayer<ReactPlayerProps>
              >
            }
            className="absolute top-0 left-0"
            width="100%"
            height="100%"
            url={url}
          />
        </section>
        <div
          style={{
            width: `${width}px`,
          }}
          className={cn(
            "  h-full rounded-sm px-1.5  items-center justify-evenly flex   bg-[#191528] mt-6",
            {
              " justify-center flex-col gap-3": width <= 320,
            }
          )}
        >
          <div className="flex items-center justify-evenly gap-2">
            <button
              className="h-5 w-5 text-white hover:text-black hover:bg-white rounded-sm transition-all"
              onClick={() => {
                setPlayerPlaying((prev) => !prev);
              }}
            >
              {!PlayerPlaying ? (
                <Play
                  viewBox="0 0 16 16"
                  className="w-full h-full"
                  height={16}
                  width={16}
                />
              ) : (
                <Pause
                  viewBox="0 0 16 16"
                  className="w-full h-full"
                  height={16}
                  width={16}
                />
              )}
            </button>
            <button
              onClick={() => {
                setPlayerLoop((prev) => !prev);
              }}
              className={cn(
                "text-white before:content-[''] before:transition-all before:origin-top-left before:-translate-x-[7px] before:translate-y-[3px] before:h-0 before:w-0.5 relative before:absolute before:bg-white before:-rotate-45",
                {
                  "before:h-full": !PlayerLoop,
                }
              )}
            >
              <ArrowRepeat />
            </button>
            <div className="flex gap-2 items-center w-fit ">
              <button
                onClick={() => {
                  setPlayerMuted((prev) => !prev);
                }}
                className="h-5  w-5 text-white hover:text-black hover:bg-white rounded-sm transition-all"
              >
                {PlayerMuted ? (
                  <VolumeMute
                    viewBox="0 0 16 16"
                    className="w-full h-full"
                    height={16}
                    width={16}
                  />
                ) : PlayerVolume[0] > 50 ? (
                  <VolumeUpFill
                    viewBox="0 0 16 16"
                    className="w-full h-full"
                    height={16}
                    width={16}
                  />
                ) : (
                  <VolumeDownFill
                    viewBox="0 0 16 16"
                    className="w-full h-full"
                    height={16}
                    width={16}
                  />
                )}
              </button>

              <Range
                disabled={PlayerMuted}
                values={PlayerVolume}
                onChange={(value) => {
                  setPlayerVolume(value);
                }}
                min={0}
                max={100}
                renderTrack={({ props, children }) => (
                  <div
                    onMouseDown={props.onMouseDown}
                    onTouchStart={props.onTouchStart}
                    style={{
                      ...props.style,
                      height: "fit-content",
                      display: "flex",
                      width: "55px",
                    }}
                  >
                    <div
                      ref={props.ref}
                      style={{
                        height: "5px",
                        width: "100%",
                        borderRadius: "4px",
                        background: getTrackBackground({
                          values: PlayerVolume,
                          colors: ["white", "rgb(75, 85, 99)"],
                          min: 0,
                          max: 100,
                        }),
                        alignSelf: "center",
                      }}
                    >
                      {children}
                    </div>
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div {...props} className="h-3 w-3 bg-white rounded-full" />
                )}
              />
            </div>
            <div className="relative select-none">
              <span className="text-[8px]  absolute top-full text-white font-medium">
                00:00
              </span>
              <span className="text-[8px] absolute top-full right-0 text-white font-medium">
                {formatTime(duration)}
              </span>
              <Range
                values={PlayerSeek}
                onChange={(value) => {
                  setPlayerSeek(value);
                }}
                min={0}
                max={100}
                renderTrack={({ props, children }) => (
                  <div
                    onMouseDown={(e) => {
                      setIsSeeking(true);
                      props.onMouseDown(e);
                    }}
                    onMouseUp={() => {
                      setIsSeeking(false);
                    }}
                    onTouchStart={props.onTouchStart}
                    style={{
                      ...props.style,
                      height: "fit-content",
                      display: "flex",
                      width: "150px",
                    }}
                  >
                    <div
                      ref={props.ref}
                      style={{
                        height: "5px",
                        width: "100%",
                        borderRadius: "4px",
                        background: getTrackBackground({
                          values: PlayerSeek,
                          colors: ["white", "rgb(75, 85, 99)"],
                          min: 0,
                          max: 100,
                        }),
                        alignSelf: "center",
                      }}
                    >
                      {children}
                    </div>
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div {...props} className="h-3 w-3 bg-white rounded-full" />
                )}
              />
            </div>
          </div>
          <div className="flex items-end gap-2 w-fit select-none">
            <span className="text-xs text-gray-400 ">Speed </span>
            <div className="h-fit flex text-white gap-3">
              <button
                onClick={() => {
                  setPlayerSpeed(SpeedStats["0.5x"]);
                }}
                className={cn(
                  "text-[8px] h-4 w-4 rounded-full flex items-center justify-center",
                  {
                    "text-black bg-white": PlayerSpeed == SpeedStats["0.5x"],
                  }
                )}
              >
                0.5x
              </button>
              <button
                onClick={() => {
                  setPlayerSpeed(SpeedStats["1x"]);
                }}
                className={cn(
                  "text-[8px] h-4 w-4 rounded-full flex items-center justify-center",
                  {
                    "text-black bg-white": PlayerSpeed == SpeedStats["1x"],
                  }
                )}
              >
                1x
              </button>
              <button
                onClick={() => {
                  setPlayerSpeed(SpeedStats["1.5x"]);
                }}
                className={cn(
                  "text-[8px] h-4 w-4 rounded-full flex items-center justify-center",
                  {
                    "text-black bg-white": PlayerSpeed == SpeedStats["1.5x"],
                  }
                )}
              >
                1.5x
              </button>
              <button
                onClick={() => {
                  setPlayerSpeed(SpeedStats["2x"]);
                }}
                className={cn(
                  "text-[8px] h-4 w-4 rounded-full flex items-center justify-center",
                  {
                    "text-black bg-white": PlayerSpeed == SpeedStats["2x"],
                  }
                )}
              >
                2x
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default VideoPlayer;

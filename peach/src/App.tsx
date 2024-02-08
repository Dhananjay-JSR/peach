import { PersonCircle, PlayBtnFill } from "react-bootstrap-icons";

import React, { useContext, useEffect } from "react";
import {
  API_URL,
  ActionType,
  AxiosDefined,
  SERVER_URL,
} from "./utils/contants";
import ReactPlayer from "react-player";
import { UserContext } from "./utils/UserContext";
import { Link } from "react-router-dom";

function HeroFeed() {
  const [isVideoReady, setIsVideoReady] = React.useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const { dispatch, state } = useContext(UserContext);
  useEffect(() => {
    if (isVideoReady) return;
    const interval = setInterval(async () => {
      try {
        const response = await AxiosDefined.get(API_URL + "/ready");
        setIsVideoReady(response.data.status);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [isVideoReady]);
  return (
    <div className="w-full lg:h-72 bg-[#191528] rounded-md grid py-3 grid-rows-2 lg:grid-rows-1     lg:grid-cols-2">
      <div className="h-full w-full flex items-center">
        <div className="px-4">
          <div className="text-3lg font-semibold text-white">
            Stream Live, Anywhere, Anytime
          </div>
          <div className="text-white font-thin mt-2">
            Peach is the leading platform for live streaming. Join us and start
            streaming today!
          </div>
          <button
            onClick={() => {
              dispatch({
                type: ActionType.TOGGLE_MODAL,
                payload: state,
              });
              if (state.loggedIn) {
                dispatch({
                  type: ActionType.MODAL_TYPE_URL_INPUT,
                  payload: state,
                });
              } else {
                dispatch({
                  type: ActionType.MODAL_TYPE_LOGIN,
                  payload: state,
                });
              }
            }}
            className="bg-white hover:bg-[#110E1B] lg:w-fit w-full  border block border-transparent hover:border-white transition-all hover:text-white px-2 py-1 rounded-sm mt-4 font-medium"
          >
            Add Your URL
          </button>
        </div>
      </div>
      <div className="grid  place-content-center ">
        {isVideoReady ? (
          <>
            <button
              onClick={() => {
                setIsVideoPlaying(!isVideoPlaying);
              }}
              style={{
                // position: "fixed",
                // top: "0",
                // left: "0",
                // width: "100%",
                width: "320px",
                height: "180px",
              }}
              className="rounded-sm border relative bg-black overflow-hidden"
            >
              {!isVideoPlaying ? (
                <PlayBtnFill
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  size={56}
                  color="white"
                />
              ) : null}
              <ReactPlayer
                playing={isVideoPlaying}
                width="100%"
                height="100%"
                url={SERVER_URL + "/static/vid/index.m3u8"}
              />
            </button>
          </>
        ) : (
          <div
            style={{
              width: "320px",
              height: "180px",
            }}
            className="bg-white/40 animate-pulse before:content-['Loading_Video']  before:w-full before:h-full relative before:absolute before:grid before:place-content-center before:font-semibold before:text-white  grid place-content-center  rounded-md"
          ></div>
        )}
      </div>
    </div>
  );
}

export function HomeScreenDashboard() {
  const [data, setData] = React.useState<
    {
      createdAt: string;
      id: string;
      videourl: string;
      userName: string;
      profilePic: string;
    }[]
  >([]);

  useEffect(() => {
    (async () => {
      const response = await AxiosDefined.get(API_URL + "/videos");
      const Data = response.data as {
        name: string;
        profilePic: string;
        _id: string;
        user_data: {
          createdAt: string;
          id: string;
          videourl: string;
        }[];
      }[];

      setData(
        Data.map((item) =>
          item.user_data.map((i) => {
            return {
              createdAt: i.createdAt,
              id: i.id,
              videourl: i.videourl,
              userName: item.name,
              profilePic: item.profilePic,
            };
          })
        ).flat()
      );
    })();
  }, []);

  return (
    <>
      <HeroFeed />
      <section className="grid lg:grid-cols-3 gap-5 mt-5">
        {data.map((videItem) => {
          return (
            <Feed
              key={videItem.id}
              id={videItem.id}
              url={videItem.videourl}
              userName={videItem.userName}
              playerMode
              userPhoto={videItem.profilePic}
              uploadDate={videItem.createdAt}
              thumbnail=""
            />
          );
        })}
      </section>
    </>
  );
}

export function Feed({
  url,
  uploadDate,
  userName,
  userPhoto,
  id,
  playerMode,
}: {
  playerMode?: boolean;
  id: string;
  url: string;
  userName: string;
  uploadDate: string;
  thumbnail: string;
  userPhoto: string;
}) {
  return (
    <Link
      to={playerMode ? "/player/" + id : "/editor/" + id}
      className="h-48 w-full grid-rows-12 p-2 grid  border gap-1 rounded-md"
    >
      <div className="row-span-9 bg-gray-200/20 rounded-md h-full"></div>
      <div className="row-span-3 flex justify-between">
        <div>
          <div className="text-white font-semibold">{url}</div>
          <div className="text-white font-thin">{uploadDate}</div>
        </div>
        <div className="grid grid-rows-4 gap-1">
          <div className="row-span-2 h-6 w-6 rounded-full mx-auto  bg-white">
            {userPhoto == "" ? (
              <PersonCircle color="black" size={24} />
            ) : (
              <img
                src={userPhoto}
                alt="userPhoto"
                className="h-full w-full rounded-full"
              />
            )}
          </div>
          <div className="row-span-2 text-xs text-white ">
            {userName.charAt(0).toUpperCase() +
              userName.slice(1, userName.length)}
          </div>
        </div>
      </div>
    </Link>
  );
}

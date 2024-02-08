import { useContext, useEffect, useState } from "react";
import { UserContext } from "../utils/UserContext";
import { useNavigate } from "react-router-dom";
import { API_URL, AxiosDefined, OverlayData } from "../utils/contants";
import axios from "axios";
import { Feed } from "../App";

export default function LoggedUserDashboard() {
  const { state, dispatch } = useContext(UserContext);
  const navigate = useNavigate();

  const [ResponseData, setResponseData] = useState<
    {
      createdAt: string;
      id: string;
      overlayData: OverlayData[];
      videourl: string;
    }[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (state.loggedIn === false) {
      navigate("/");
    }

    (async () => {
      setLoading(true);
      let Data = await AxiosDefined.get(API_URL + "/jobs");
      setResponseData(Data.data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <>
        <div className="grid place-content-center h-full">
          <div className="h-[270px]  w-[479px] grid place-content-center  bg-gray-300/5 text-white font-medium rounded-md">
            Loading
          </div>
        </div>
      </>
    );
  }
  return (
    <section className="grid lg:grid-cols-3 gap-5 mt-5">
      {ResponseData.map((data) => {
        return (
          <Feed
            id={data.id}
            key={data.id}
            thumbnail=""
            uploadDate={data.createdAt}
            url={data.videourl}
            userName={state.username || ""}
            userPhoto={state.profilePicture || ""}
          />
        );
      })}
    </section>
  );
}

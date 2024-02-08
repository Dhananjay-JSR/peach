import React, { useContext, useEffect } from "react";
import {
  Search,
  PersonCircle,
  ArrowRightSquare,
  ArrowLeftSquare,
  House,
  Android,
  Activity,
  Map,
  XOctagonFill,
  EyeFill,
} from "react-bootstrap-icons";
import ReactDOM from "react-dom";
import { cn } from "../../lib/utils";
import Logo from "../../assets/Logo.png";
import { Outlet, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { API_URL, ActionType, AxiosDefined } from "../../utils/contants";
import { UserContext } from "../../utils/UserContext";

export default function LayoutScreen() {
  return (
    <>
      <main className="min-h-screen bg-[#110E1B] flex flex-col">
        <NavBar />
        <section className="flex-grow h-full w-full flex relative lg:static">
          <SideBar />

          <div className="lg:pl-5 pl-16 w-full p-5">
            <Outlet />
          </div>
        </section>
      </main>
    </>
  );
}
const ImageVariants = [
  "https://i.pravatar.cc/50?u=selectID1",
  "https://i.pravatar.cc/50?u=selectID2",
  "https://i.pravatar.cc/50?u=selectID3",
  "https://i.pravatar.cc/50?u=selectID4",
  "https://i.pravatar.cc/50?u=selectID5",
  "https://i.pravatar.cc/50?u=selectID6",
] as const;

function VideoProcessingInput() {
  const [videoURL, setVideoURL] = React.useState<string>("");
  const [videoProcessingStatus, setVideoProcessingStatus] = React.useState<
    "processing" | "done" | "idle"
  >("idle");

  const navigate = useNavigate();
  const { state, dispatch } = useContext(UserContext);

  useEffect(() => {
    if (videoProcessingStatus == "done") {
      navigate("/video");
    }
  }, [videoProcessingStatus]);
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {" "}
      <input
        value={videoURL}
        onChange={(e) => {
          setVideoURL(e.target.value);
        }}
        id="inputURL"
        placeholder="rtsp://..."
        className="w-72 bg-[#272335] text-white focus:outline-none px-1 py-1 rounded-sm"
      />{" "}
      <button
        disabled={videoProcessingStatus == "processing"}
        onClick={async () => {
          setVideoProcessingStatus("processing");
          const Data = await AxiosDefined.post(
            API_URL + "/job",
            {
              url: videoURL,
            },
            {
              withCredentials: true,
            }
          );
          if (Data.status == 200) {
            const JobID = Data.data.job_id;
            const INTE = setInterval(async () => {
              const response = await AxiosDefined.get(
                API_URL + "/job/" + JobID
              );
              if (response.status == 200) {
                if (response.data.status == "running") {
                  dispatch({
                    type: ActionType.TOGGLE_MODAL,
                    payload: state,
                  });
                  clearInterval(INTE);

                  navigate("/editor/" + JobID);
                  // setVideoProcessingStatus("done");
                }
              }
            }, 2000);
          }
        }}
        className="bg-[#110E1B] text-white mt-4 mx-auto block  px-3.5 py-1.5  rounded-sm hover:bg-white hover:text-[#191528] transition-all"
      >
        Start Processing
      </button>
      {videoProcessingStatus == "processing" ? (
        <div role="status" className="mx-auto">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : null}
    </div>
  );
}

function NavBar() {
  const [mobileSearch, setMobileSearch] = React.useState(false);
  // const [showModal, setShowModal] = React.useState(false);
  // const [modalType, setModalType] = React.useState<"login" | "signup">("login");

  const { state, dispatch } = useContext(UserContext);

  const navigate = useNavigate();

  return (
    <>
      {state.showModel
        ? ReactDOM.createPortal(
            <>
              <div className="fixed h-screen w-full z-50 flex justify-center items-center">
                <div className=" rounded-md p-3 relative  w-[490px] h-72 bg-[#191528] shadow-[0_0_0_10000px_rgba(0,0,0,.7)] ">
                  {state.modalType == "urlInput" ? (
                    <VideoProcessingInput />
                  ) : (
                    <AccountForm />
                  )}

                  <button
                    onClick={() => {
                      // setShowModal(false);
                      dispatch({
                        type: ActionType.TOGGLE_MODAL,
                        payload: state,
                      });
                    }}
                    className="absolute text-white top-4 right-4"
                  >
                    <XOctagonFill />
                  </button>
                </div>
              </div>
            </>,
            document.getElementById("modal")!
          )
        : null}
      <nav className="h-10 w-full bg-[#191528] px-4 items-center flex justify-between">
        <div className="w-fit flex gap-4 items-center">
          <img src={Logo} alt="Logo" className="h-8 w-8" draggable={false} />
          <span className="text-white font-Protest-Guerrilla select-none">
            PEACH
          </span>
        </div>
        <div className="relative h-fit lg:block hidden">
          <input
            type="text"
            placeholder="Enter Video You Want To Search for"
            className="h-6 bg-[#272335] pr-8 w-80 text-sm focus:outline-none px-1 text-white py-2  rounded-sm"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2">
            <Search color="white" />
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => {
              setMobileSearch(!mobileSearch);
            }}
            className="lg:hidden"
          >
            <Search color="white" />
          </button>
          {state.loggedIn ? (
            <>
              <button
                onClick={() => {
                  navigate("/dashboard");
                }}
              >
                {state.profilePicture != "" ? (
                  <img
                    src={state.profilePicture as string}
                    className="w-8 h-8 rounded-full"
                    alt="Profile Picture"
                  />
                ) : (
                  <PersonCircle color="white" />
                )}
              </button>

              <span className="text-white ml-2">
                {state.username &&
                  state.username?.charAt(0).toUpperCase() +
                    state.username?.slice(1, state.username.length)}
              </span>
            </>
          ) : (
            <>
              {!mobileSearch ? (
                <>
                  <div className="flex gap-4 items-center lg:hidden">
                    <button
                      onClick={() => {
                        dispatch({
                          type: ActionType.TOGGLE_MODAL,
                          payload: state,
                        });
                        dispatch({
                          type: ActionType.MODAL_TYPE_LOGIN,
                          payload: state,
                        });
                        // setShowModal(true);
                        // setModalType("login");
                      }}
                      className={cn(
                        "bg-[#110E1B]   h-fit text-white font-medium px-3 py-0.5 rounded-sm hover:border-white/40 border border-transparent hover:text-[#3C162F] hover:bg-white transition-colors"
                      )}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        dispatch({
                          type: ActionType.TOGGLE_MODAL,
                          payload: state,
                        });
                        dispatch({
                          type: ActionType.MODAL_TYPE_SIGNUP,
                          payload: state,
                        });
                        // setShowModal(true);
                        // setModalType("signup");
                      }}
                      className={cn(
                        "bg-[#110E1B] h-fit   text-white font-medium px-3 py-0.5 rounded-sm hover:border-white/40 border border-transparent hover:text-[#3C162F] hover:bg-white transition-colors"
                      )}
                    >
                      Signup
                    </button>
                  </div>
                </>
              ) : null}
              <input
                type="text"
                placeholder="Enter Video You Want "
                className={cn("lg:hidden transition-all", {
                  "w-full bg-[#272335] text-sm focus:outline-none px-1 text-white py-1  rounded-sm":
                    mobileSearch,
                  "w-0": !mobileSearch,
                })}
              />
              <div className="gap-4 hidden lg:flex items-center ">
                <button
                  onClick={() => {
                    dispatch({
                      type: ActionType.TOGGLE_MODAL,
                      payload: state,
                    });
                    dispatch({
                      type: ActionType.MODAL_TYPE_LOGIN,
                      payload: state,
                    });
                    // setShowModal(true);
                    // setModalType("login");
                  }}
                  className={cn(
                    "bg-[#110E1B]   h-fit text-white font-medium px-3 py-0.5 rounded-sm hover:border-white/40 border border-transparent hover:text-[#3C162F] hover:bg-white transition-colors"
                  )}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    dispatch({
                      type: ActionType.TOGGLE_MODAL,
                      payload: state,
                    });
                    dispatch({
                      type: ActionType.MODAL_TYPE_SIGNUP,
                      payload: state,
                    });
                    // setShowModal(true);
                    // setModalType("signup");
                  }}
                  className={cn(
                    "bg-[#110E1B] h-fit   text-white font-medium px-3 py-0.5 rounded-sm hover:border-white/40 border border-transparent hover:text-[#3C162F] hover:bg-white transition-colors"
                  )}
                >
                  Signup
                </button>
              </div>
              <button>
                <PersonCircle color="white" />
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

function AccountForm() {
  const { dispatch, state } = useContext(UserContext);
  const [passHidden, setPassHidden] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState<
    (typeof ImageVariants)[number] | null
  >(null);
  const [showImagePicker, setShowImagePicker] = React.useState(false);

  return (
    <form
      className="grid place-content-center h-full"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        let data = null;
        const { email } = Object.fromEntries(formData.entries());

        try {
          if (state.modalType == "signup") {
            data = await AxiosDefined.post(API_URL + "/signup", {
              name: formData.get("name"),
              email: formData.get("email"),
              password: formData.get("password"),
              profilePic: formData.get("profilePic"),
            });
            if (data.status == 200) {
              alert("Account Created Please Login To Continue");
              // setModalType("login");
              dispatch({
                type: ActionType.MODAL_TYPE_LOGIN,
                payload: state,
              });
            }
          } else {
            data = await AxiosDefined.post(
              API_URL + "/login",
              {
                email: formData.get("email"),
                password: formData.get("password"),
              },
              {
                withCredentials: true,
              }
            );
            if (data.status == 200) {
              dispatch({
                type: ActionType.UPDATE_USER,
                payload: {
                  ...state,
                  loggedIn: true,
                  email: email as string,
                  profilePicture: data.data.imgData,
                  username: data.data.name,
                },
              });

              dispatch({
                type: ActionType.TOGGLE_MODAL,
                payload: state,
              });
            }
          }
        } catch (err) {
          const e = err as AxiosError;
          if (e.response) {
            const Data = e.response.data as { message: string };
            alert(Data.message);
          }
        }
      }}
    >
      <div>
        {state.modalType == "signup" ? (
          <>
            {/*  */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowImagePicker(!showImagePicker);
                }}
                className="w-8 h-8 relative p-1 block mx-auto mb-2 border rounded-full"
              >
                {selectedImage == null ? (
                  <PersonCircle
                    color="white"
                    height={16}
                    width={16}
                    viewBox="0 0 16 16"
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <img
                    src={selectedImage}
                    className="w-full h-full rounded-full"
                  />
                )}
                {showImagePicker && (
                  <div className="absolute grid grid-cols-3  left-0 grid-rows-2 w-36 gap-3 bg-[#272335] border p-3 rounded-md ">
                    {ImageVariants.map((data) => {
                      return (
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full"
                          onClick={() => {
                            setSelectedImage(data);
                            setShowImagePicker(false);
                          }}
                        >
                          <img
                            src={data}
                            className="w-full h-full rounded-full"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </button>

              <div
                className={`text-sm text-gray-400 mx-auto w-fit ${
                  selectedImage != null ? "invisible" : ""
                }`}
              >
                <span>Pick Profile Pic</span>{" "}
              </div>
            </div>
            <input
              name="profilePic"
              className="hidden"
              type="text"
              value={selectedImage as string}
            />
            {/*  */}
            <div className="flex items-center gap-3 mb-4">
              <label htmlFor="email" className="text-white w-20">
                Name
              </label>
              <input
                name="name"
                type="text"
                id="name"
                className="w-72 bg-[#272335] text-white focus:outline-none px-1 py-1 rounded-sm"
              />
            </div>
          </>
        ) : null}
        <>
          <div className="flex items-center gap-3 mb-4">
            <label htmlFor="email" className="text-white w-20">
              Email
            </label>
            <input
              name="email"
              type="email"
              id="email"
              className="w-72 bg-[#272335] text-white focus:outline-none px-1 py-1 rounded-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="password" className="text-white w-20">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={passHidden == true ? "password" : "text"}
                id="password"
                className="w-72 pr-8 bg-[#272335] text-white focus:outline-none px-1 py-1 rounded-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setPassHidden(!passHidden);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <EyeFill color="white" />
              </button>
            </div>
          </div>
        </>

        <button
          type="submit"
          className="bg-[#110E1B] text-white mt-4 mx-auto block  px-3.5 py-1.5  rounded-sm hover:bg-white hover:text-[#191528] transition-all"
        >
          {state.modalType == "login" ? "Login" : "Signup"}
        </button>
      </div>
    </form>
  );
}

function SideBar() {
  const navigate = useNavigate();
  const SideBarTypes = ["Home", "Discover", "TestBtn", "TestBtn2"] as const;
  const [SideBarSelected, setSideBarSelected] =
    React.useState<(typeof SideBarTypes)[number]>("Home");
  const [SidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    if (mediaQuery.matches) {
      setSidebarCollapsed(false);
    } else {
      setSidebarCollapsed(true);
    }

    const MediaQuerryHandler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    mediaQuery.addEventListener("change", MediaQuerryHandler);

    return () => {
      mediaQuery.removeEventListener("change", MediaQuerryHandler);
    };
  }, []);
  return (
    <div
      className={cn(
        "bg-[#191528] absolute h-full lg:h-auto lg:static   transition-all gap-2 flex flex-col px-2",
        {
          "w-60 px-1": !SidebarCollapsed,
        }
      )}
    >
      <button
        onClick={() => {
          setSidebarCollapsed(!SidebarCollapsed);
        }}
        className={cn(
          "ml-auto p-1 hover:bg-black/25 transition-all rounded-full h-8 w-8 grid place-content-center my-2",
          {
            "mx-auto": SidebarCollapsed,
          }
        )}
      >
        {SidebarCollapsed ? (
          <ArrowRightSquare color="white" />
        ) : (
          <ArrowLeftSquare color="white" />
        )}
      </button>
      <Button
        isCollapsed={SidebarCollapsed}
        onClick={() => {
          setSideBarSelected("Home");
          navigate("/");
        }}
        currentSelected={SideBarSelected == "Home"}
        icon={<House />}
      >
        Home
      </Button>
      <Button
        isCollapsed={SidebarCollapsed}
        onClick={() => setSideBarSelected("Discover")}
        currentSelected={SideBarSelected == "Discover"}
        icon={<Map />}
      >
        Discover
      </Button>
      <Button
        isCollapsed={SidebarCollapsed}
        onClick={() => setSideBarSelected("TestBtn")}
        currentSelected={SideBarSelected == "TestBtn"}
        icon={<Android />}
      >
        TestBtn
      </Button>
      <Button
        isCollapsed={SidebarCollapsed}
        onClick={() => setSideBarSelected("TestBtn2")}
        currentSelected={SideBarSelected == "TestBtn2"}
        icon={<Activity />}
      >
        TestBtn2
      </Button>
    </div>
  );
}

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  icon: React.ReactNode;
  currentSelected: boolean;
  isCollapsed?: boolean;
};
function Button({
  icon,
  currentSelected,
  isCollapsed,
  children,
  ...BtnProps
}: ButtonProps) {
  return (
    <button
      {...BtnProps}
      className={cn(
        "text-left  hover:bg-white transition-colors px-2 relative border-2 border-transparent  py-1.5 flex items-center gap-2 bg-[#110E1B] rounded-sm text-white hover:text-[#3C162F] font-semibold mx-2 ",
        {
          " px-1 h-8 w-8 grid place-content-center rounded-full m-0":
            isCollapsed,
        },
        {
          "border-[#3C162F] ": currentSelected && isCollapsed,
        }
      )}
    >
      {icon}
      {!isCollapsed && (
        <>
          <span>{children}</span>
          {currentSelected ? (
            <div className="absolute bg-[#3C162F]  w-1 h-[75%] rounded-md left-0 -translate-x-1/2"></div>
          ) : null}{" "}
        </>
      )}
    </button>
  );
}

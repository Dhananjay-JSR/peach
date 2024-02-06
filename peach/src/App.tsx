// @ts-nocheck
import {
  Android,
  PersonCircle,
  Search,
  House,
  Map,
  ArrowLeftSquare,
  Activity,
  ArrowRightSquare,
  CodeSlash,
  ArrowsExpand,
  PlusCircle,
} from "react-bootstrap-icons";
import Logo from "./assets/Logo.png";
import { cn } from "./lib/utils";
import React, { MutableRefObject, useEffect, useRef } from "react";

function Handler({ children }: { children?: React.ReactNode }) {
  const [mouseDown, setMouseDown] = React.useState(false);
  const [ActionType, setActionType] = React.useState<
    "resize" | "move" | "rotate" | "none"
  >("none");

  const [rotate, setRotate] = React.useState(0);

  const [height, setHeight] = React.useState<undefined | number>(undefined);
  const [width, setWidth] = React.useState<undefined | number>(undefined);
  const [transform, setTransform] = React.useState({
    x: 0,
    y: 0,
  });

  const [initialCLickPosition, setInitialCLickPosition] = React.useState({
    x: 0,
    y: 0,
  });

  const Ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (Ref.current) {
      setHeight(Ref.current.clientHeight - 16);
      setWidth(Ref.current.clientWidth - 16);
    }
  }, []);

  useEffect(() => {
    const MouseMoveEvent = (e: MouseEvent) => {
      if (mouseDown) {
        if (ActionType == "resize") {
          const Diff = e.clientY - initialCLickPosition.y;
          if (height && width) {
            const NewHeight = height + Diff;
            setHeight(NewHeight);
            const DIffX = e.clientX - initialCLickPosition.x;
            const NewWidth = width + DIffX;
            setWidth(NewWidth);
            const MoveX = transform.x + DIffX / 2;
            const MoveY = transform.y + Diff / 2;
            setTransform({
              x: MoveX,
              y: MoveY,
            });
          }
        } else if (ActionType == "move") {
          const DiffX = transform.x + e.clientX - initialCLickPosition.x;
          const DiffY = transform.y + e.clientY - initialCLickPosition.y;
          setTransform({
            x: DiffX,
            y: DiffY,
          });
        } else if (ActionType == "rotate") {
          const DiffX = e.clientX - initialCLickPosition.x;
          const DiffY = e.clientY - initialCLickPosition.y;
          const origin = {
            x: Ref.current.clientWidth / 2,
            y: Ref.current.clientHeight / 2,
          };
          const Degree =
            (Math.atan2(DiffY - origin.y, DiffX - origin.x) * 180) / Math.PI;
          setRotate(Degree);
        }
      }
    };

    const MouseUpEvent = () => {
      setMouseDown(false);
    };

    document.addEventListener("mousemove", MouseMoveEvent);

    document.addEventListener("mouseup", MouseUpEvent);
    return () => {
      document.removeEventListener("mouseup", MouseUpEvent);
      document.removeEventListener("mousemove", MouseMoveEvent);
    };
  }, [mouseDown]);

  return (
    <div
      style={{
        transform: `translate(${transform.x}px,${transform.y}px)`,
      }}
    >
      <div
        style={{
          rotate: `${rotate}deg`,
        }}
        ref={Ref as MutableRefObject<HTMLDivElement>}
        className={cn(
          "p-4 h-full w-full group relative border transition-all border-dashed border-opacity-0 hover:border-opacity-25 active:border-opacity-100 border-white",
          {}
        )}
      >
        <button
          onMouseDown={(e) => {
            setMouseDown(true);
            setInitialCLickPosition({ x: e.clientX, y: e.clientY });
            setActionType("move");
          }}
          style={{
            transformOrigin: "top left",
            width: width == undefined ? "34px" : `${width}px`,
            overflow: "hidden",

            height: height == undefined ? "34px" : `${height}px`,
          }}
          className="cursor-move"
        >
          {children}
        </button>

        <button
          onMouseDown={(e) => {
            setMouseDown(true);
            setInitialCLickPosition({ x: e.clientX, y: e.clientY });
            setActionType("resize");
          }}
          className="absolute  opacity-0 group-hover:opacity-100 hover:opacity-100 z-10 h-2 w-2 rounded-full bg-blue-400 bottom-0 cursor-se-resize  right-0 translate-x-1/2 translate-y-1/2"
        />

        <div className="absolute border-opacity-0 group-hover:border-opacity-40 group-active:border-opacity-100 border-white  bottom-full left-1/2 border-l  border-dashed">
          <div className="h-10 w-0.5 relative">
            <button
              onMouseDown={(e) => {
                setMouseDown(true);
                setInitialCLickPosition({ x: e.clientX, y: e.clientY });
                setActionType("rotate");
              }}
              className="h-2 origin-center w-2 bottom-full opacity-0 group-hover:opacity-100 hover:opacity-100 z-10 transition-all rounded-full bg-blue-400 absolute cursor-crosshair  -translate-x-[40%] -left-1/2  "
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [Overlay, setOverlay] = React.useState<
    {
      position: { x: number; y: number };
      message: string;
    }[]
  >([]);

  // useEffect(() => {
  //   document.addEventListener("mousemove", (e) => {
  //     console.log(e.clientX);
  //     console.log(e.clientY);
  //   });
  // }, []);

  const Ref = React.useRef<HTMLDivElement>();

  const HandlerRef = React.useRef<HTMLDivElement>();

  return (
    <>
      {/* <div>
       
      </div> */}
      <main className="min-h-screen bg-[#110E1B] grid place-content-center">
        {/* <Handler /> */}
        <section
          ref={Ref as MutableRefObject<HTMLDivElement>}
          onClick={(e) => {
            if (!HandlerRef.current?.contains(e.target as Node)) {
              const Rect = e.currentTarget.getBoundingClientRect();
              const X = e.currentTarget.clientHeight; // e.nativeEvent.offsetX
              const Y = e.currentTarget.clientWidth; // e.nativeEvent.offsetY
              const CurrentEle = Ref.current;
              if (CurrentEle) {
                setOverlay((prev) => [
                  ...prev,
                  {
                    position: {
                      x: e.clientX - Rect.left,
                      y: e.clientY - Rect.top,
                    },
                    message: "Hello",
                  },
                ]);
              }
            }
          }}
          className="h-60 w-80 relative overflow-hidden bg-gray-500"
        >
          {Overlay.map((data) => {
            return (
              <div
                style={{
                  left: data.position.x,
                  top: data.position.y,
                }}
                ref={HandlerRef as MutableRefObject<HTMLDivElement>}
                className="absolute z-30"
              >
                <Handler>
                  {" "}
                  <span>Hello World</span>
                </Handler>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

function MainScreen() {
  return (
    <>
      <main className="min-h-screen bg-[#110E1B] flex flex-col">
        <NavBar />
        <section className="flex-grow h-full w-full flex relative lg:static">
          <SideBar />
          <div className="lg:pl-5 pl-16 w-full p-5">
            <HeroFeed />
            <section className="grid lg:grid-cols-3 gap-5 mt-5">
              <Feed />
              <Feed />
              <Feed />
              <Feed />
              <Feed />
              <Feed />
              <Feed />
              <Feed />
              <Feed />
            </section>
          </div>
        </section>
      </main>
    </>
  );
}

function NavBar() {
  const [mobileSearch, setMobileSearch] = React.useState(false);
  return (
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
        {!mobileSearch ? (
          <>
            <div className="flex gap-4 items-center lg:hidden">
              <button
                className={cn(
                  "bg-[#110E1B]   h-fit text-white font-medium px-3 py-0.5 rounded-sm hover:border-white/40 border border-transparent hover:text-[#3C162F] hover:bg-white transition-colors"
                )}
              >
                Login
              </button>
              <button
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
            className={cn(
              "bg-[#110E1B]   h-fit text-white font-medium px-3 py-0.5 rounded-sm hover:border-white/40 border border-transparent hover:text-[#3C162F] hover:bg-white transition-colors"
            )}
          >
            Login
          </button>
          <button
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
      </div>
    </nav>
  );
}

function SideBar() {
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
        onClick={() => setSideBarSelected("Home")}
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

function HeroFeed() {
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
          <button className="bg-white hover:bg-[#110E1B] lg:w-fit w-full  border block border-transparent hover:border-white transition-all hover:text-white px-2 py-1 rounded-sm mt-4 font-medium">
            Add Your URL
          </button>
        </div>
      </div>
      <div>Video Player Here</div>
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

function Feed() {
  return (
    <div className="h-48 w-full grid-rows-12 p-2 grid  border gap-1 rounded-md">
      <div className="row-span-9 bg-gray-200/20 rounded-md h-full">Hello</div>
      <div className="row-span-3 flex justify-between">
        <div>
          <div className="text-white font-semibold">Title</div>
          <div className="text-white font-thin">Upload Date</div>
        </div>
        <div className="grid grid-rows-4 gap-1">
          <div className="row-span-2 h-6 w-6 rounded-full ml-auto  bg-white"></div>
          <div className="row-span-2 text-xs text-white ">Dhananjay Senday</div>
        </div>
      </div>
    </div>
  );
}

export default App;

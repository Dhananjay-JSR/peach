import {
  Android,
  PersonCircle,
  Search,
  House,
  Map,
  ArrowLeftSquare,
  Activity,
  ArrowRightSquare,
} from "react-bootstrap-icons";
import Logo from "./assets/Logo.png";
import { cn } from "./lib/utils";
import React, { useEffect } from "react";
import SceneRenderer from "./components/SceneRenderer";

function App() {
  return (
    <>
      <main className="min-h-screen bg-[#110E1B] grid place-content-center">
        <SceneRenderer
          height={270}
          width={479}
          // 479x270
          // 320x180
          url="http://localhost:3000/index.m3u8"
        />
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

export default MainScreen;

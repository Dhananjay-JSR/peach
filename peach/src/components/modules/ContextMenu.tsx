import { useEffect } from "react";
import ReactDOM from "react-dom";
import { OverlayData } from "../../utils/contants";

export default function ContextMenuRenderer({
  ChildrenMoving,
  ContextMenuPosition,
  Ref,
  StickerResource,
  setOverlay,
  setShowContextMenu,
}: {
  ContextMenuPosition: {
    x: number;
    y: number;
  };
  ChildrenMoving: boolean;
  StickerResource: {
    name: string;
    src: string;
  }[];

  Ref: React.MutableRefObject<HTMLDivElement | undefined>;
  setOverlay: React.Dispatch<React.SetStateAction<OverlayData[]>>;
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  useEffect(() => {
    const KeyDownHandler = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        setShowContextMenu(false);
      }
    };
    document.addEventListener("keydown", KeyDownHandler);
    return () => {
      document.removeEventListener("keydown", KeyDownHandler);
    };
  }, []);

  return ReactDOM.createPortal(
    <div
      style={{
        zIndex: 99999,
      }}
      className="fixed w-screen  h-screen"
    >
      <div
        className=" z-40 w-24 bg-[#110E1B] rounded-lg"
        style={{
          position: "absolute",
          top: `${ContextMenuPosition.y}px`,
          left: `${ContextMenuPosition.x}px`,
        }}
      >
        <div className="relative">
          <button
            onClick={() => {
              if (!ChildrenMoving) {
                const PlayerContext = Ref.current;
                if (PlayerContext) {
                  const Rect = PlayerContext.getBoundingClientRect();
                  setOverlay((prev) => [
                    ...prev,
                    {
                      height: 100,
                      width: 100,
                      rotate: 0,
                      transform: {
                        x: 0,
                        y: 0,
                      },
                      id: Math.random().toString(),
                      position: {
                        left: ContextMenuPosition.x - Rect.left,
                        top: ContextMenuPosition.y - Rect.top,
                      },
                      content: undefined,
                      type: "text",
                    },
                  ]);
                }
              }

              setShowContextMenu(false);
            }}
            className="text-xs w-full rounded-t-lg text-white py-1 hover:bg-white hover:text-[#110E1B] transition-all"
          >
            TEXT
          </button>
          <div className="h-[1px] w-[94%] bg-gray-300 my-0.5 mx-auto " />
          <button className="text-xs rounded-b-lg peer relative w-full text-white py-1 hover:bg-white hover:text-[#110E1B] transition-all">
            STICKER <span className="float-right pr-2">{">"}</span>
          </button>
          <div className="absolute border-l w-32 bg-[#110E1B] rounded-sm left-full top-0 peer-hover:flex hidden hover:flex  flex-col">
            {StickerResource.map((d) => (
              <button
                onClick={() => {
                  if (!ChildrenMoving) {
                    const PlayerContext = Ref.current;
                    if (PlayerContext) {
                      const Rect = PlayerContext.getBoundingClientRect();
                      setOverlay((prev) => [
                        ...prev,
                        {
                          height: 100,
                          width: 100,
                          rotate: 0,
                          transform: {
                            x: 0,
                            y: 0,
                          },
                          id: Math.random().toString(),
                          position: {
                            left: ContextMenuPosition.x - Rect.left,
                            top: ContextMenuPosition.y - Rect.top,
                          },
                          content: d.src,
                          type: "sticker",
                        },
                      ]);
                    }
                    setShowContextMenu(false);
                  }
                }}
                className="text-sm  px-2 text-white py-1 hover:bg-white hover:text-[#110E1B] transition-all"
                key={d.name}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal") as HTMLElement
  );
}

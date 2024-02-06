import React, { useEffect } from "react";
import VideoPlayer from "./modules/PlayerController";
import ContextMenuRenderer from "./modules/ContextMenu";
import Handler from "./modules/Handler";
import { StickerResource } from "./modules/StickerResource";
import TextInputPlaceholder from "./modules/TextInputHandler";

export default function SceneRenderer({
  height,
  url,
  width,
}: {
  url: string;
  height: number;
  width: number;
}) {
  const [ChildrenMoving, setChildrenMoving] = React.useState(false);

  const [Overlay, setOverlay] = React.useState<
    {
      type: "text" | "sticker";
      content: string | undefined;
      id: string;
      position: { x: number; y: number };
    }[]
  >([]);
  const HolderRef = React.useRef<HTMLDivElement>();

  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [ContextMenuPosition, setContextMenuPosition] = React.useState({
    x: 0,
    y: 0,
  });
  useEffect(() => {
    function ContextHandler(e: MouseEvent) {
      e.preventDefault();
      const LocalRef = HolderRef.current;
      if (LocalRef) {
        if (LocalRef.contains(e.target as Node)) {
          setShowContextMenu(true);
          setContextMenuPosition({ x: e.clientX, y: e.clientY });
        }
      }
    }

    document.addEventListener("contextmenu", ContextHandler);

    return () => {
      document.removeEventListener("contextmenu", ContextHandler);
    };
  }, []);
  return (
    <>
      {showContextMenu ? (
        <ContextMenuRenderer
          StickerResource={StickerResource}
          setOverlay={setOverlay}
          setShowContextMenu={setShowContextMenu}
          ChildrenMoving={ChildrenMoving}
          ContextMenuPosition={ContextMenuPosition}
          Ref={HolderRef}
        />
      ) : null}
      <VideoPlayer height={height} width={width} url={url} Ref={HolderRef}>
        {Overlay.map((data) => {
          if (data.type == "text") {
            if (data.content == undefined) {
              return (
                <TextInputPlaceholder
                  id={data.id}
                  position={data.position}
                  setPlaceholder={setOverlay}
                />
              );
            } else {
              return (
                <Handler
                  key={data.id}
                  id={data.id}
                  onClose={setOverlay}
                  Position={{
                    left: data.position.x,
                    top: data.position.y,
                  }}
                  ParentNotifier={setChildrenMoving}
                >
                  <span className="select-none text-gray-200 font-semibold">
                    {data.content}
                  </span>
                </Handler>
              );
            }
          } else if (data.type == "sticker") {
            return (
              <Handler
                key={data.id}
                id={data.id}
                onClose={setOverlay}
                Position={{
                  left: data.position.x,
                  top: data.position.y,
                }}
                ParentNotifier={setChildrenMoving}
              >
                <img
                  draggable={false}
                  src={data.content}
                  className="select-none h-full w-full"
                  alt="Sticker"
                />
              </Handler>
            );
          }
          return null;
        })}
      </VideoPlayer>
    </>
  );
}

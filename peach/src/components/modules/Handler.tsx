import React, { useRef, useEffect, MutableRefObject } from "react";
import { XOctagonFill } from "react-bootstrap-icons";
import { cn } from "../../lib/utils";

export default function Handler({
  children,
  ParentNotifier,
  Position,
  id,
  onClose,
}: {
  id?: string;
  onClose?: React.Dispatch<
    React.SetStateAction<
      {
        type: "text" | "sticker";
        content: string | undefined;
        id: string;
        position: {
          x: number;
          y: number;
        };
      }[]
    >
  >;
  Position: {
    top: number;
    left: number;
  };
  children?: React.ReactNode;
  ParentNotifier: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [mouseDown, setMouseDown] = React.useState(false);
  const [ActionType, setActionType] = React.useState<
    "resize" | "move" | "rotate" | "none"
  >("none");

  const [rotate, setRotate] = React.useState(0);

  const [height, setHeight] = React.useState<number>(100);
  const [width, setWidth] = React.useState<number>(100);
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
          }
        } else if (ActionType == "move") {
          const DiffX = transform.x + e.clientX - initialCLickPosition.x;
          const DiffY = transform.y + e.clientY - initialCLickPosition.y;
          setTransform({
            x: DiffX,
            y: DiffY,
          });
        } else if (ActionType == "rotate") {
          const LocalRef = Ref.current;
          if (LocalRef) {
            const DiffX = e.clientX - initialCLickPosition.x;
            const DiffY = e.clientY - initialCLickPosition.y;
            const origin = {
              x: LocalRef.clientWidth / 2,
              y: LocalRef.clientHeight / 2,
            };
            const Degree =
              (Math.atan2(DiffY - origin.y, DiffX - origin.x) * 180) / Math.PI;
            setRotate(Degree);
          }
        }
      }
    };

    const MouseUpEvent = () => {
      setMouseDown(false);
    };

    document.addEventListener("mousemove", MouseMoveEvent);

    document.addEventListener("mouseup", MouseUpEvent);

    if (mouseDown) {
      ParentNotifier(true);
    } else {
      ParentNotifier(false);
    }
    return () => {
      document.removeEventListener("mouseup", MouseUpEvent);
      document.removeEventListener("mousemove", MouseMoveEvent);
    };
  }, [mouseDown]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${Position.top}px`,
        left: `${Position.left}px`,
        transform: `translate(${transform.x}px,${transform.y}px)`,
      }}
    >
      <div
        style={{
          rotate: `${rotate}deg`,
        }}
        ref={Ref as MutableRefObject<HTMLDivElement>}
        className={cn(
          "h-full w-full group relative border transition-all border-dashed border-opacity-0 hover:border-opacity-25 active:border-opacity-100 border-white"
        )}
      >
        <div
          onMouseDown={(e) => {
            setMouseDown(true);
            setInitialCLickPosition({ x: e.clientX, y: e.clientY });
            setActionType("move");
          }}
          style={{
            width: `${width}px`,
            overflow: "hidden",
            height: `${height}px`,
          }}
          className="cursor-move"
        >
          {children}
        </div>

        <button
          onMouseDown={(e) => {
            setMouseDown(true);
            setInitialCLickPosition({ x: e.clientX, y: e.clientY });
            setActionType("resize");
          }}
          className={cn(
            "absolute  opacity-0 group-hover:opacity-40  hover:!opacity-100  z-10 h-2 w-2 rounded-full bg-blue-400 bottom-0 cursor-se-resize  right-0 translate-x-1/2 translate-y-1/2",
            {
              "!opacity-100": mouseDown,
            }
          )}
        />

        <button
          onMouseDown={() => {
            setMouseDown(true);
            if (onClose && id) {
              onClose((prev) => prev.filter((data) => data.id != id));
            }
          }}
          onMouseUp={() => {
            setMouseDown(false);
          }}
          className="absolute text-red-600 transition-all opacity-0 group-hover:opacity-40 hover:!opacity-100 group-active:opacity-100   top-0 right-0 translate-x-1/2 -translate-y-1/2   "
        >
          <XOctagonFill
            width={12}
            height={12}
            className="rounded-full bg-white"
          />
        </button>

        <div className="absolute border-opacity-0 group-hover:border-opacity-40 group-active:border-opacity-100 border-white  bottom-full left-1/2 border-l  border-dashed">
          <div className="h-4 w-0.5 relative">
            <button
              onMouseDown={(e) => {
                setMouseDown(true);
                setInitialCLickPosition({ x: e.clientX, y: e.clientY });
                setActionType("rotate");
              }}
              className={cn(
                "h-2 origin-center w-2  bottom-full opacity-0 group-hover:opacity-40 hover:!opacity-100 z-10 transition-all rounded-full bg-blue-400 absolute cursor-crosshair  -translate-x-[40%] -left-1/2  ",
                {
                  "!opacity-100": mouseDown,
                }
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

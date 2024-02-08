import React, { useRef, useEffect, MutableRefObject } from "react";
import { Check, X } from "react-bootstrap-icons";
import { OverlayData } from "../../utils/contants";

export default function TextInputPlaceholder({
  position,
  id,
  setPlaceholder,
}: {
  position: {
    top: number;
    left: number;
  };
  id: string;
  setPlaceholder: React.Dispatch<React.SetStateAction<OverlayData[]>>;
}) {
  const [value, setvalue] = React.useState("");
  const InpuyRef = useRef<HTMLInputElement>();

  useEffect(() => {
    InpuyRef.current?.focus();
  }, []);
  return (
    <div className="fixed h-screen w-screen">
      <div
        className="absolute"
        style={{ left: position.left, top: position.top }}
      >
        <div className="relative">
          <input
            ref={InpuyRef as MutableRefObject<HTMLInputElement>}
            onKeyDown={(e) => {
              const Key = e.key;
              if (Key == "Enter") {
                if (value === "") {
                  setPlaceholder((prev) =>
                    prev.filter((data) => data.id != id)
                  );
                } else {
                  setPlaceholder((prev) =>
                    prev.map((data) => {
                      if (data.id == id) {
                        return {
                          ...data,
                          content: value,
                        };
                      }
                      return data;
                    })
                  );
                }
              }
            }}
            placeholder="Enter Text Here"
            type="text"
            value={value}
            onChange={(e) => {
              const value = e.target.value;
              setvalue(value);
            }}
            className=" bg-[#110E1B] border-gray-200 border rounded-sm pr-9 text-white focus:outline-none text-sm py-1 w-36 px-1"
          />
          <button
            onClick={() => {
              if (value === "") {
                setPlaceholder((prev) => prev.filter((data) => data.id != id));
              } else {
                setPlaceholder((prev) =>
                  prev.map((data) => {
                    if (data.id == id) {
                      return {
                        ...data,
                        content: value,
                      };
                    }
                    return data;
                  })
                );
              }
            }}
            className="absolute text-white hover:text-green-400 transition-all right-5 top-1/2 -translate-y-1/2"
          >
            <Check />
          </button>
          <button
            onClick={() => {
              setPlaceholder((prev) => prev.filter((data) => data.id != id));
            }}
            className="absolute text-white hover:text-red-400 transition-all right-1 top-1/2 -translate-y-1/2"
          >
            <X />
          </button>
        </div>
      </div>
    </div>
  );
}

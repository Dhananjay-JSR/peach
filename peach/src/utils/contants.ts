import axios from "axios";

export const SERVER_URL = "http://127.0.0.1:5000";
export const API_VERSION = "v1";
export const API_URL = `${SERVER_URL}/api/${API_VERSION}`;
export enum ActionType {
  UPDATE_USER,
  TOGGLE_MODAL,
  MODAL_TYPE_LOGIN,
  MODAL_TYPE_SIGNUP,
  MODAL_TYPE_URL_INPUT,
}

export const AxiosDefined = axios.create({
  withCredentials: true,
});

export type OverlayData = {
  type: "text" | "sticker";
  content: string | undefined;
  id: string;
  transform: {
    x: number;
    y: number;
  };
  rotate: number;
  height: number;
  width: number;
  position: { left: number; top: number };
};

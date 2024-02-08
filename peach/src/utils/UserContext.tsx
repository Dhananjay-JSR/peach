import React, { useReducer } from "react";
import { ActionType } from "./contants";

type State = {
  email: string | null;
  username: string | null;
  profilePicture: string | null;
  loggedIn: boolean;
  showModel: boolean;
  modalType: "login" | "signup" | "urlInput";
};

const IntialState: State = {
  email: null,
  username: null,
  showModel: false,
  modalType: "login",
  loggedIn: false,
  profilePicture: null,
};

export const UserContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<{ type: ActionType; payload: State }>;
}>(
  {} as {
    state: State;
    dispatch: React.Dispatch<{ type: ActionType; payload: State }>;
  }
);

function ReducerFunction(
  state: State,
  action: {
    type: ActionType;
    payload: State;
  }
) {
  switch (action.type) {
    case ActionType.UPDATE_USER:
      return { ...state, ...action.payload };
    case ActionType.TOGGLE_MODAL:
      return { ...state, showModel: !state.showModel };
    case ActionType.MODAL_TYPE_LOGIN:
      return { ...state, modalType: "login" };
    case ActionType.MODAL_TYPE_SIGNUP:
      return { ...state, modalType: "signup" };
    case ActionType.MODAL_TYPE_URL_INPUT:
      return { ...state, modalType: "urlInput" };

    default:
      return state;
  }
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // @ts-ignore
  const [state, dispatch] = useReducer(ReducerFunction, IntialState);
  return (
    <UserContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

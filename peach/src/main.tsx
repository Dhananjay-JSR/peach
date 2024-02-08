import React from "react";
import ReactDOM from "react-dom/client";
import { HomeScreenDashboard } from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LayoutScreen from "./screens/layout/index.tsx";
import { UserProvider } from "./utils/UserContext.tsx";
import EditorScreen from "./screens/EditorScreen.tsx";
import PlayerScreen from "./screens/PlayerScreen.tsx";
import LoggedUserDashboard from "./screens/LoggedUserDashboard.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutScreen />,
    children: [
      {
        index: true,
        element: <HomeScreenDashboard />,
      },
      {
        path: "/editor/:id",
        element: <EditorScreen />,
      },
      {
        path: "/player/:id",
        element: <PlayerScreen />,
      },
      {
        path: "/dashboard",
        element: <LoggedUserDashboard />,
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);

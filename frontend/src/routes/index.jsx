// routes.jsx
import React from "react";
import MainLayout from "../layouts/MainLayout";
import { createHashRouter } from "react-router-dom";

import Dashboard_Tele from "./DashboardTele";


export const routes = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard_Tele /> },
    ],
  },
]);

export default routes;

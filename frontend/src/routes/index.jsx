// routes.jsx
import React from "react";
import MainLayout from "../layouts/MainLayout";
import { createHashRouter } from "react-router-dom";

import ViewPage from "../View/ViewPage";
import ManagementPage from "../View/ManagementPage";
import DepartmentDetailPage from "../View/DepartmentDetailPage";
import TopicDetailPage from "../View/TopicDetailPage";

export const routes = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { 
        index: true, 
        element: <ViewPage /> 
      },
      { 
        path: "management/:topicKey",  // 👈 เปลี่ยนเป็นรับ topicKey
        element: <ManagementPage /> 
      },
      { 
        path: "department/:departmentKey", 
        element: <DepartmentDetailPage /> 
      },
      { 
        path: "department/:departmentKey/topic/:topicKey",
        element: <TopicDetailPage /> 
      },
    ],
  },
]);

export default routes;
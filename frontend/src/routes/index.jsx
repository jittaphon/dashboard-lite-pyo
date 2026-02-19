// routes.jsx
import React from "react";
import MainLayout from "../layouts/MainLayout";
import { createHashRouter } from "react-router-dom";

import ViewPage from "../View/ViewPage";
import DepartmentDetailPage from "../View/DepartmentDetailPage";
import TopicDetailPage from "../View/TopicDetailPage";
import ModelPage from "../View/ModelPage";
import { Hammer } from "lucide-react"; // นำเข้า Icon ค้อนสำหรับหน้าปรับปรุง
import  AdminDashboard from "../View/Admin"; // นำเข้า ModelPage สำหรับหน้าปรับปรุง



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
        path: "department/:departmentKey", 
        element: <DepartmentDetailPage /> 
      },
      { 
        path: "department/:departmentKey/topic/:topicKey",
        element: <TopicDetailPage /> 
      },
      { 
        path: "model", // เพิ่ม path นี้
        element: <ModelPage /> 
      },
      {
        path: "admin", // เพิ่ม path นี้
        element: <AdminDashboard /> // ใช้ AdminDashboard เป็น component สำหรับหน้าปรับปรุง
      }
    ],
  },
]);

export default routes;
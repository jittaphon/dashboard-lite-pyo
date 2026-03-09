// routes.jsx
import React from "react";
import MainLayout from "../layouts/MainLayout";
// 1. เปลี่ยนจาก createHashRouter เป็น createBrowserRouter
import { createBrowserRouter } from "react-router-dom"; 

import ViewPage from "../View/ViewPage";
import DepartmentDetailPage from "../View/DepartmentDetailPage";
import TopicDetailPage from "../View/TopicDetailPage";
import ModelPage from "../View/ModelPage";
import AdminDashboard from "../View/admin/Admin";
import RequireAuth from "../components/util/RequireAuth";
import LoginCallback from "../View/admin/LoginCallback";
import DiseaseControlDepartment from "../View/adminOfDepartment/DiseaseControlDepartment";
// 2. ใช้ createBrowserRouter แทน
export const routes = createBrowserRouter([
  {
    path: "/authentication/callback",
    element: <LoginCallback />,
  },
  {
    path: '/authentication/member',
    element: (
     //<RequireAuth>
        <AdminDashboard />
     //</RequireAuth>
    ),
  },
   {
    path: '/authentication/member/department/disease-control',
    element: (
     //<RequireAuth>
        <DiseaseControlDepartment />
     //</RequireAuth>
    ),
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <ViewPage /> },
      { path: "department/:departmentKey", element: <DepartmentDetailPage /> },
      { path: "department/:departmentKey/topic/:topicKey", element: <TopicDetailPage /> },
      { path: "model", element: <ModelPage /> },
      { path: "admin", element: <AdminDashboard /> }
    ],
  },
], {
  // 3. สำคัญมาก: ใส่ basename ให้ตรงกับโฟลเดอร์ /datahub/ บน Server
  basename: "/datahub/kpi-pyo-hub/public"
});

export default routes;
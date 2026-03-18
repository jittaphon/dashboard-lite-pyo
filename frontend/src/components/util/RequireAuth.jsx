import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children, allowedRoles }) {
  const token = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const tokenExpiresAt = localStorage.getItem("token_expires_at");
  const userRole = localStorage.getItem("user_role"); // ดึง role ออกมา exchangeToken

  if (!token || !refreshToken) {
    return <Navigate to="/" replace />;
  }

  // เช็ค Token หมดอายุ
  if (tokenExpiresAt) {
    const expirationTime = parseInt(tokenExpiresAt);
    if (Date.now() >= expirationTime) {
      localStorage.clear(); // ล้างทั้งหมดเพื่อความสะอาด
      return <Navigate to="/" replace />;
    }
  }

  // --- ส่วนที่เพิ่ม: เช็คสิทธิ์ (Role Validation) ---
  // ถ้ามีการระบุสิทธิ์ที่เข้าได้ และ userRole ของคนนี้ไม่มีในรายการ ให้เตะกลับไปหน้าแรก
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
    return <Navigate to="/" replace />;
  }

  return children;
}
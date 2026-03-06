import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const tokenExpiresAt = localStorage.getItem("token_expires_at");

  if (!token || !refreshToken) {
    return <Navigate to="/" replace />;
  }

  if (tokenExpiresAt) {
    const expirationTime = parseInt(tokenExpiresAt);
    if (Date.now() >= expirationTime) {
      // Token หมดอายุ ล้าง localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expires_at");
      localStorage.removeItem("user_role");
      console.log("Token หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

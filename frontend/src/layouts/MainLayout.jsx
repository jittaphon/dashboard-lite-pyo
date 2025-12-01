import React, { useState, useEffect } from "react";
import { BarChart2, Settings, Home, Activity, FileText, Upload, Download, User, ShoppingCart } from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
// Main Layout Component
function MainLayout({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600">
       <ScrollToTop /> {/* เพิ่มตรงนี้ */}
      {/* Soft Glow Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-white opacity-15 blur-[180px] rounded-full"></div>
      </div>

      {/* Background decorative glows */}
      <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-teal-300 opacity-25 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-emerald-400 opacity-25 blur-[140px] rounded-full"></div>

      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Main App
export default function App() {
  return <MainLayout />;
}
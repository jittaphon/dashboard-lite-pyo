import { Outlet } from "react-router-dom";

import Footer from "../components/Footer";
import React, { useState, useEffect } from "react";

export default function MainLayout() {
  const [isLoaded, setIsLoaded] = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`
        flex flex-col h-screen 
        transition-opacity duration-1000 ease-in 
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
      `}
    >

      <div className="flex flex-1 relative">
        {/* Sidebar */}
       
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer ถ้ามี */}
      {/* <Footer /> */}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { FiUser } from "react-icons/fi";
import CryptoJS from "crypto-js";
import { Timer, LogOut, UserCircle, ChevronRight, AlertCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminButton({ project = "kpi-pyo-hub" }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [remaining, setRemaining] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("access_token");
      const tokenExpiresAt = localStorage.getItem("token_expires_at");

      if (token) {
        setIsLoggedIn(true);
        if (tokenExpiresAt) {
          const expirationTime = parseInt(tokenExpiresAt);
          const timeLeft = expirationTime - Date.now();
          setRemaining(Math.max(0, timeLeft));
        }
      } else {
        setIsLoggedIn(false);
        setRemaining(0);
      }
    };

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkAuthStatus();
    }, 1000);

    checkAuthStatus();
    return () => clearInterval(timer);
  }, []);

  function generateRandomString(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function generateCodeChallenge(codeVerifier) {
    const hash = CryptoJS.SHA256(codeVerifier);
    const base64String = hash.toString(CryptoJS.enc.Base64)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64String;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const state = generateRandomString(16);
    const codeVerifier = generateRandomString(64);

    localStorage.setItem("pkce_code_verifier", codeVerifier);
    localStorage.setItem("oauth_state", state);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: project,
      redirect_uri: `${import.meta.env.VITE_BASE_DOMAIN}/kpi-pyo-hub/public/authentication/callback`,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    });

    window.location.href = `${import.meta.env.VITE_API_BASE_URL_Auth}/api/v1/oauth2/authorize?${params.toString()}`;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");
    localStorage.removeItem("user_role");
    
    setIsLoggedIn(false);
    setRemaining(0);
    window.location.href = `${import.meta.env.VITE_BASE_DOMAIN}/kpi-pyo-hub/public/`;
  };

  // --- 🌟 จุดที่เพิ่มใหม่: ฟังก์ชันจัดการ Navigation ตาม Role ---
  const handleAdminNavigate = () => {
    const role = localStorage.getItem("user_role");
    setIsMenuOpen(false); // ปิดเมนูก่อนไป

    if (role === "DCadmin") {
      navigate('/authentication/member/department/disease-control');
    } else {
      // สำหรับ admin กลาง หรือ role อื่นๆ
      navigate('/authentication/member');
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = (date) => {
    return date.toLocaleString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  };

  if (!isLoggedIn) {
    return (
      <button onClick={handleLogin} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10 text-white">
        <FiUser size={20} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block text-right">
        <div className="text-[10px] text-white/40 uppercase tracking-widest">System Time</div>
        <div className="text-xs text-white/80 font-mono">{formatCurrentTime(currentTime)}</div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative group focus:outline-none z-[60]"
        >
          {remaining <= 0 && (
            <div className="absolute -top-0.5 -left-0.5 z-[70] bg-red-500 rounded-full p-0.5 border-2 border-[#0a0a0a]">
              <AlertCircle className="w-3 h-3 text-white" fill="currentColor" />
            </div>
          )}
          
          <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden group-hover:border-emerald-400 transition-all duration-300 shadow-lg">
            <img 
              src={`https://ui-avatars.com/api/?name=${localStorage.getItem("user_role") || 'Admin'}&background=059669&color=fff`} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </button>

        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-[100] cursor-default bg-black/10 backdrop-blur-[2px]" 
              onClick={() => setIsMenuOpen(false)}
            ></div>
            
            <div className="absolute right-0 mt-3 w-72 bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              
              <div className="p-5">
                <h3 className="text-white font-semibold text-[17px] leading-tight capitalize">
                  {localStorage.getItem("user_role") || "Administrator"}
                </h3>
                <p className="text-white/40 text-[13px] mt-1 truncate">
                  Phayao Data Hub System
                </p>
              </div>

              <div className="h-[1px] bg-white/5 mx-3" />

              <div className="p-2 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <div className={`p-1.5 rounded-lg ${remaining > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <Timer className={`w-4 h-4 ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <span className={remaining > 0 ? 'text-gray-300' : 'text-red-400 font-medium'}>
                    {remaining > 0 ? `เหลือเวลา ${formatTime(remaining)}` : 'หมดเวลาเชื่อมต่อ'}
                  </span>
                </div>

                {/* 🌟 จุดที่แก้ไข: ใช้ฟังก์ชัน handleAdminNavigate เพื่อแยกหน้าตาม Role */}
                <button 
                  onClick={handleAdminNavigate}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-white hover:bg-emerald-500/10 rounded-2xl transition-all duration-200 text-[14px] group/item"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover/item:bg-emerald-500/20 transition-colors">
                      <Settings className="w-4 h-4 text-emerald-400" />
                    </div>
                    {localStorage.getItem("user_role") === "DCadmin" ? "จัดการกองควบคุมโรค" : "จัดการระบบ"}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover/item:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="h-[1px] bg-white/5 mx-3" />

              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors text-[14px] font-medium"
                >
                  <div className="p-1.5 bg-red-500/10 rounded-lg">
                      <LogOut className="w-4 h-4" />
                  </div>
                  ลงชื่อออก
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
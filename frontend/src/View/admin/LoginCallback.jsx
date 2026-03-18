import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ เพิ่ม useNavigate
import { API } from "../../api";

export default function LoginCallback() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // ✅ ใช้ useNavigate แทน console.log
  const navigate = useNavigate();
useEffect(() => {
  const minLoadingTime = 2000;
  const startTime = Date.now();

  const progressTimer = setInterval(() => {
    setProgress(prev => {
      if (prev >= 90) return prev;
      return prev + Math.random() * 10;
    });
  }, 300);

  // --- ✅ รองรับทั้ง search และ hash ---
  let queryString = window.location.search;
  if (!queryString && window.location.hash.includes("?")) {
    queryString = "?" + window.location.hash.split("?")[1];
  }

  const searchParams = new URLSearchParams(queryString);
  const code = searchParams.get("code");

  if (!code) {
    clearInterval(progressTimer);
    setStatus("error");
    setError({ message: "No authorization code found in URL" });
    setProgress(100);
    return;
  }

  const pkceVerifier = localStorage.getItem("pkce_code_verifier");

  const performAuth = async () => {
    try {
      const res = await API.Auth.exchangeToken({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${import.meta.env.VITE_BASE_DOMAIN}/datahub/kpi-pyo-hub/public/authentication/callback`,
        client_id: "kpi-pyo-hub",
        code_verifier: pkceVerifier,
      });



      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      const expiresAt = Date.now() + 2 * 60 * 60 * 1000;

      setTimeout(() => {
        // เก็บ Token ปกติ
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);
        localStorage.setItem("token_expires_at", expiresAt.toString());
        
        // สมมติว่า res.data มีข้อมูล user หรือ role ส่งมาด้วย
        // หรือถ้าไม่มี คุณอาจต้องถอดรหัส JWT (decode) หรือเรียก API Profile อีกตัว
        const userRole = res.data.user?.role; // แก้ไขตามโครงสร้างข้อมูลจริงของคุณ
        localStorage.setItem("user_role", userRole); 

        setResponse(res);
        setStatus("success");
        setProgress(100);
        clearInterval(progressTimer);

        setTimeout(() => {
          // --- ส่วนที่ต้องแก้: เพิ่มเงื่อนไขการเด้งหน้า (Redirect Logic) ---
          if (userRole === "DCadmin") {
            navigate("/authentication/member/department/disease-control", { replace: true });
          } else {
            // Role อื่นๆ หรือ Admin ปกติ
            navigate("/authentication/member", { replace: true });
          }
        }, 1500);
      }, remainingTime);

    } catch (err) {
      console.error("Authentication failed:", err);
      clearInterval(progressTimer);
      setError(err);
      setStatus("error");
      setProgress(100);
    }
  };

  performAuth();

  return () => clearInterval(progressTimer);
}, [navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 p-8 text-center">

          {/* Icon */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className={`absolute inset-0 rounded-2xl opacity-20 animate-pulse ${
              status === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              status === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              'bg-gradient-to-r from-blue-500 to-green-500'
            }`}></div>
            <div className="relative flex items-center justify-center w-full h-full">
              {status === 'success' ? (
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              ) : status === 'error' ? (
                <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              ) : (
                <div className="relative">
                  <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ระบบสาธารณสุข</h1>
          <p className={`mb-8 ${
            status === 'success' ? 'text-green-600' :
            status === 'error' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {status === 'success' ? 'เชื่อมต่อระบบสำเร็จ! กำลังเข้าสู่หน้าหลัก...' :
             status === 'error' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' :
             'กำลังเชื่อมต่อระบบและยืนยันตัวตน...'}
          </p>

          {/* Progress */}
          {status === 'loading' && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>กำลังดำเนินการ</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
                  <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {progress < 30 ? 'กำลังตรวจสอบข้อมูล...' :
                 progress < 60 ? 'กำลังยืนยันตัวตน...' :
                 progress < 90 ? 'กำลังโหลดข้อมูลผู้ใช้...' :
                 'เกือบเสร็จแล้ว...'}
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">เข้าสู่ระบบสำเร็จ!</h3>
              <p className="text-sm text-gray-600">กำลังนำคุณไปยังหน้าหลัก...</p>
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && error && (
            <div className="text-left mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
                  <h3 className="text-lg font-semibold text-red-600">เกิดข้อผิดพลาด</h3>
                </div>
                <p className="text-red-700 mb-3">
                  {error.message || 'ไม่สามารถเชื่อมต่อระบบได้ในขณะนี้'}
                </p>
                <details className="text-xs">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800">รายละเอียดข้อผิดพลาด</summary>
                  <pre className="mt-2 bg-red-100 p-2 rounded border overflow-auto max-h-32 text-red-800">
                    {JSON.stringify(error.response || error, null, 2)}
                  </pre>
                </details>
                <div className="mt-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ลองใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">ขับเคลื่อนโดย กระทรวงสาธารณสุข</p>
        </div>
      </div>
    </div>
  );
}
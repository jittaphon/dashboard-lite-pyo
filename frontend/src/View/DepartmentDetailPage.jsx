// DepartmentDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useDepartmentStore from "../Store/useDepartmentStore";

export default function DepartmentDetailPage() {
  const { departmentKey } = useParams();
  const navigate = useNavigate();
  const departments = useDepartmentStore((state) => state.departments);
  const [isVisible, setIsVisible] = useState(false);

  const department = departments.find((dept) => dept.key === departmentKey);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => navigate("/"), 300);
  };

  if (!department) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="text-white text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูลแผนก</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl text-white hover:bg-white/30 transition"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float-reverse" />
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 max-w-7xl mx-auto px-16 py-20 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
        }`}
      >
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-all hover:gap-3 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">กลับ</span>
        </button>

        {/* Detail Card */}
        <div
          className={`bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 relative transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div
              className={`flex items-center gap-4 mb-6 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">
                  {department.id}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-md">
                  {department.title}
                </h1>
                <p className="text-white/60 text-lg mt-1 uppercase tracking-wide">
                  {department.key.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div
              className={`h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0 my-8 transition-all duration-700 ${
                isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
              }`}
              style={{ transitionDelay: "300ms" }}
            />

            {/* Topic Section */}
            <div
              className={`mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 drop-shadow">
                หัวข้อประเมิน (Topic)
              </h2>

              <div className="space-y-4">
                {department.topic?.map((item, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      navigate(
                        `/department/${departmentKey}/topic/${item.key}`
                      )
                    }
                    className="group relative pl-6 py-3 border-l-4 border-white/20 hover:border-cyan-300 transition-all cursor-pointer"
                  >
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/50 group-hover:bg-cyan-300 shadow group-hover:shadow-cyan-300/60 transition-all" />

                    <p className="text-white text-lg font-medium group-hover:text-cyan-200 transition">
                      {item.title}
                    </p>

                    <span className="text-xs text-white/50 uppercase tracking-wide bg-white/10 px-2 py-1 rounded-md mt-1 inline-block group-hover:text-cyan-200 group-hover:bg-cyan-300/10 transition">
                      {item.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

import React from "react";
import { motion } from "framer-motion";

export default function Login() {
  const formVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 overflow-hidden">
      {/* Background Blob */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-300 opacity-30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-300 opacity-30 blur-3xl rounded-full animate-pulse delay-2000" />

      {/* Login Card */}
      <motion.div
        className="w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-2xl p-8 relative z-10"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
          🔐 เข้าสู่ระบบ
        </h2>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            เข้าสู่ระบบ
          </motion.button>
        </form>

       
      </motion.div>
    </div>
  );
}

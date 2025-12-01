import React from "react";
import { ShoppingCart } from "lucide-react";

export default function ManagementPage() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden ">

      {/* Soft Glow Center */}
     
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-16 py-20 flex flex-col lg:flex-row items-center justify-between">

        {/* Left text */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-white leading-tight drop-shadow-md">
            Relax 30 <br /> Dissolvable Wafers
          </h1>

          <p className="text-white/80 mt-4 text-lg">250 mg</p>

          <p className="mt-10 text-white/70 max-w-md">
            We work in close partnership with our clients — including
            the NHS, the military, major private healthcare providers
            and GP practices.
          </p>
        </div>

        {/* Center product image with glow */}
        <div className="flex-1 flex justify-center relative">
          {/* Glow behind product */}
          <div className="absolute w-72 h-72 bg-white/40 blur-[100px] rounded-full"></div>

          <img
            src="/product.png"
            alt="product"
            className="relative w-72 drop-shadow-2xl"
          />
        </div>

        {/* Right controls */}
        <div className="flex-1 flex flex-col items-end text-right">

          {/* pill buttons */}
          <div className="flex gap-3 mb-10">
            {[30, 60, 90].map((v) => (
              <button
                key={v}
                className="px-4 py-2 rounded-full bg-white/20 text-white font-semibold hover:bg-white/30 transition"
              >
                {v}
              </button>
            ))}
          </div>

          {/* price */}
          <p className="text-4xl font-bold text-white drop-shadow-md mb-6">
            $25.50
          </p>

          {/* qty + buy now */}
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm">
              2
            </div>

            <button className="bg-white text-emerald-600 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-gray-100 transition">
              <ShoppingCart className="w-5 h-5" />
              Buy Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

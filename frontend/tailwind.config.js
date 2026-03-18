/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // ← สำคัญมาก
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'sans-serif'], // ตั้ง default ให้เป็น Prompt
      },
      animation: {
        blob: 'blob 8s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.1)' },
        },
    },
  },
  },
  plugins: [],
};

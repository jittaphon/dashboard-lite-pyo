import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  // ✅ ใช้ base แทน basename และต้องตรงกับ Router basename
  // เปลี่ยน base ให้รวม /datahub/ เข้าไปด้วย
  base: '/dash_data/public', // <--- เพิ่ม /datahub/ เข้าไป และอย่าลืมใส่ / ปิดท้าย!
  build: {
    outDir: resolve(__dirname, '../public'),
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  },
})
// ในไฟล์ src/Store/useDepartmentStore.js
import { create } from 'zustand';
import departmentData from '../Mock/department.json'; // Import ข้อมูล Mock เข้ามาใน Store

const useDepartmentStore = create((set) => ({
  departments: departmentData || [], // ตั้งค่า Initial State เป็นข้อมูลจาก JSON
  isLoading: false,
  // Action สำหรับการดึงข้อมูล (ในอนาคตจะเปลี่ยนไป Fetch จาก API)
  fetchDepartments: async () => {
    set({ isLoading: true });
    // ในขั้นต้น: ไม่ต้องทำอะไร เพราะโหลดจาก JSON มาแล้ว
    // ในอนาคต: await fetch('/api/departments') ... set(data)
    set({ isLoading: false });
  },
  // Action อื่น ๆ เช่น เพิ่ม แก้ไข ลบ
}));

export default useDepartmentStore;
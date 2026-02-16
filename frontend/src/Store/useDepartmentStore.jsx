// src/Store/useDepartmentStore.js
import { create } from 'zustand';

const useDepartmentStore = create((set) => ({
  departments: [],
  isLoading: false,
  fetchDepartments: async (year) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`http://203.157.189.9/datahub/kpi-pyo-hub/backend/public/index.php/api/v1/kpi/dashboard?year=${year}`);
      const data = await response.json();
      set({ departments: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));

export default useDepartmentStore;
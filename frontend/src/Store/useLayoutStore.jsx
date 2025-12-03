// src/Store/useLayoutStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLayoutStore = create(
  persist(
    (set, get) => ({
      // Structure: { [topicKey]: { items: [], gridLayout: [] } }
      layouts: {},

      // บันทึก layout สำหรับ topic
      saveLayout: (topicKey, items, gridLayout) => {
        set((state) => ({
          layouts: {
            ...state.layouts,
            [topicKey]: {
              items: items,
              gridLayout: gridLayout,
              updatedAt: new Date().toISOString()
            }
          }
        }));
      },

      // ดึง layout ของ topic
      getLayout: (topicKey) => {
        return get().layouts[topicKey] || null;
      },

      // ลบ layout
      deleteLayout: (topicKey) => {
        set((state) => {
          const newLayouts = { ...state.layouts };
          delete newLayouts[topicKey];
          return { layouts: newLayouts };
        });
      },

      // Clear ทั้งหมด
      clearAllLayouts: () => {
        set({ layouts: {} });
      }
    }),
    {
      name: 'layout-storage', // key ใน localStorage
    }
  )
);

export default useLayoutStore;
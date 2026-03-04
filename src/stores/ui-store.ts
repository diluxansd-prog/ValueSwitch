import { create } from "zustand";

interface UIStore {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  compareDrawerOpen: boolean;
  setCompareDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  compareDrawerOpen: false,
  setCompareDrawerOpen: (open) => set({ compareDrawerOpen: open }),
}));

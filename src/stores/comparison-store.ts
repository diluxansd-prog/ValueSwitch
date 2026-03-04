import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlanWithProvider } from "@/types/comparison";

interface ComparisonStore {
  items: PlanWithProvider[];
  addItem: (plan: PlanWithProvider) => void;
  removeItem: (planId: string) => void;
  clearItems: () => void;
  isInBasket: (planId: string) => boolean;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (plan) => {
        const { items } = get();
        if (items.length >= 3) return;
        if (items.find((i) => i.id === plan.id)) return;
        set({ items: [...items, plan] });
      },
      removeItem: (planId) => {
        set({ items: get().items.filter((i) => i.id !== planId) });
      },
      clearItems: () => set({ items: [] }),
      isInBasket: (planId) => get().items.some((i) => i.id === planId),
    }),
    { name: "vs-comparison-basket" }
  )
);

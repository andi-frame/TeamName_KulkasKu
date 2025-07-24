import { create } from "zustand";

interface NotificationState {
  showExpiryNotification: boolean;
  hasCheckedToday: boolean;
  setShowExpiryNotification: (show: boolean) => void;
  setHasCheckedToday: (checked: boolean) => void;
  resetForNewSession: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  showExpiryNotification: false,
  hasCheckedToday: false,
  setShowExpiryNotification: (show) => set({ showExpiryNotification: show }),
  setHasCheckedToday: (checked) => set({ hasCheckedToday: checked }),
  resetForNewSession: () => set({ showExpiryNotification: false, hasCheckedToday: false }),
}));

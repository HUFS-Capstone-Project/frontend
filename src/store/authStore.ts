import { create } from "zustand";

type AuthState = {
  isLoggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
}));

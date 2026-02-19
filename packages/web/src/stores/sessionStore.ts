import { create } from "zustand";

interface SessionState {
  sessionData: unknown;
  setSessionData: (data: unknown) => void;
}

const getInitialState = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("sessionData") || "null");
  }
  return null;
};

const useSessionStore = create<SessionState>((set) => ({
  sessionData: getInitialState(),
  setSessionData: (data) => {
    set({ sessionData: data });
    if (typeof window !== "undefined") {
      localStorage.setItem("sessionData", JSON.stringify(data));
    }
  },
}));

export default useSessionStore;

'use client';

import {create} from 'zustand';

interface SessionState {
  sessionData: any;
  setSessionData: (data: any) => void;
}

const useSessionStore = create<SessionState>((set: (arg0: { sessionData: any; }) => any) => ({
    sessionData: JSON.parse(localStorage.getItem('sessionData') || 'null'),
    setSessionData: (data) => {
      set({ sessionData: data });
      localStorage.setItem('sessionData', JSON.stringify(data));
    },
}));

export default useSessionStore;
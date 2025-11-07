import React, { createContext, useContext, useRef, ReactNode } from 'react';

interface OvernightStayContextType {
  registerRefresh: (refreshFn: () => void) => void;
  refresh: () => void;
}

const OvernightStayContext = createContext<OvernightStayContextType | null>(null);

export function OvernightStayProvider({ children }: { children: ReactNode }) {
  const refreshFnRef = useRef<(() => void) | null>(null);

  const registerRefresh = (refreshFn: () => void) => {
    refreshFnRef.current = refreshFn;
  };

  const refresh = () => {
    if (refreshFnRef.current) {
      refreshFnRef.current();
    }
  };

  return (
    <OvernightStayContext.Provider value={{ registerRefresh, refresh }}>
      {children}
    </OvernightStayContext.Provider>
  );
}

export function useOvernightStay() {
  const context = useContext(OvernightStayContext);
  if (!context) {
    throw new Error('useOvernightStay must be used within OvernightStayProvider');
  }
  return context;
}


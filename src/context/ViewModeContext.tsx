import React, { createContext, useContext, useState, useEffect } from 'react';

export type ViewMode = 'simple' | 'technical';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isSimple: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('aquaquantum_view_mode');
    return saved === 'technical' ? 'technical' : 'simple'; // Default to simple for accessibility!
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('aquaquantum_view_mode', mode);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'simple' ? 'technical' : 'simple');
  };

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        isSimple: viewMode === 'simple',
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};

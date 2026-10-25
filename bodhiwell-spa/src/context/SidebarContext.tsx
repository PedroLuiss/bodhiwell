import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SubmenuData } from '../types/dashboard';
import { useIsMobile } from '../hooks/use-mobile';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  submenuData: SubmenuData;
  setSubmenu: (data: SubmenuData) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);



export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [submenuData, setSubmenuData] = useState<SubmenuData>({ items: null, title: null });
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      if (prev) {
        setSubmenuData({ items: null, title: null });
      }
      return !prev;
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSubmenuData({ items: null, title: null });
  };

  const setSubmenu = (data: SubmenuData) => {
    setSubmenuData(data);
  };

  const value = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    submenuData,
    setSubmenu
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
'use client';

import { createContext, useContext } from 'react';

export interface SidebarContextValue {
  sidebarOpen: boolean;
}

export const SidebarContext = createContext<SidebarContextValue>({ sidebarOpen: false });

export function useSidebar() {
  return useContext(SidebarContext);
}

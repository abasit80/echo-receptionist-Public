"use client";

import { createContext, useContext, useState } from "react";

type SidebarMode = "expanded" | "collapsed" | "hidden";

const SidebarContext = createContext<{
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  toggleHidden: () => void;
  toggleCollapsed: () => void;
}>({
  mode: "hidden",
  setMode: () => {},
  toggleHidden: () => {},
  toggleCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SidebarMode>("hidden");

  function persist(next: SidebarMode) {
    setMode(next);
    window.localStorage.setItem("echo-sidebar", next);
  }

  return (
    <SidebarContext.Provider
      value={{
        mode,
        setMode: persist,
        toggleHidden: () => persist(mode === "hidden" ? "expanded" : "hidden"),
        toggleCollapsed: () =>
          persist(mode === "collapsed" ? "expanded" : "collapsed"),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

"use client";

import { createContext, useContext, useState } from "react";

const IndustryContext = createContext<{
  industry: string;
  setIndustry: (id: string) => void;
}>({
  industry: "home",
  setIndustry: () => {},
});

export function IndustryProvider({ children }: { children: React.ReactNode }) {
  const [industry, setIndustry] = useState("home");
  return (
    <IndustryContext.Provider value={{ industry, setIndustry }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  return useContext(IndustryContext);
}

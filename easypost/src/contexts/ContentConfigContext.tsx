"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ContentConfigContextType {
  platform: string;
  setPlatform: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  objective: string;
  setObjective: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  slides: number;
  setSlides: (value: number) => void;
}

const ContentConfigContext = createContext<ContentConfigContextType | null>(
  null,
);

export function ContentConfigProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState("instagram");
  const [theme, setTheme] = useState("AIGenerated");
  const [objective, setObjective] = useState("commercial");
  const [language, setLanguage] = useState("portugueseBR");
  const [slides, setSlides] = useState(5);

  return (
    <ContentConfigContext.Provider
      value={{
        platform,
        setPlatform,
        theme,
        setTheme,
        objective,
        setObjective,
        language,
        setLanguage,
        slides,
        setSlides,
      }}
    >
      {children}
    </ContentConfigContext.Provider>
  );
}

export function useContentConfig() {
  const context = useContext(ContentConfigContext);
  if (!context) {
    throw new Error(
      "useContentConfig deve ser usado dentro de ContentConfigProvider",
    );
  }
  return context;
}

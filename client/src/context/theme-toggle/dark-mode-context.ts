import { createContext, useContext } from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;
};

export const DarkModeContext =
  createContext<ThemeContextType | undefined>(undefined);

export const useDarkMode = (): ThemeContextType => {
  const context = useContext(DarkModeContext);

  if (!context) {
    throw new Error(
      "useDarkMode must be used within DarkModeProvider"
    );
  }

  return context;
};

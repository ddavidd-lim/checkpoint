import { useState } from "react";
import { DarkModeContext } from "./dark-mode-context";



export const DarkModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  const toggleDarkMode = () => setIsDarkMode((isDark) => !isDark)

  // Pass both value and setter to context
  const value = { isDarkMode, setIsDarkMode, toggleDarkMode };
  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};
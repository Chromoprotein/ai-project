import { useState, useEffect } from "react";

export const useMode = () => {

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  
  // Toggling light and dark mode
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return { theme, setTheme };

}
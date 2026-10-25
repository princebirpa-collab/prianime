import { createContext, useContext, useEffect, useState, useCallback } from "react";

export const THEMES = [
  { id: "royal", name: "Royal Gold", note: "Gilded midnight", mode: "dark", dots: ["#D4AF37", "#3D1D5A", "#07050A"] },
  { id: "void", name: "Void Cyan", note: "Starlit abyss", mode: "dark", dots: ["#38D9E8", "#3B2A6B", "#050418"] },
  { id: "crimson", name: "Crimson Dusk", note: "Ember court", mode: "dark", dots: ["#E0455F", "#5A1B2A", "#120406"] },
  { id: "jade", name: "Jade Empire", note: "Spirit forest", mode: "dark", dots: ["#38C98F", "#12352A", "#04120C"] },
  { id: "parchment", name: "Parchment", note: "Ivory archive", mode: "light", dots: ["#8A6A22", "#E7DCC8", "#F7F3EB"] },
  { id: "frost", name: "Frost Ivory", note: "Daylit theatre", mode: "light", dots: ["#1D6FA8", "#DCE7F1", "#F4F8FC"] },
];

const STORAGE_KEY = "pri-anime:theme";
const ThemeContext = createContext(null);

function applyTheme(id) {
  const theme = THEMES.find((t) => t.id === id) || THEMES[0];
  const root = document.documentElement;
  root.setAttribute("data-theme", theme.id);
  root.classList.toggle("dark", theme.mode === "dark");
  root.style.colorScheme = theme.mode;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "royal";
    return localStorage.getItem(STORAGE_KEY) || "royal";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((id) => {
    if (THEMES.some((t) => t.id === id)) setThemeState(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext) || { theme: "royal", setTheme: () => {}, themes: THEMES };
}

export const currentThemeMeta = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

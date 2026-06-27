import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "ascend-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function useTheme(): [Theme, (t: Theme) => void, () => void] {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Sync if another tab/component changed it
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return [theme, setThemeState, () => setThemeState(theme === "dark" ? "light" : "dark")];
}

// Inline script to apply theme before paint (avoids FOUC)
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark')t='dark';var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t;}catch(e){}})();`;

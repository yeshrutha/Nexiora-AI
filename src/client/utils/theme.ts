export type ThemeMode = "dark" | "light" | "system";

const THEME_KEY = "nexiora_theme_preference";

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light" || saved === "system") {
      return saved;
    }
  } catch (e) {}
  return "dark";
}

export function applyTheme(theme: ThemeMode): ThemeMode {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}

  const root = document.documentElement;
  let effectiveTheme: "dark" | "light" = "dark";

  if (theme === "system") {
    effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } else {
    effectiveTheme = theme;
  }

  if (effectiveTheme === "light") {
    root.classList.add("light-mode");
    root.classList.remove("dark");
  } else {
    root.classList.remove("light-mode");
    root.classList.add("dark");
  }

  return theme;
}

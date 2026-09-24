"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("capa-theme", theme);
  } catch {
    // localStorage unavailable (private mode, etc.) — theme just won't persist.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    // Reads a client-only value (DOM attribute set by the pre-hydration
    // script, or the OS preference) once after mount — there's no way to
    // know this during SSR, so a one-time effect-driven update is correct
    // here rather than a bug this lint rule is meant to catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  }, []);

  if (!theme) return <div className="size-9" />;

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
      className="flex size-9 items-center justify-center rounded-full text-ink-soft hover:bg-surface-raised"
    >
      {theme === "dark" ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
    </button>
  );
}

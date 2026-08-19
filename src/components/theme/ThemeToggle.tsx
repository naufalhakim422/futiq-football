"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-9 h-9 rounded-lg bg-pitch-850 border border-pitch-750", className)} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={cn(
        "p-2 rounded-lg transition-all duration-200 flex items-center justify-center relative",
        "bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-[#c3ff00]/50 text-slate-300 hover:text-white shadow-sm active:scale-95",
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-cyan-500 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}

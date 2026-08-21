"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  AnimatedThemeToggler,
  TransitionVariant,
} from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";
import { Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  variant?: TransitionVariant;
  duration?: number;
}

export function ThemeToggle({
  className,
  variant = "circle",
  duration = 450,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (resolvedTheme || theme || "light") as "light" | "dark";

  const buttonClasses = cn(
    "relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-foreground hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer p-0 shrink-0 select-none shadow-2xs",
    className,
  );

  if (!mounted) {
    return (
      <button type="button" className={buttonClasses}>
        <Sun className="h-4.5 w-4.5 shrink-0" />
      </button>
    );
  }

  return (
    <AnimatedThemeToggler
      theme={currentTheme}
      onThemeChange={(newTheme) => setTheme(newTheme)}
      variant={variant}
      duration={duration}
      className={buttonClasses}
      title="Toggle Light / Dark theme"
    />
  );
}

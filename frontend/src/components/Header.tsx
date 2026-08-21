"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const tick = () =>
      setTimeStr(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 shrink-0 z-30 flex items-center justify-between bg-[#FFE5CD] dark:bg-card text-foreground border-b border-border/60 dark:border-border/40 px-6 shadow-xs transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/Rishihood_University_idxo_lfgcw_2.png"
          alt="RU"
          className="h-8 w-8 object-contain"
        />
        <div>
          <p className="text-sm font-bold leading-tight tracking-tight text-foreground">
            RU Print Portal
          </p>
          <div className="flex items-center gap-1.5">
            <Shield className="h-2.5 w-2.5 text-primary" />
            <p className="text-[11px] text-primary font-semibold leading-tight">
              Admin Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {timeStr && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {timeStr}
          </div>
        )}

        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-border/40 ml-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-sm shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <span className="hidden md:block text-xs font-semibold text-foreground">
              {user.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sign out"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

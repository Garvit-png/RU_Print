"use client";

import React from "react";
import { LayoutDashboard, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "logs", label: "Print Logs", icon: ClipboardList },
  { id: "overview", label: "Overview", icon: LayoutDashboard },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col bg-card/30 backdrop-blur-md select-none h-full overflow-hidden">
        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto min-h-0">
          <p className="px-2 pt-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all text-left outline-none cursor-pointer",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 rounded-xl bg-primary/10 shadow-2xs"
                    transition={{ type: "spring", stiffness: 450, damping: 32, mass: 0.8 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="relative z-10"
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </motion.div>
                <span className="relative z-10 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3">
          <p className="text-[10px] text-muted-foreground/60 text-center tracking-wide font-medium">
            Rishihood University
          </p>
        </div>
      </aside>

      {/* Mobile top tabs */}
      <div className="md:hidden bg-background/95 backdrop-blur-md p-1.5 flex items-center justify-around gap-1 shrink-0 sticky top-14 z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-xl text-xs font-medium transition-colors outline-none cursor-pointer",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActivePill"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <Icon className={cn("h-3.5 w-3.5 relative z-10", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="relative z-10 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

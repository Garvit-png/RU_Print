"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, User2 } from "lucide-react";
import { UserType } from "@/lib/printStore";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (type: UserType) => void;
}

const options = [
  {
    type: "student" as UserType,
    icon: GraduationCap,
    label: "Student",
    desc: "Rishihood University student — requires enrollment number",
  },
  {
    type: "other" as UserType,
    icon: User2,
    label: "Other",
    desc: "Faculty, staff, or visitor — just your name needed",
  },
];

export function UserTypeSelect({ onSelect }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Who are you?</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Select your category to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.type}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 380, damping: 28 }}
              onClick={() => onSelect(opt.type)}
              className={cn(
                "group relative flex flex-col items-start gap-4 p-6 rounded-2xl border-2 border-border/60",
                "bg-card/50 backdrop-blur-md text-left",
                "hover:border-primary/60 hover:bg-primary/5 hover:shadow-md",
                "transition-all duration-200 cursor-pointer outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary/50"
              )}
            >
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {opt.desc}
                </p>
              </div>
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff, Printer, Lock, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    setIsLoading(true);

    // Small artificial delay so it feels like a real auth check
    await new Promise((r) => setTimeout(r, 600));

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error ?? "Login failed.");
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background p-3 sm:p-4 lg:p-6 font-sans overflow-hidden relative">
      {/* Top right — back + theme toggle */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        <button
          onClick={() => window.location.href = "/"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <ThemeToggle />
      </div>

      {/* ── Left panel — brand art (desktop only) ── */}
      <div className="hidden lg:relative lg:flex lg:w-[44%] lg:h-full rounded-[28px] overflow-hidden flex-col justify-between p-10 text-white shrink-0 select-none shadow-lg">
        {/* Background image */}
        <img
          src="/RU-BG.png"
          alt="Rishihood University"
          className="absolute inset-0 w-full h-full object-cover blur-[2px] brightness-[0.60] scale-[1.03]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/90 z-0" />

        {/* Top: Logo + name */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/Rishihood_University_idxo_lfgcw_2.png"
            alt="RU Logo"
            className="h-10 w-10 object-contain drop-shadow-md"
          />
          <div>
            <p className="text-base font-bold tracking-tight leading-none text-white drop-shadow-md">
              Rishihood University
            </p>
            <p className="text-[11px] font-semibold text-white/80 tracking-widest uppercase mt-1">
              Print Portal
            </p>
          </div>
        </div>

        {/* Bottom: headline */}
        <div className="relative z-10 mt-auto">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <Printer className="h-3.5 w-3.5 text-white/80" />
            <span className="text-[11px] font-semibold text-white/90 tracking-wide">
              University Printer Management
            </span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
            Print smarter,
            <br />
            not harder.
          </h2>
          <p className="text-sm text-white/75 mt-3 tracking-wide max-w-sm">
            Centralized print queue management for all Rishihood University printers.
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="w-full lg:w-[56%] flex flex-col justify-center px-6 sm:px-10 lg:px-20 pt-0 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="max-w-sm mx-auto w-full space-y-7"
        >
          {/* Mobile-only brand header */}
          <div className="flex items-center gap-3 lg:hidden">
            <img
              src="/Rishihood_University_idxo_lfgcw_2.png"
              alt="RU Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">
                Rishihood University
              </p>
              <p className="text-[11px] text-primary font-semibold tracking-widest uppercase">
                Print Portal — Admin
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your portal credentials to access the print management system.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-destructive/10 border border-destructive/25 p-3.5 text-xs text-destructive flex items-center gap-2.5"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80 block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="pl-10 h-11 text-sm bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-10 pr-11 h-11 text-sm bg-muted/40 border-border/60 focus-visible:ring-primary/50 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold rounded-xl mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Footer hint */}
          <p className="text-[11px] text-muted-foreground/60 text-center">
            Contact your administrator if you have forgotten your credentials.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/components/LoginPage";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatCards } from "@/components/StatCards";
import { PrintFlow } from "@/components/print/PrintFlow";
import { PrintJobsTable } from "@/components/admin/PrintJobsTable";

// ─── Admin dashboard (requires login) ────────────────────────────────────────
function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("logs");

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-7 w-7 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.7 }}
                className="space-y-6"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold tracking-tight">Print Logs</h2>
                  <p className="text-xs text-muted-foreground/80">
                    All print jobs submitted through the portal — live, auto-refreshing every 5 s.
                  </p>
                </div>
                <PrintJobsTable />
              </motion.div>
            )}

            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.7 }}
                className="space-y-6"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                  <p className="text-xs text-muted-foreground/80">
                    Summary of print activity across all stations.
                  </p>
                </div>
                <StatCards />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ─── Root: decide public vs admin based on ?admin=1 in URL ───────────────────
function Root() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.has("admin"));
  }, []);

  // Wait for client to read URL (avoids hydration mismatch)
  if (isAdmin === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <span className="h-7 w-7 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AuthProvider>
        <AdminDashboard />
      </AuthProvider>
    );
  }

  return <PrintFlow />;
}

export default function Page() {
  return <Root />;
}

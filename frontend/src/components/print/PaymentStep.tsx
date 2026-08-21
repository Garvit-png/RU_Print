"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PrintJob, updateJob } from "@/lib/printStore";
import {
  CheckCircle2,
  Loader2,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  Printer,
} from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const UPI_ID = "20260509024786@YesBank";
const MERCHANT_NAME = "RU Print Portal";

interface Props {
  job: PrintJob;
  onBack: () => void;
  onPaid: (job: PrintJob) => void;
}

type PayState = "waiting" | "verifying" | "success" | "failed";

function buildGPayUrl(amount: number, jobId: string) {
  const note = encodeURIComponent(`Print Job ${jobId}`);
  const name = encodeURIComponent(MERCHANT_NAME);
  // Standard UPI deep-link — opens GPay / any UPI app on mobile
  return `upi://pay?pa=${UPI_ID}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
}

function buildUpiWebUrl(amount: number, jobId: string) {
  // GPay web intent (Android) — falls back gracefully
  const base = buildGPayUrl(amount, jobId);
  return `intent:${base.replace("upi://", "")}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
}

export function PaymentStep({ job, onBack, onPaid }: Props) {
  const [payState, setPayState] = useState<PayState>("waiting");
  const [pollCount, setPollCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gpayUrl = buildGPayUrl(job.amount, job.id);

  // ─── Simulated payment polling ────────────────────────────────────────────
  // In production: replace this with a real API call to your backend
  // that checks whether the UPI transaction arrived.
  const startPolling = () => {
    if (intervalRef.current) return;
    setPayState("verifying");
    intervalRef.current = setInterval(() => {
      setPollCount((c) => {
        const next = c + 1;
        // Simulate: after 3 polls (6 s) mark as paid
        // Replace this block with: fetch("/api/check-payment?jobId=...").then(...)
        if (next >= 3) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          const updated = updateJob(job.id, { status: "paid" });
          if (updated) onPaid(updated);
          setPayState("success");
        }
        return next;
      });
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Payment</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Pay via GPay or any UPI app, then confirm below.
        </p>
      </div>

      {/* Amount card */}
      <div className="rounded-2xl bg-primary/8 border border-primary/25 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amount Due
          </p>
          <p className="text-4xl font-bold font-mono text-primary mt-1">
            ₹{job.amount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Job #{job.id} · {job.files.length} file{job.files.length !== 1 ? "s" : ""}
            {job.totalPages > 0 ? ` · ${job.totalPages} pages` : ""}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <p className="font-semibold">{MERCHANT_NAME}</p>
          <p className="font-mono text-[11px]">{UPI_ID}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {payState === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* GPay button */}
            <a
              href={gpayUrl}
              onClick={startPolling}
              className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm transition-colors"
            >
              <Smartphone className="h-5 w-5" />
              Pay ₹{job.amount} with GPay / UPI
            </a>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[11px] text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* Manual confirm — if user already paid via another method */}
            <Button
              variant="outline"
              className="w-full rounded-xl text-sm"
              onClick={startPolling}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              I've already paid — verify now
            </Button>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              After completing payment in your UPI app, tap{" "}
              <span className="font-semibold">verify</span> above. Your files
              will be sent to the printer automatically.
            </p>

            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-sm w-full rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" /> Go back
            </Button>
          </motion.div>
        )}

        {payState === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-6"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="text-center space-y-1">
              <p className="font-semibold text-sm">Verifying payment…</p>
              <p className="text-xs text-muted-foreground">
                This usually takes a few seconds. Please don't close this page.
              </p>
            </div>
          </motion.div>
        )}

        {payState === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="flex flex-col items-center gap-4 py-6"
          >
            <div className="p-4 rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-lg">Payment confirmed!</p>
              <p className="text-xs text-muted-foreground">
                Your files are being sent to the printer.
              </p>
            </div>
          </motion.div>
        )}

        {payState === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-destructive text-center font-medium">
              Payment could not be verified. Please try again.
            </p>
            <Button
              onClick={() => { setPayState("waiting"); setPollCount(0); }}
              className="w-full rounded-xl text-sm"
            >
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

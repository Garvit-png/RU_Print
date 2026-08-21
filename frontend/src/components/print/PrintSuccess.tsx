"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PrintJob, updateJob } from "@/lib/printStore";
import { CheckCircle2, Printer, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  job: PrintJob;
  onReset: () => void;
}

const PRINT_STAGES = [
  "Payment confirmed",
  "Connecting to printer",
  "Sending files",
  "Printing…",
  "Done!",
];

export function PrintSuccess({ job, onReset }: Props) {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Animate through printer stages
    let current = 0;
    const tick = () => {
      current += 1;
      if (current < PRINT_STAGES.length - 1) {
        setStage(current);
        setTimeout(tick, 1200);
      } else {
        setStage(PRINT_STAGES.length - 1);
        setDone(true);
        updateJob(job.id, { status: "done" });
      }
    };
    const timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className={`p-5 rounded-full ${done ? "bg-emerald-500/15" : "bg-primary/10"}`}
      >
        {done ? (
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        ) : (
          <Printer className="h-12 w-12 text-primary animate-pulse" />
        )}
      </motion.div>

      <div className="space-y-1">
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold"
        >
          {PRINT_STAGES[stage]}
        </motion.p>
        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground"
          >
            Job #{job.id} · collect your printout from the printer.
          </motion.p>
        )}
      </div>

      {/* Stage progress dots */}
      <div className="flex items-center gap-2">
        {PRINT_STAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === stage ? 1.3 : 1,
              backgroundColor: i <= stage ? "hsl(var(--primary))" : "hsl(var(--muted))",
            }}
            transition={{ duration: 0.25 }}
            className="h-2 w-2 rounded-full"
          />
        ))}
      </div>

      {/* File summary */}
      <div className="w-full rounded-2xl bg-muted/30 p-4 space-y-2 text-left">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Files Printed
        </p>
        {job.files.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs text-foreground truncate">{f.name}</p>
          </div>
        ))}
      </div>

      {/* New print job button — only show when done */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <Button
            onClick={onReset}
            variant="outline"
            className="w-full rounded-xl gap-2 text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Start a new print job
          </Button>
        </motion.div>
      )}
    </div>
  );
}

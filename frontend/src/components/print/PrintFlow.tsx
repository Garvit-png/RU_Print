"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserTypeSelect } from "@/components/print/UserTypeSelect";
import { DetailsForm } from "@/components/print/DetailsForm";
import { PaymentStep } from "@/components/print/PaymentStep";
import { PrintSuccess } from "@/components/print/PrintSuccess";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserType, PrintFile, PrintJob, createJob } from "@/lib/printStore";
import { Printer, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "type" | "details" | "payment" | "success";

const STEPS: { id: Step; label: string }[] = [
  { id: "type", label: "Who are you?" },
  { id: "details", label: "Your details" },
  { id: "payment", label: "Payment" },
  { id: "success", label: "Printing" },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.98,
  }),
};

export function PrintFlow() {
  const [step, setStep] = useState<Step>("type");
  const [dir, setDir] = useState(1);

  const [userType, setUserType] = useState<UserType>("student");
  const [activeJob, setActiveJob] = useState<PrintJob | null>(null);

  const go = (next: Step, direction: number) => {
    setDir(direction);
    setStep(next);
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleTypeSelect = (type: UserType) => {
    setUserType(type);
    go("details", 1);
  };

  const handleDetailsNext = (data: {
    name: string;
    enrollmentNo?: string;
    files: PrintFile[];
    totalPages: number;
    amount: number;
  }) => {
    const job = createJob({
      userType,
      name: data.name,
      enrollmentNo: data.enrollmentNo,
      files: data.files,
      totalPages: data.totalPages,
      amount: data.amount,
    });
    setActiveJob(job);
    go("payment", 1);
  };

  const handlePaid = (job: PrintJob) => {
    setActiveJob(job);
    go("success", 1);
  };

  const handleReset = () => {
    setActiveJob(null);
    go("type", -1);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans">
      {/* ── Top bar ── */}
      <header className="h-14 shrink-0 flex items-center justify-between bg-[#FFE5CD] dark:bg-card border-b border-border/60 px-5 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/Rishihood_University_idxo_lfgcw_2.png"
            alt="RU"
            className="h-8 w-8 object-contain"
          />
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">RU Print Portal</p>
            <p className="text-[11px] text-muted-foreground/80 leading-tight">
              Rishihood University
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg">

          {/* Step progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => {
                const isActive = s.id === step;
                const isDone = i < stepIndex;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                          isActive
                            ? "bg-primary border-primary text-primary-foreground scale-110"
                            : isDone
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-muted/50 border-border/50 text-muted-foreground"
                        )}
                      >
                        {isDone ? "✓" : i + 1}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-medium hidden sm:block transition-colors",
                          isActive ? "text-primary font-semibold" : "text-muted-foreground"
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-1 rounded-full transition-all duration-500",
                          i < stepIndex ? "bg-primary" : "bg-border/50"
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
                >
                  {step === "type" && (
                    <UserTypeSelect onSelect={handleTypeSelect} />
                  )}
                  {step === "details" && (
                    <DetailsForm
                      userType={userType}
                      onBack={() => go("type", -1)}
                      onNext={handleDetailsNext}
                    />
                  )}
                  {step === "payment" && activeJob && (
                    <PaymentStep
                      job={activeJob}
                      onBack={() => go("details", -1)}
                      onPaid={handlePaid}
                    />
                  )}
                  {step === "success" && activeJob && (
                    <PrintSuccess job={activeJob} onReset={handleReset} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Admin link */}
          {step === "type" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 text-center"
            >
              <a
                href="?admin=1"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-primary transition-colors"
              >
                Admin portal
                <ChevronRight className="h-3 w-3" />
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

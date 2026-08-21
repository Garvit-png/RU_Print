"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllJobs, PrintJob, JobStatus } from "@/lib/printStore";
import {
  Search,
  RefreshCw,
  GraduationCap,
  User2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<JobStatus, string> = {
  pending_payment:
    "bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/40",
  paid: "bg-blue-500/15 text-blue-800 dark:text-blue-200 border border-blue-500/30",
  printing:
    "bg-violet-500/15 text-violet-800 dark:text-violet-200 border border-violet-500/30",
  done: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30",
  failed: "bg-rose-500/15 text-rose-800 dark:text-rose-200 border border-rose-500/30",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  printing: "Printing",
  done: "Done",
  failed: "Failed",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function PrintJobsTable() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => setJobs(getAllJobs());

  useEffect(() => {
    load();
    // Auto-refresh every 5 s
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = jobs.filter((j) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      j.name.toLowerCase().includes(term) ||
      j.id.toLowerCase().includes(term) ||
      (j.enrollmentNo ?? "").toLowerCase().includes(term) ||
      j.files.some((f) => f.name.toLowerCase().includes(term));
    const matchStatus = statusFilter === "ALL" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusTabs: Array<{ id: JobStatus | "ALL"; label: string; count: number }> = [
    { id: "ALL", label: "All", count: jobs.length },
    { id: "pending_payment", label: "Pending", count: jobs.filter((j) => j.status === "pending_payment").length },
    { id: "paid", label: "Paid", count: jobs.filter((j) => j.status === "paid").length },
    { id: "printing", label: "Printing", count: jobs.filter((j) => j.status === "printing").length },
    { id: "done", label: "Done", count: jobs.filter((j) => j.status === "done").length },
    { id: "failed", label: "Failed", count: jobs.filter((j) => j.status === "failed").length },
  ];

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-card/50 backdrop-blur-md p-3.5 shadow-sm">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl overflow-x-auto shrink-0 select-none">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all outline-none cursor-pointer whitespace-nowrap",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminStatusPill"
                    className="absolute inset-0 rounded-lg bg-background/90 shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span className="relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted/60 text-muted-foreground">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + refresh */}
        <div className="flex items-center gap-2 flex-1 lg:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
            <Input
              placeholder="Search by name, job ID, file…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            className="gap-1.5 text-xs rounded-xl bg-muted/40 hover:bg-muted/70 shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card/40 backdrop-blur-md overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 dark:bg-muted/20 hover:bg-muted/30 border-none">
              <TableHead className="text-muted-foreground/70 font-semibold w-28">Job ID</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Name</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Files</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Amount</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Submitted</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-36 text-center text-xs text-muted-foreground">
                  {jobs.length === 0 ? "No print jobs yet." : "No jobs match your filter."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((job) => {
                const isExpanded = expandedId === job.id;
                return (
                  <React.Fragment key={job.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/40 transition-all"
                      onClick={() => setExpandedId(isExpanded ? null : job.id)}
                    >
                      {/* Job ID */}
                      <TableCell>
                        <span className="text-xs font-mono font-bold text-primary">
                          #{job.id}
                        </span>
                      </TableCell>

                      {/* Name + type */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-primary/10 shrink-0">
                            {job.userType === "student" ? (
                              <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <User2 className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {job.name}
                            </p>
                            {job.enrollmentNo && (
                              <p className="text-[11px] font-mono text-muted-foreground">
                                {job.enrollmentNo}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Files */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          <span className="text-xs text-foreground font-medium">
                            {job.files.length} file{job.files.length !== 1 ? "s" : ""}
                          </span>
                          {job.totalPages > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              · {job.totalPages} pg
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span className="text-sm font-bold font-mono text-foreground">
                          ₹{job.amount}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold",
                            STATUS_STYLES[job.status]
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {STATUS_LABEL[job.status]}
                        </span>
                      </TableCell>

                      {/* Time */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTime(job.createdAt)}
                        </span>
                      </TableCell>

                      {/* Expand toggle */}
                      <TableCell>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded file list */}
                    <AnimatePresence>
                      {isExpanded && (
                        <TableRow key={`${job.id}-expanded`} className="hover:bg-transparent">
                          <TableCell colSpan={7} className="p-0 border-none">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 bg-muted/20 space-y-2">
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  Files in this job
                                </p>
                                {job.files.map((f, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between gap-3 rounded-xl bg-card/60 border border-border/50 px-3.5 py-2.5"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <FileText className="h-4 w-4 text-primary shrink-0" />
                                      <p className="text-xs font-semibold text-foreground truncate">
                                        {f.name}
                                      </p>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                                      {formatBytes(f.size)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

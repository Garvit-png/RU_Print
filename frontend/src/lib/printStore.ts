// ─── Central in-memory print job store ───────────────────────────────────────
// In production replace this with API calls.  For now all state lives in
// localStorage so it survives a page refresh but stays purely client-side.

export type UserType = "student" | "other";
export type JobStatus = "pending_payment" | "paid" | "printing" | "done" | "failed";

export interface PrintFile {
  name: string;
  size: number;   // bytes
  type: string;
  dataUrl: string; // base64 — stored so admin can see file names
}

export interface PrintJob {
  id: string;           // UUID-like
  userType: UserType;
  name: string;
  enrollmentNo?: string; // students only
  files: PrintFile[];
  totalPages: number;   // user-provided estimate; 0 = unknown
  amount: number;       // in INR, calculated from pages
  upiRef?: string;      // set after payment
  status: JobStatus;
  createdAt: string;    // ISO
  updatedAt: string;
}

const STORE_KEY = "ruprint_jobs";

function loadJobs(): PrintJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs: PrintJob[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(jobs));
}

export function getAllJobs(): PrintJob[] {
  return loadJobs();
}

export function getJob(id: string): PrintJob | undefined {
  return loadJobs().find((j) => j.id === id);
}

export function createJob(
  partial: Omit<PrintJob, "id" | "status" | "createdAt" | "updatedAt">
): PrintJob {
  const now = new Date().toISOString();
  const job: PrintJob = {
    ...partial,
    id: Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: "pending_payment",
    createdAt: now,
    updatedAt: now,
  };
  const jobs = loadJobs();
  jobs.unshift(job);
  saveJobs(jobs);
  return job;
}

export function updateJob(id: string, patch: Partial<PrintJob>): PrintJob | null {
  const jobs = loadJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  jobs[idx] = { ...jobs[idx], ...patch, updatedAt: new Date().toISOString() };
  saveJobs(jobs);
  return jobs[idx];
}

// ₹1 per page, minimum ₹5
export function calcAmount(pages: number): number {
  if (!pages || pages <= 0) return 5;
  return Math.max(pages, 5);
}

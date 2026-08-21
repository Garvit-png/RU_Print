"use client";

// StudentTable — orientation check-in data removed.
// Replaced by PrintTable for print job management.

export interface Student {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  department: string;
  phone: string;
  status: "PENDING" | "CHECKED_IN" | "FLAGGED";
}

export function StudentTable() {
  return null;
}

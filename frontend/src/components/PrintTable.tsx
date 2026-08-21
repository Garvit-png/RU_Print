"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function PrintTable() {
  return (
    <div className="space-y-4">
      {/* Search / Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-card/50 backdrop-blur-md p-3.5 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/70 pointer-events-none z-10" />
          <Input
            placeholder="Search print jobs..."
            className="pl-10 h-10 text-xs bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
            disabled
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card/40 backdrop-blur-md overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 dark:bg-muted/20 hover:bg-muted/30 border-none">
              <TableHead className="text-muted-foreground/70 font-semibold">Job ID</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Document</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Printer</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Submitted By</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground/70 font-semibold">Pages</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={6}
                className="h-36 text-center text-muted-foreground text-xs"
              >
                No print jobs yet.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

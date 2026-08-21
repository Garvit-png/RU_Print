"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, CheckCircle2, Clock, IndianRupee } from "lucide-react";
import { getAllJobs } from "@/lib/printStore";

export function StatCards() {
  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    inQueue: 0,
    revenue: 0,
  });

  const load = () => {
    const jobs = getAllJobs();
    setStats({
      total: jobs.length,
      done: jobs.filter((j) => j.status === "done").length,
      inQueue: jobs.filter((j) =>
        ["pending_payment", "paid", "printing"].includes(j.status)
      ).length,
      revenue: jobs
        .filter((j) => j.status === "done" || j.status === "paid" || j.status === "printing")
        .reduce((sum, j) => sum + j.amount, 0),
    });
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const cards = [
    {
      title: "Total Jobs",
      value: stats.total.toString(),
      sub: "All time",
      icon: Printer,
    },
    {
      title: "Completed",
      value: stats.done.toString(),
      sub: "Successfully printed",
      icon: CheckCircle2,
    },
    {
      title: "In Queue",
      value: stats.inQueue.toString(),
      sub: "Pending / active",
      icon: Clock,
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue}`,
      sub: "Paid jobs total",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="border-none bg-card/40 backdrop-blur-md rounded-2xl shadow-xs"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl shrink-0 bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground/80 font-medium">{card.title}</p>
                <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
                  {card.value}
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{card.sub}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

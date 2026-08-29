"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Edit3,
  Check,
  Coffee,
  Soup,
  Croissant,
  Utensils,
  ChevronDown,
  CalendarDays,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const playTickSound = () => {
  // Sound disabled per user request
};

export interface MealSlot {
  time: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  items: string[];
}

export interface DaySchedule {
  day: string;
  breakfast: MealSlot;
  lunch: MealSlot;
  snacks: MealSlot;
  dinner: MealSlot;
}

// ─── Exact Mess Menu from Image (28 Friday, 29 Saturday, 30 Sunday) ───────────
const IMAGE_SCHEDULE: Record<string, DaySchedule> = {
  Friday: {
    day: "Friday (28)",
    breakfast: {
      time: "07:30 - 09:30 AM",
      startHour: 7,
      startMin: 30,
      endHour: 9,
      endMin: 30,
      items: [
        "Watermelon",
        "Chocos",
        "Macaroni",
        "Besan Chila",
        "Hara Chutney",
        "Hot Milk (D)",
        "Cold Milk (D)",
        "Tea (D)",
        "Coffee Powder",
        "Bread / Butter / Jam"
      ]
    },
    lunch: {
      time: "12:30 - 02:30 PM",
      startHour: 12,
      startMin: 30,
      endHour: 14,
      endMin: 30,
      items: [
        "Jal Jeera",
        "Cucumber Carrot Salad",
        "Lauki Kofta Curry",
        "Arhar Dal",
        "Garlic Rasam",
        "Peas Rice",
        "Chapati",
        "Moose"
      ]
    },
    snacks: {
      time: "04:30 - 06:30 PM",
      startHour: 16,
      startMin: 30,
      endHour: 18,
      endMin: 30,
      items: [
        "Bread Pakora",
        "Imli Chutney",
        "Cold Coffee",
        "Tea (D)",
        "Coffee Powder"
      ]
    },
    dinner: {
      time: "07:30 - 09:30 PM",
      startHour: 19,
      startMin: 30,
      endHour: 21,
      endMin: 30,
      items: [
        "Green Salad",
        "Beans Capsicum Aloo Matar",
        "Black Malka",
        "Jeera Rice",
        "Chapati"
      ]
    }
  },
  Saturday: {
    day: "Saturday (29)",
    breakfast: {
      time: "07:30 - 09:30 AM",
      startHour: 7,
      startMin: 30,
      endHour: 9,
      endMin: 30,
      items: [
        "Mix Fruits",
        "Chocos",
        "Dalia",
        "Idli",
        "Samber & Chutney",
        "Hot Milk (D)",
        "Cold Milk (D)",
        "Tea (D)",
        "Coffee Powder",
        "Bread / Butter / Jam"
      ]
    },
    lunch: {
      time: "12:30 - 02:30 PM",
      startHour: 12,
      startMin: 30,
      endHour: 14,
      endMin: 30,
      items: [
        "Boondi Raita",
        "Tossed Salad",
        "Matar Paneer",
        "Rajma Masala",
        "Vonkai Koora",
        "Jeera Rice",
        "Chapati"
      ]
    },
    snacks: {
      time: "04:30 - 06:30 PM",
      startHour: 16,
      startMin: 30,
      endHour: 18,
      endMin: 30,
      items: [
        "Jhal Muri",
        "Hot Milk (D)",
        "Tea (D)",
        "Coffee Powder"
      ]
    },
    dinner: {
      time: "07:30 - 09:30 PM",
      startHour: 19,
      startMin: 30,
      endHour: 21,
      endMin: 30,
      items: [
        "Moong Sprout Salad",
        "Bhendi Aloo Chatpata",
        "Hara Moong Dal",
        "Ghee Rice",
        "Chapati",
        "Ice Cream"
      ]
    }
  },
  Sunday: {
    day: "Sunday (30)",
    breakfast: {
      time: "07:30 - 09:30 AM",
      startHour: 7,
      startMin: 30,
      endHour: 9,
      endMin: 30,
      items: [
        "Papaya",
        "Muesli",
        "Masala Oats",
        "Paratha",
        "Aloo Tamatar",
        "Cold / Hot Milk (D)",
        "Tea (D)",
        "Coffee Powder",
        "Bread / Butter / Jam"
      ]
    },
    lunch: {
      time: "12:30 - 02:30 PM",
      startHour: 12,
      startMin: 30,
      endHour: 14,
      endMin: 30,
      items: [
        "Chaas",
        "Chana Sprout Salad",
        "Dum Aloo",
        "Dhaba Dal",
        "Samber",
        "Plain Rice",
        "Chapati",
        "Besan Ladoo"
      ]
    },
    snacks: {
      time: "04:30 - 06:30 PM",
      startHour: 16,
      startMin: 30,
      endHour: 18,
      endMin: 30,
      items: [
        "Dabheli",
        "Ketchup",
        "Cold Coffee",
        "Tea (D)",
        "Coffee Powder"
      ]
    },
    dinner: {
      time: "07:30 - 09:30 PM",
      startHour: 19,
      startMin: 30,
      endHour: 21,
      endMin: 30,
      items: [
        "Cucumber Salad",
        "Dahi Lauki Moong",
        "Mix Yellow Dal",
        "Steamed Rice",
        "Chapati"
      ]
    }
  }
};

export function MessMenu() {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(IMAGE_SCHEDULE);
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Mobile Date Picker State
  const [selectedDayKey, setSelectedDayKey] = useState<string>("29 (Saturday)");
  const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);

  // Accordion Expand State
  const [expandedSlot, setExpandedSlot] = useState<string | null>("lunch");

  // Edit Modal State
  const [editingMeal, setEditingMeal] = useState<{ dayKey: string; slotKey: keyof Omit<DaySchedule, "day"> } | null>(null);
  const [editItemsText, setEditItemsText] = useState("");

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const saved = localStorage.getItem("ru_mess_image_schedule_v2");
    if (saved) {
      try {
        setSchedule(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live meal slot dynamically
  const activeMealSlot = useMemo(() => {
    if (!now) return "lunch";
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const slots = [
      { key: "breakfast", start: 7 * 60 + 30, end: 9 * 60 + 30 },
      { key: "lunch", start: 12 * 60 + 30, end: 14 * 60 + 30 },
      { key: "snacks", start: 16 * 60 + 30, end: 18 * 60 + 30 },
      { key: "dinner", start: 19 * 60 + 30, end: 21 * 60 + 30 }
    ];

    for (let i = 0; i < slots.length; i++) {
      if (currentMinutes >= slots[i].start && currentMinutes < slots[i].end) {
        return slots[i].key;
      }
    }
    return "lunch";
  }, [now]);

  useEffect(() => {
    if (activeMealSlot) {
      setExpandedSlot(activeMealSlot);
    }
  }, [activeMealSlot]);

  const dateOptions = [
    { key: "28 (Friday)", label: "28 Friday", sub: "Friday Schedule" },
    { key: "29 (Saturday)", label: "29 Saturday", sub: "Today (Live Sync)" },
    { key: "30 (Sunday)", label: "30 Sunday", sub: "Sunday Schedule" },
    { key: "Monday", label: "Monday, Aug 31", sub: "Soon to be updated" },
    { key: "Tuesday", label: "Tuesday, Sep 1", sub: "Soon to be updated" }
  ];

  const handleSelectDate = (key: string) => {
    playTickSound();
    setSelectedDayKey(key);
    setShowDatePickerModal(false);
  };

  const currentScheduleData: DaySchedule | undefined = useMemo(() => {
    if (selectedDayKey === "28 (Friday)") return schedule["Friday"];
    if (selectedDayKey === "29 (Saturday)" || selectedDayKey === "Today") return schedule["Saturday"];
    if (selectedDayKey === "30 (Sunday)" || selectedDayKey === "Tomorrow") return schedule["Sunday"];
    return schedule[selectedDayKey];
  }, [selectedDayKey, schedule]);

  const isFutureBlankDate = !currentScheduleData;

  const handleSaveEdit = () => {
    if (!editingMeal) return;
    const newItems = editItemsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    let actualDay = "Saturday";
    if (editingMeal.dayKey.includes("28") || editingMeal.dayKey === "Friday") actualDay = "Friday";
    else if (editingMeal.dayKey.includes("29") || editingMeal.dayKey === "Saturday" || editingMeal.dayKey === "Today") actualDay = "Saturday";
    else if (editingMeal.dayKey.includes("30") || editingMeal.dayKey === "Sunday" || editingMeal.dayKey === "Tomorrow") actualDay = "Sunday";
    else actualDay = editingMeal.dayKey;

    const baseDayData = schedule[actualDay] || {
      day: actualDay,
      breakfast: { time: "07:30 - 09:30 AM", startHour: 7, startMin: 30, endHour: 9, endMin: 30, items: [] },
      lunch: { time: "12:30 - 02:30 PM", startHour: 12, startMin: 30, endHour: 14, endMin: 30, items: [] },
      snacks: { time: "05:00 - 06:30 PM", startHour: 17, startMin: 0, endHour: 18, endMin: 30, items: [] },
      dinner: { time: "07:30 - 09:30 PM", startHour: 19, startMin: 30, endHour: 21, endMin: 30, items: [] }
    };

    const updated = {
      ...schedule,
      [actualDay]: {
        ...baseDayData,
        [editingMeal.slotKey]: {
          ...baseDayData[editingMeal.slotKey],
          items: newItems
        }
      }
    };

    setSchedule(updated);
    localStorage.setItem("ru_mess_image_schedule_v2", JSON.stringify(updated));
    setEditingMeal(null);
  };

  return (
    <div className="min-h-screen w-full font-sans bg-background text-foreground flex flex-col items-center justify-start pb-12 transition-colors duration-300">
      <div className="w-full max-w-2xl px-4 sm:px-6 py-4 md:py-6 flex flex-col gap-5">
        
        {/* ── Top Bar: Date on Left, Theme Toggle on Right ────────────────────── */}
        <header className="flex items-center justify-between py-2 border-b border-border/40 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Selected Mess Schedule
            </span>
            <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
              {selectedDayKey}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Other Dates Button */}
            <button
              onClick={() => {
                playTickSound();
                setShowDatePickerModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs sm:text-sm font-extrabold text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>Other Dates</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {/* Dark Mode / Light Mode Toggler */}
            <ThemeToggle />
          </div>
        </header>

        {/* ── Main Content: Meal Buttons & Dropdowns (Breakfast, Lunch, Snacks, Dinner) ── */}
        <div className="space-y-3.5 pt-2">
          {isFutureBlankDate ? (
            <div className="p-8 md:p-12 rounded-3xl border border-dashed border-border bg-card/40 text-center space-y-4">
              <Sparkles className="h-10 w-10 text-primary mx-auto opacity-60" />
              <div>
                <h4 className="font-bold text-base md:text-lg">Soon to be updated</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Data for {selectedDayKey} will be uploaded soon. You can click below to add menu items.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingMeal({ dayKey: selectedDayKey, slotKey: "lunch" })
                }
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-90"
              >
                + Add Menu Data
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {(
                [
                  { key: "breakfast", label: "Breakfast", time: "07:30 - 09:30 AM", icon: Croissant, color: "text-amber-500" },
                  { key: "lunch", label: "Lunch", time: "12:30 - 02:30 PM", icon: Utensils, color: "text-orange-500" },
                  { key: "snacks", label: "Snacks", time: "04:30 - 06:30 PM", icon: Coffee, color: "text-purple-500" },
                  { key: "dinner", label: "Dinner", time: "07:30 - 09:30 PM", icon: Soup, color: "text-blue-500" }
                ] as const
              ).map(({ key, label, time, icon: SlotIcon, color }) => {
                const isExpanded = expandedSlot === key;
                const slotData = currentScheduleData?.[key];
                const isCurrentlyServing = (selectedDayKey.includes("29") || selectedDayKey === "Today") && activeMealSlot === key;

                return (
                  <div
                    key={key}
                    className={`rounded-2xl sm:rounded-3xl transition-all overflow-hidden ${
                      isCurrentlyServing
                        ? "border-2 border-red-600 ring-2 ring-red-600/30 bg-card shadow-md"
                        : "border border-border/60 bg-card/80"
                    }`}
                  >
                    {/* Meal Header */}
                    <div
                      onClick={() => {
                        playTickSound();
                        setExpandedSlot(isExpanded ? null : key);
                      }}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer select-none hover:bg-card active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl bg-muted/60 ${color}`}>
                          <SlotIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base sm:text-lg">{label}</h4>
                            {isCurrentlyServing && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse">
                                NOW
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMeal({ dayKey: selectedDayKey, slotKey: key });
                            setEditItemsText(slotData?.items.join("\n") || "");
                          }}
                          className="p-1.5 sm:p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit slot"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Dropdown Content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-border/40 bg-muted/20 px-4 sm:px-5 py-4"
                        >
                          {slotData && slotData.items.length > 0 ? (
                            <ul className="space-y-2.5">
                              {slotData.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-foreground/90">
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground italic">Soon to be updated...</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Date Picker Modal (Tick Sound Columns) ───────────────────────── */}
      <AnimatePresence>
        {showDatePickerModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    <CalendarDays className="h-4.5 w-4.5 text-primary" />
                    Select Date / Day
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Click to select day with tick sound</p>
                </div>
                <button
                  onClick={() => setShowDatePickerModal(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Date Options List */}
              <div className="space-y-2">
                {dateOptions.map((opt) => {
                  const isSelected = selectedDayKey === opt.key;
                  const isPendingData = opt.sub.includes("Soon to be updated");

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectDate(opt.key)}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : isPendingData
                          ? "bg-muted/20 hover:bg-muted/40 border-border/40 text-muted-foreground/80"
                          : "bg-muted/40 hover:bg-muted border-border/60 text-foreground"
                      }`}
                    >
                      <div>
                        <span className={`font-extrabold text-sm block ${isPendingData && !isSelected ? "text-muted-foreground/70" : ""}`}>
                          {opt.label}
                        </span>
                        <span className={`text-[11px] font-medium ${
                          isSelected
                            ? "text-primary-foreground/80"
                            : isPendingData
                            ? "text-muted-foreground/60 italic"
                            : "text-muted-foreground"
                        }`}>
                          {opt.sub}
                        </span>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-primary" />
                  Edit {editingMeal.dayKey} - {editingMeal.slotKey.toUpperCase()}
                </h3>
                <button
                  onClick={() => setEditingMeal(null)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Enter items (one per line):
                </label>
                <textarea
                  rows={5}
                  value={editItemsText}
                  onChange={(e) => setEditItemsText(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Rajma Masala&#10;Steamed Rice&#10;Chapati"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-sm"
                >
                  Save Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

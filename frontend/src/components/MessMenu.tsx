"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Coffee,
  Soup,
  Croissant,
  Utensils,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Settings,
  X,
  Lock,
  Save,
  Plus,
  Trash2,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PINCODE = "0313";
const GH_TOKEN  = process.env.NEXT_PUBLIC_GITHUB_TOKEN ?? "";
const GH_REPO   = process.env.NEXT_PUBLIC_GITHUB_REPO  ?? "Garvit-png/RU_Print";
const GH_PATH   = "frontend/src/components/MessMenu.tsx";
const GH_BRANCH = "main";

// ─── Mess Menu Data (Week: Mon 07 Sep – Sun 13 Sep 2026) ─────────────────────
const MENU: Record<string, Record<string, string[]>> = {
  Monday: {
    breakfast: ["Banana", "Semiya Upma", "Muesli", "Idli", "Sambar & Coconut Chutney", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread/Butter/Jam"],
    lunch:     ["Mixed Crush", "Green Salad", "Chole Masale", "Masaledar Baingan", "Andhra Style Dal", "Jeera Rice", "Chapati", "Sewai Kheer"],
    snacks:    ["Bread Pakora", "Chutney", "Cold Coffee", "Tea (D)"],
    dinner:    ["Tossed Salad", "Rajma Masala", "Aloo Matar Dry", "Pulusu", "Rice", "Chapati"],
  },
  Tuesday: {
    breakfast: ["Mix Fruits", "Boiled Chana", "Chocos", "Plain Paratha", "Bhaji", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread/Butter/Jam"],
    lunch:     ["Jeera Raita", "Mint Lachha Onion", "Veg Tahari", "Mirch Ka Salan", "Karam Chutney", "Dhaba Dal", "Chapati", "Gulab Jamun"],
    snacks:    ["Aloo Matar Puff", "Ketchup", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Green Salad", "Soya Chaap Masala", "Moong-Massor Dal", "Gokarkai Kura", "Jeera Rice", "Chapati", "Gulab Jamun"],
  },
  Wednesday: {
    breakfast: ["Papaya", "Masala Oats", "Cornflakes", "Pav", "Missal", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread/Butter/Jam"],
    lunch:     ["Chach", "Green Salad", "Paneer Butter Masala", "Mix Yellow Dal", "Plain Rice", "Chapati", "Ice Cream"],
    snacks:    ["Jhal Muri", "Cold Coffee", "Tea (D)"],
    dinner:    ["Onion Lachha", "Parwal Aloo Dry", "Arhar Dal Tarka", "Bendakai Kura", "Plain Rice", "Chapati"],
  },
  Thursday: {
    breakfast: ["Water Melon", "Moong Sprout", "Muesli", "Ajwain Poori", "Aloo Matar Sabji", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread/Butter/Jam"],
    lunch:     ["Aam Panna", "Green Salad", "Kadhi Pakora", "Aloo Matar Capsicum", "Sambar", "Dhania Rice", "Chapati", "Rice Kheer"],
    snacks:    ["Samosa", "Ketchup", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Cucumber Salad", "Tofu Manchurian", "Chole Punjabi", "Yonkai Kura", "Peas Rice", "Chapati", "Rice Kheer"],
  },
  Friday: {
    breakfast: ["Banana", "Chocos", "Macaroni", "Besan Chilla", "Hara Chutney", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread/Butter/Jam"],
    lunch:     ["Rooh-Afza", "Tossed Salad", "Cabbage Matar Tamatar", "Rauma", "Beans Coconut", "Plain Rice", "Chapati", "Pastry"],
    snacks:    ["French Fries", "Ketchup", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Green Salad", "Paneer Makhni", "Yellow Moong Dal", "Sambar", "Jeera Rice", "Chapati"],
  },
  Saturday: {
    breakfast: ["Mix Fruits", "Cornflakes", "Sandwich", "Veg Uttapam", "Sambar & Chutney", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread/Butter/Jam"],
    lunch:     ["Salted Lassi", "Cucumber-Carrot Salad", "Lauki Kofta Curry", "Arhar Dal Tarka", "Dondakai", "Ghee Rice", "Chapati"],
    snacks:    ["Maggi", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Moong Sprout Salad", "Kundru Aloo Chatpata", "Gota Masoor", "Beans Podi", "Ghee Rice", "Chapati", "Choco Moose"],
  },
  Sunday: {
    breakfast: ["Papaya", "Muesli", "Dalia", "Paneer - Pyaaz Aloo Paratha", "Curd & Pickle", "Cold/Hot Milk (D)", "Tea (D)", "Coffee Powder", "Bread/Butter/Jam"],
    lunch:     ["Butter Milk", "Lachha Onion", "Dal Makhni", "Mix Veg Bhaji", "Sambar", "Plain Rice", "Poori", "Besan Ladoo"],
    snacks:    ["Burger", "Ketchup", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Cucumber Salad", "Dhaba Dal", "Makhana Matar", "Rasam", "Steamed Rice", "Chapati"],
  },
};

const MEAL_SLOTS = [
  { key: "breakfast", label: "Breakfast", time: "07:30 - 09:30 AM", icon: Croissant, color: "text-amber-500", start: 450,  end: 570  },
  { key: "lunch",     label: "Lunch",     time: "12:30 - 02:30 PM", icon: Utensils,  color: "text-orange-500", start: 750,  end: 870  },
  { key: "snacks",    label: "Snacks",    time: "04:30 - 06:30 PM", icon: Coffee,    color: "text-purple-500", start: 990,  end: 1110 },
  { key: "dinner",    label: "Dinner",    time: "07:30 - 09:30 PM", icon: Soup,      color: "text-blue-500",   start: 1170, end: 1290 },
] as const;


function getLiveSlot(minutesSinceMidnight: number): string {
  for (const slot of MEAL_SLOTS) {
    if (minutesSinceMidnight >= slot.start && minutesSinceMidnight < slot.end) {
      return slot.key;
    }
  }
  return "lunch";
}

export function MessMenu() {
  const [now, setNow] = useState<Date | null>(null);
  const [expandedSlot, setExpandedSlot] = useState<string>("");
  const [showMessage, setShowMessage] = useState(false);

  // ── Settings panel state ──────────────────────────────────────────────────
  type SettingsView = "closed" | "pin" | "open";
  const [settingsView, setSettingsView]   = useState<SettingsView>("closed");
  const [pin, setPin]                     = useState("");
  const [pinError, setPinError]           = useState(false);
  const [editSlot, setEditSlot]           = useState<string>("breakfast");
  const [editItems, setEditItems]         = useState<string[]>([]);
  const [saveStatus, setSaveStatus]       = useState<"idle"|"saving"|"ok"|"err">("idle");
  const [saveMsg, setSaveMsg]             = useState("");

  const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
  const [selectedDay, setSelectedDay] = useState<string>("");

  const dateOptions = useMemo(() => {
    if (!now) return [];
    const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(now);
    const dayName = DAY_NAMES[d.getDay()];
    return [{ key: "today", label: "Today", day: MENU[dayName] ? dayName : "" }];
  }, [now?.getDate()]);

  useEffect(() => {}, []);  // kept for compat

  // Clock tick every minute (not every second) to reduce renders
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Set selectedDay to today on mount
  useEffect(() => {
    if (now && !selectedDay) {
      const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      setSelectedDay(DAY_NAMES[now.getDay()]);
    }
  }, [now]);

  // Auto-refresh when opened as PWA (install as an app)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
          const lastReload = localStorage.getItem("last_pwa_reload");
          const now = Date.now();
          // Reload if more than 3 minutes (180000 ms) have passed since the last reload
          if (!lastReload || now - parseInt(lastReload) > 3 * 60 * 1000) {
            localStorage.setItem("last_pwa_reload", now.toString());
            window.location.reload();
          }
        }
      }
    };
    
    // Check on initial load
    handleVisibility(); 
    
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const activeMealSlot = useMemo(() => {
    if (!now) return "lunch";
    return getLiveSlot(now.getHours() * 60 + now.getMinutes());
  }, [now]);

  // Today's actual day name (for edit restriction)
  const todayDayName = dateOptions[0]?.day ?? "Monday";
  // Currently viewed day
  const viewingDay = selectedDay || todayDayName;
  const menuForDay = MENU[viewingDay] ?? null;
  const isViewingToday = viewingDay === todayDayName;

  // ── Settings helpers ─────────────────────────────────────────────────────
  const openSettings = (slot: string) => {
    setEditSlot(slot);
    setEditItems([...(MENU[todayDayName]?.[slot] ?? [])]);
    setSaveStatus("idle");
    setSaveMsg("");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === PINCODE) {
      setPinError(false);
      setPin("");
      setSettingsView("open");
      openSettings("breakfast");
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleSlotChange = (slot: string) => {
    openSettings(slot);
  };

  const handleSaveToGitHub = async () => {
    setSaveStatus("saving");
    setSaveMsg("");

    // Build updated MENU object string — we patch the one slot being edited
    const updatedMenu: typeof MENU = JSON.parse(JSON.stringify(MENU));
    updatedMenu[todayDayName][editSlot] = editItems.filter(i => i.trim() !== "");

    try {
      // 1. Get current file SHA
      const getRes = await fetch(
        `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}?ref=${GH_BRANCH}`,
        { headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" } }
      );
      if (!getRes.ok) throw new Error("Could not fetch file from GitHub.");
      const fileData = await getRes.json();

      // 2. Decode current content, replace MENU block
      const currentContent: string = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ""))));
      const menuStr = `const MENU: Record<string, Record<string, string[]>> = ${JSON.stringify(updatedMenu, null, 2)};`;
      const newContent = currentContent.replace(
        /const MENU: Record<string, Record<string, string\[\]>> = \{[\s\S]*?\n\};/,
        menuStr
      );

      // 3. Commit
      const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      const putRes = await fetch(
        `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `menu: update ${todayDayName} ${editSlot} — ${today}`,
            content: btoa(unescape(encodeURIComponent(newContent))),
            sha: fileData.sha,
            branch: GH_BRANCH,
          }),
        }
      );
      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message ?? "GitHub commit failed.");
      }
      setSaveStatus("ok");
      setSaveMsg("Saved! Vercel will redeploy in ~30s.");
      // Patch local MENU too so UI updates instantly
      MENU[todayDayName][editSlot] = [...editItems.filter(i => i.trim() !== "")];
    } catch (err: any) {
      setSaveStatus("err");
      setSaveMsg(err.message ?? "Save failed.");
    }
  };

  const closeSettings = () => {
    setSettingsView("closed");
    setPin("");
    setPinError(false);
    setSaveStatus("idle");
  };

  // Show skeleton while hydrating — avoids blank/loading screen on first render
  if (!now) return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center pt-8 gap-4 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-48 rounded-xl bg-muted/50 animate-pulse" />
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 w-full rounded-2xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-start pb-12">
      <div className="w-full max-w-md px-4 py-4 flex flex-col gap-4">

        {/* ── Header ── */}
        <header className="pb-3 border-b border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Mess Schedule · {viewingDay}
              </span>
              <span className="text-lg font-extrabold text-foreground">
                {isViewingToday ? "Today" : viewingDay}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!isViewingToday && (
                <button
                  onClick={() => setSelectedDay(todayDayName)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Go to Today
                </button>
              )}
              <button
                onClick={() => setShowMessage(true)}
                className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative shadow-sm"
                aria-label="Important Message"
              >
                <Mail className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
              </button>
            </div>
          </div>

          {/* Day-of-week picker */}
          <div className="flex gap-1.5">
            {WEEK_DAYS.map(day => {
              const isSelected = day === viewingDay;
              const isToday = day === todayDayName;
              const shortLabel = day.slice(0, 3);
              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setExpandedSlot(""); }}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <span>{shortLabel}</span>
                  {isToday && (
                    <span className={`h-1 w-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* ── Meal Cards ── */}
        <div className="flex flex-col gap-3">
          {!menuForDay ? (
            <div className="p-10 rounded-3xl border border-dashed border-border bg-card/40 text-center space-y-2">
              <Sparkles className="h-9 w-9 text-primary mx-auto opacity-60" />
              <h4 className="font-bold text-base">Soon to be updated</h4>
              <p className="text-xs text-muted-foreground">
                Menu for {viewingDay} will be uploaded soon.
              </p>
            </div>
          ) : (
            MEAL_SLOTS.map(({ key, label, time, icon: Icon, color }) => {
              const isExpanded = expandedSlot === key;

              const items = menuForDay[key] ?? [];

              return (
                <div
                  key={key}
                  className="rounded-2xl overflow-hidden border border-border/60 bg-card/80"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedSlot(isExpanded ? "" : key)}
                    className="w-full p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-muted/60 ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base">{label}</h4>

                        </div>
                        <span className="text-xs text-muted-foreground">{time}</span>
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>

                  {/* Dropdown */}
                  {isExpanded && (
                    <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-semibold text-foreground/90">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-6 text-xs font-medium text-muted-foreground/80 tracking-wide text-center">
        Made with ❤️ by Garvit Gandhi
      </div>

      {/* ── Message overlay ── */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowMessage(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                boxShadow: [
                  "0px 0px 0px 0px rgba(220, 38, 38, 0)",
                  "0px 0px 60px 20px rgba(220, 38, 38, 0.5)",
                  "0px 25px 50px -12px rgba(0, 0, 0, 0.25)"
                ]
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20, boxShadow: "0px 0px 0px 0px rgba(220, 38, 38, 0)" }}
              transition={{ 
                default: { type: "spring", damping: 25, stiffness: 300 },
                boxShadow: { duration: 1.2, ease: "easeOut", delay: 0.1 }
              }}
              className="w-full max-w-sm bg-card border-2 border-destructive/50 rounded-3xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-destructive/10 p-6 flex flex-col items-center justify-center gap-3">
                <div className="p-4 bg-destructive/20 rounded-full text-destructive animate-bounce">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="font-extrabold text-lg text-foreground">Menu Update</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed text-center font-medium">
                  No message right now 
                  <br/><br/>
                  <span className="text-destructive font-bold">Enjoy</span>
                </p>
                <button
                  onClick={() => setShowMessage(false)}
                  className="w-full h-12 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:bg-destructive/90 transition-colors active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings gear button (fixed bottom-right) ── */}
      <button
        onClick={() => { setSettingsView("pin"); setPinError(false); setPin(""); }}
        className="fixed bottom-5 right-5 z-40 h-11 w-11 flex items-center justify-center rounded-full bg-card border border-border/70 shadow-lg text-muted-foreground hover:text-primary hover:border-primary/50 hover:scale-110 transition-all"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* ── Settings overlay ── */}
      {settingsView !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeSettings}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: "calc(100dvh - 60px)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-bold">
                  {settingsView === "pin" ? "Menu Settings" : `Today — ${todayDayName}`}
                </p>
              </div>
              <button onClick={closeSettings} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* PIN screen — no autoFocus to avoid keyboard pushing panel */}
            {settingsView === "pin" && (
              <form onSubmit={handlePinSubmit} className="p-5 space-y-4 pb-8">
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Enter PIN</p>
                  <p className="text-xs text-muted-foreground text-center">4-digit PIN required to edit menu.</p>
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g,"").slice(0,4)); setPinError(false); }}
                  className="w-full h-12 text-center text-2xl tracking-[0.6em] font-mono rounded-xl bg-muted/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {pinError && (
                  <p className="text-xs text-destructive text-center">Incorrect PIN. Try again.</p>
                )}
                <button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                  Unlock
                </button>
              </form>
            )}

            {/* Edit screen */}
            {settingsView === "open" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Day + Slot selectors */}
                <div className="px-5 pt-4 pb-3 space-y-3 shrink-0 border-b border-border/30">
                  {/* Slot pills — today's day is fixed */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {["breakfast","lunch","snacks","dinner"].map(slot => (
                      <button
                        key={slot}
                        onClick={() => handleSlotChange(slot)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                          editSlot === slot
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {todayDayName} — {editSlot} items
                  </p>
                  {editItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={item}
                        onChange={e => {
                          const updated = [...editItems];
                          updated[idx] = e.target.value;
                          setEditItems(updated);
                        }}
                        className="flex-1 h-9 px-3 rounded-xl bg-muted/40 border border-border/60 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                      />
                      <button
                        onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditItems([...editItems, ""])}
                    className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-1 px-1 py-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add item
                  </button>
                </div>

                {/* Save bar */}
                <div className="px-5 pb-5 pt-3 border-t border-border/30 shrink-0 space-y-2">
                  {saveMsg && (
                    <p className={`text-xs text-center font-medium ${saveStatus === "ok" ? "text-emerald-500" : "text-destructive"}`}>
                      {saveMsg}
                    </p>
                  )}
                  <button
                    onClick={handleSaveToGitHub}
                    disabled={saveStatus === "saving"}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saveStatus === "saving" ? (
                      <><span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Saving to GitHub…</>
                    ) : (
                      <><Save className="h-4 w-4" /> Save &amp; Deploy</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

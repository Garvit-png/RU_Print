"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Check,
  Coffee,
  Soup,
  Croissant,
  Utensils,
  ChevronDown,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Settings,
  X,
  Lock,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

const PINCODE = "0313";
const GH_TOKEN  = process.env.NEXT_PUBLIC_GITHUB_TOKEN ?? "";
const GH_REPO   = process.env.NEXT_PUBLIC_GITHUB_REPO  ?? "Garvit-png/RU_Print";
const GH_PATH   = "frontend/src/components/MessMenu.tsx";
const GH_BRANCH = "main";

// ─── Mess Menu Data (Week: Mon 01 Sep – Sun 07 Sep 2026) ─────────────────────
const MENU: Record<string, Record<string, string[]>> = {
  Monday: {
    breakfast: ["Banana", "Masala Oats", "Cornflakes", "Aloo Pyaaz Paratha", "Curd & Pickle", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Rooh Afza", "Pasta Salad", "Chana Masala", "Aloo Matar", "Beetroot Foogath", "Jeera Rice", "Chapati", "Besan Barfi"],
    snacks:    ["Mix Veg Pakora", "Chutney", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Tossed Salad", "Capsicum Gobi Corn", "Rajma", "Tomato Rasam", "Rice", "Chapati"],
  },
  Tuesday: {
    breakfast: ["Watermelon", "Dalia", "Chocos", "Pav", "Bhaji", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Sweet Lassi", "Green Salad", "Veg Kofta Curry", "Arhar Dal Tarka", "Tomato Pachadi", "Steamed Rice", "Chapati"],
    snacks:    ["Maggi", "Ketchup", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Green Salad", "Soya Chaap Lababdar", "Moong Dal Hing Tarka", "Onion Samber", "Jeera Rice", "Chapati", "Gulab Jamun"],
  },
  Wednesday: {
    breakfast: ["Mix Fruits", "Macaroni", "Muesli", "Kulcha", "Matar", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Mixed Crush", "Cucumber Salad", "Chettinad Paneer", "Mix Yellow Dal", "Coriander Rice", "Chapati", "Sweet Boondi Dry"],
    snacks:    ["Aloo Tikki Chaat", "Curd / Imli Chutney", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Onion Lachha", "Bhindi Do Pyaza", "Lal Malka Dal", "Cabbage Foogath", "Plain Rice", "Chapati"],
  },
  Thursday: {
    breakfast: ["Papaya", "Masala Oats", "Cornflakes", "Kachori", "Aloo Tamatar Sabzi", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Chaas", "Laccha Onion", "Veg Tahiri", "Aloo Ka Salan", "Karam Chutney", "Dhaba Dal Thick", "Chapati"],
    snacks:    ["Paneer Puff", "Ketchup", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Cucumber Salad", "Tofu Chilli", "Chole Punjabi", "Carrot Poriyal", "Peas Rice", "Chapati", "Ice Cream"],
  },
  Friday: {
    breakfast: ["Watermelon", "Chocos", "Macaroni", "Veg Upma", "Spicy Peanut Chutney", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Salted Lassi", "Tossed Salad", "Mix Veg", "Rajma", "Pesarattu", "Plain Rice", "Chapati", "Coconut Ladoo"],
    snacks:    ["Samosa", "Ketchup", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Green Salad", "Kolhapuri Paneer", "Panchmel Dal", "Jeera Rice", "Chapati", "Pastry"],
  },
  Saturday: {
    breakfast: ["Mix Fruits", "Chocos", "Aloo Toast", "Mixed Pulses Chila", "Tangy Tomato Garlic Chutney", "Hot Milk", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Butter Milk", "Cucumber Carrot Salad", "Soya Chaap Makhanwala", "Lal Malka", "Ghee Rice", "Chapati"],
    snacks:    ["Chinese Bhel", "Ketchup", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Moong Sprout Salad", "Parval Aloo", "Gota Masoor", "Beans Foogath", "Ghee Rice", "Chapati"],
  },
  Sunday: {
    breakfast: ["Papaya", "Muesli", "Masala Oats", "Paratha", "Aloo Tamatar", "Cold / Hot Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Chaas", "Chana Sprout Salad", "Dum Aloo", "Dhaba Dal", "Samber", "Plain Rice", "Chapati", "Besan Ladoo"],
    snacks:    ["Dabheli", "Ketchup", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Cucumber Salad", "Dahi Lauki Moong", "Mix Yellow Dal", "Steamed Rice", "Chapati"],
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
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [expandedSlot, setExpandedSlot] = useState<string>("");

  // ── Settings panel state ──────────────────────────────────────────────────
  type SettingsView = "closed" | "pin" | "open";
  const [settingsView, setSettingsView]   = useState<SettingsView>("closed");
  const [pin, setPin]                     = useState("");
  const [pinError, setPinError]           = useState(false);
  const [editDay, setEditDay]             = useState<string>("Monday");
  const [editSlot, setEditSlot]           = useState<string>("breakfast");
  const [editItems, setEditItems]         = useState<string[]>([]);
  const [saveStatus, setSaveStatus]       = useState<"idle"|"saving"|"ok"|"err">("idle");
  const [saveMsg, setSaveMsg]             = useState("");

  const dateOptions = useMemo(() => {
    if (!now) return [];
    
    const options = [];
    const MENU_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = MENU_DAYS[d.getDay()];
      const monthName = MONTHS[d.getMonth()];
      
      const key = `${d.getDate()} (${dayName})`;
      const hasData = MENU[dayName] !== undefined;
      
      options.push({
        key,
        label: i === 0 ? `${d.getDate()} ${dayName}` : `${dayName}, ${monthName} ${d.getDate()}`,
        sub: i === 0 ? "Today (Live Sync)" : (hasData ? `${dayName} Schedule` : "Soon to be updated"),
        day: hasData ? dayName : "",
      });
    }
    return options;
  }, [now?.getDate()]); // update when date changes

  useEffect(() => {
    if (dateOptions.length > 0) {
      const stillExists = dateOptions.some(o => o.key === selectedDateKey);
      if (!stillExists) {
        setSelectedDateKey(dateOptions[0].key);
      }
    }
  }, [dateOptions, selectedDateKey]);

  // Clock tick every minute (not every second) to reduce renders
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const activeMealSlot = useMemo(() => {
    if (!now) return "lunch";
    return getLiveSlot(now.getHours() * 60 + now.getMinutes());
  }, [now]);

  const selectedOption = dateOptions.find(o => o.key === selectedDateKey) || dateOptions[0];
  const menuForDay = selectedOption?.day ? MENU[selectedOption.day] : null;

  // ── Settings helpers ─────────────────────────────────────────────────────
  const openSettings = (day: string, slot: string) => {
    setEditDay(day);
    setEditSlot(slot);
    setEditItems([...(MENU[day]?.[slot] ?? [])]);
    setSaveStatus("idle");
    setSaveMsg("");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === PINCODE) {
      setPinError(false);
      setPin("");
      setSettingsView("open");
      openSettings("Monday", "breakfast");
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleSlotChange = (day: string, slot: string) => {
    openSettings(day, slot);
  };

  const handleSaveToGitHub = async () => {
    setSaveStatus("saving");
    setSaveMsg("");

    // Build updated MENU object string — we patch the one slot being edited
    const updatedMenu: typeof MENU = JSON.parse(JSON.stringify(MENU));
    updatedMenu[editDay][editSlot] = editItems.filter(i => i.trim() !== "");

    try {
      // 1. Get current file SHA
      const getRes = await fetch(
        `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}?ref=${GH_BRANCH}`,
        { headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" } }
      );
      if (!getRes.ok) throw new Error("Could not fetch file from GitHub.");
      const fileData = await getRes.json();

      // 2. Decode current content, replace MENU block
      const currentContent: string = atob(fileData.content.replace(/\n/g, ""));
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
            message: `menu: update ${editDay} ${editSlot} — ${today}`,
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
      MENU[editDay][editSlot] = [...editItems.filter(i => i.trim() !== "")];
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
  if (!now || !selectedOption) return (
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
        <header className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Mess Schedule · 01 Sep – 07 Sep 2026
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {selectedOption.label}
            </span>
          </div>

          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground active:scale-95 transition-transform"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>Other Dates</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </header>

        {/* ── Meal Cards ── */}
        <div className="flex flex-col gap-3">
          {!menuForDay ? (
            <div className="p-10 rounded-3xl border border-dashed border-border bg-card/40 text-center space-y-2">
              <Sparkles className="h-9 w-9 text-primary mx-auto opacity-60" />
              <h4 className="font-bold text-base">Soon to be updated</h4>
              <p className="text-xs text-muted-foreground">
                Data for {selectedOption.label} will be uploaded soon.
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

      {/* ── Date Picker Sheet ── */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-t-3xl p-5 space-y-3 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Select Date
              </h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-muted-foreground font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {dateOptions.map(opt => {
                const isSelected = selectedDateKey === opt.key;
                const isPending = !opt.day;
                return (
                  <button
                    key={opt.key}
                    onClick={() => { setSelectedDateKey(opt.key); setShowPicker(false); }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left active:scale-[0.98] transition-transform ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : isPending
                        ? "bg-muted/20 border-border/40 text-muted-foreground/70"
                        : "bg-muted/40 border-border/60 text-foreground"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm block">{opt.label}</span>
                      <span className={`text-[11px] ${isSelected ? "text-primary-foreground/80" : isPending ? "italic text-muted-foreground/60" : "text-muted-foreground"}`}>
                        {opt.sub}
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="mt-6 text-xs font-medium text-muted-foreground/80 tracking-wide text-center">
        Made with ❤️ by Garvit Gandhi
      </div>

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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeSettings}>
          <div
            className="w-full max-w-md bg-card border border-border rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-bold">Menu Settings</p>
              </div>
              <button onClick={closeSettings} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* PIN screen */}
            {settingsView === "pin" && (
              <form onSubmit={handlePinSubmit} className="p-5 space-y-4">
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
                  autoFocus
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
                  {/* Day pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {Object.keys(MENU).map(day => (
                      <button
                        key={day}
                        onClick={() => handleSlotChange(day, editSlot)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          editDay === day
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {day.slice(0,3)}
                      </button>
                    ))}
                  </div>
                  {/* Slot pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {["breakfast","lunch","snacks","dinner"].map(slot => (
                      <button
                        key={slot}
                        onClick={() => handleSlotChange(editDay, slot)}
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
                    {editDay} — {editSlot} items
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

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
  CheckCircle2
} from "lucide-react";

// ─── Mess Menu Data (28 Friday, 29 Saturday, 30 Sunday) ──────────────────────
const MENU: Record<string, Record<string, string[]>> = {
  Monday: {
    breakfast: ["Banana", "Masala Oats", "Cornflakes", "Aloo Pyaj Paratha", "Curd & Pickle", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Rooh Afza", "Pasta Salad", "Chana Masala", "Aloo Matar", "Beetroot Poriyal", "Jeera Rice", "Chapati", "Besan Barfi"],
    snacks:    ["Mix Veg Pakora", "Chutney", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Tossed Salad", "Capsicum Corn Gravy", "Rajma", "Tomato Rasam", "Rice", "Chapati", "Kheer"],
  },
  Tuesday: {
    breakfast: ["Watermelon", "Dalia", "Chocos", "Idli", "Sambar", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Sweet Lassi", "Green Salad", "Veg Kofta Curry", "Arhar Dal Tarka", "Tatama Pachadi", "Steamed Rice", "Chapati"],
    snacks:    ["Maggi", "Ketchup", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Green Salad", "Soya Chaap Lababdar", "Moong Dal Hing Tarka", "Onion Samber", "Jeera Rice", "Chapati", "Gulab Jamun"],
  },
  Wednesday: {
    breakfast: ["Mix Fruits", "Macaroni", "Muesli", "Kulcha", "Matar", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Mixed Crush", "Cucumber Salad", "Chettinad Paneer", "Mix Yellow Dal", "Coriander Rice", "Chapati", "Sweet Boondi Dry"],
    snacks:    ["Aloo Tikki Chaat", "Curd / Imli Chutney", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Onion Lachha", "Bhindi Do Pyaza", "Lal Malka Dal", "Cabbage Foogath", "Plain Rice", "Chapati"],
  },
  Thursday: {
    breakfast: ["Papaya", "Masala Oats", "Cornflakes", "Pav Bhaji", "Aloo Tamatar Sabzi", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Chaas", "Laccha Onion", "Veg Tahiri", "Aloo Ka Salan", "Karam Chutney", "Dhaba Dal Thick", "Chapati"],
    snacks:    ["Paneer Puff", "Ketchup", "Hot Milk (D)", "Tea (D)", "Coffee Powder"],
    dinner:    ["Cucumber Salad", "Tofu Chilli", "Chole Punjabi", "Carrot Poriyal", "Peas Rice", "Chapati", "Ice Cream"],
  },
  Friday: {
    breakfast: ["Watermelon", "Chocos", "Macaroni", "Veg Upma", "Spicy Peanut Chutney", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
    lunch:     ["Salted Lassi", "Tossed Salad", "Mix Veg", "Rajma", "Pesarattu", "Plain Rice", "Chapati", "Coconut Ladoo"],
    snacks:    ["Samosa", "Ketchup", "Cold Coffee", "Tea (D)", "Coffee Powder"],
    dinner:    ["Green Salad", "Kolhapuri Paneer", "Panchmel Dal", "Jeera Rice", "Chapati", "Pastry"],
  },
  Saturday: {
    breakfast: ["Mix Fruits", "Chocos", "Aloo Toast", "Mixed Pulses Chila", "Tangy Tomato Garlic Chutney", "Hot Milk (D)", "Cold Milk (D)", "Tea (D)", "Coffee Powder", "Bread / Butter / Jam"],
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

  if (!now || !selectedOption) return null; // Wait for hydration
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-start pb-12">
      <div className="w-full max-w-md px-4 py-4 flex flex-col gap-4">

        {/* ── Header ── */}
        <header className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Mess Schedule
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
    </div>
  );
}

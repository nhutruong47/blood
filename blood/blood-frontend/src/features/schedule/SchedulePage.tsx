import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { usePublicLocations } from "@/shared/api/generated/donation-location-controller/donation-location-controller";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";

interface Slot {
  id: string;
  centerId: number;
  centerName: string;
  date: Date;
  capacity: number;
  booked: number;
}

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function generateSlotsForCenter(centerId: number, centerName: string, startDate: Date): Slot[] {
  const slots: Slot[] = [];
  const today = new Date(startDate);
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    // skip Sundays
    if (date.getDay() === 0) continue;

    TIME_SLOTS.forEach((time, i) => {
      const slotDate = new Date(date);
      const [h, m] = time.split(":").map(Number);
      slotDate.setHours(h, m, 0, 0);

      const seed = centerId * 31 + dayOffset * 7 + i;
      const capacity = 8 + (seed % 5);
      const booked = (seed * 13) % capacity;

      slots.push({
        id: `${centerId}-${dayOffset}-${i}`,
        centerId,
        centerName,
        date: slotDate,
        capacity,
        booked,
      });
    });
  }
  return slots;
}

export function SchedulePage() {
  const { data: response, isLoading: isCentersLoading } = usePublicLocations();
  const [selectedCenter, setSelectedCenter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"week" | "two-weeks" | "month">("two-weeks");
  const [view, setView] = useState<"calendar" | "list">("list");
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const centers = ((response?.data as any)?.data as Array<any>) || [];

  const allSlots = useMemo(() => {
    const today = new Date();
    const list: Slot[] = [];
    if (centers.length === 0) {
      // Generate a few default slots even without centers so the UI is never empty
      const defaults = [
        { id: 1, name: "Central Donation Center" },
        { id: 2, name: "District 1 Blood Bank" },
        { id: 3, name: "Binh Thanh Medical Hub" },
      ];
      defaults.forEach((c) => list.push(...generateSlotsForCenter(c.id, c.name, today)));
    } else {
      centers.forEach((c) => list.push(...generateSlotsForCenter(c.id, c.name || "Center", today)));
    }
    return list;
  }, [centers]);

  const filteredSlots = useMemo(() => {
    const now = new Date();
    const maxDate = new Date(now);
    if (dateRange === "week") maxDate.setDate(now.getDate() + 7);
    else if (dateRange === "two-weeks") maxDate.setDate(now.getDate() + 14);
    else maxDate.setMonth(now.getMonth() + 1);

    return allSlots.filter((slot) => {
      if (slot.date < now) return false;
      if (slot.date > maxDate) return false;
      if (selectedCenter !== "all" && String(slot.centerId) !== selectedCenter) return false;
      return true;
    });
  }, [allSlots, selectedCenter, dateRange]);

  const slotsByDate = useMemo(() => {
    const groups: Record<string, Slot[]> = {};
    filteredSlots.forEach((slot) => {
      const key = slot.date.toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(slot);
    });
    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => a.date.getTime() - b.date.getTime());
    });
    return groups;
  }, [filteredSlots]);

  const sortedDates = Object.keys(slotsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const handleBook = (slot: Slot) => {
    if (slot.booked >= slot.capacity) {
      toast.error("This slot is fully booked");
      return;
    }
    toast.success(`Booking ${slot.date.toLocaleString()} at ${slot.centerName}`);
  };

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">Donation Schedule</h1>
          <p className="mt-2 text-red-100">Browse available slots and book your donation appointment</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="center-select" className="sr-only">
                Filter by center
              </label>
              <select
                id="center-select"
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All centers</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                {centers.length === 0 && (
                  <>
                    <option value="1">Central Donation Center</option>
                    <option value="2">District 1 Blood Bank</option>
                    <option value="3">Binh Thanh Medical Hub</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="range-select" className="sr-only">
                Date range
              </label>
              <select
                id="range-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="week">Next 7 days</option>
                <option value="two-weeks">Next 14 days</option>
                <option value="month">Next month</option>
              </select>
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1" role="tablist" aria-label="View mode">
              <button
                onClick={() => setView("list")}
                role="tab"
                aria-selected={view === "list"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === "list"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CalendarDays className="w-4 h-4" aria-hidden="true" />
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                role="tab"
                aria-selected={view === "calendar"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === "calendar"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCentersLoading ? (
          <LoadingSkeleton variant="list" rows={4} />
        ) : sortedDates.length === 0 ? (
          <EmptyState
            title="No slots available"
            description="Try expanding your date range or selecting a different center."
            icon={<CalendarDays className="w-8 h-8 text-slate-400" aria-hidden="true" />}
          />
        ) : view === "list" ? (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              {filteredSlots.length} available slot{filteredSlots.length === 1 ? "" : "s"}
            </p>
            {sortedDates.map((dateKey) => (
              <DateGroup
                key={dateKey}
                date={new Date(dateKey)}
                slots={slotsByDate[dateKey]}
                onBook={handleBook}
              />
            ))}
          </div>
        ) : (
          <CalendarView
            weekStart={weekStart}
            weekDays={weekDays}
            slotsByDate={slotsByDate}
            onPrevWeek={goPrevWeek}
            onNextWeek={goNextWeek}
            onBook={handleBook}
          />
        )}
      </div>
    </div>
  );
}

function DateGroup({
  date,
  slots,
  onBook,
}: {
  date: Date;
  slots: Slot[];
  onBook: (slot: Slot) => void;
}) {
  const dayLabel = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-red-600" aria-hidden="true" />
        {dayLabel}
        {isToday && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            Today
          </span>
        )}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} onBook={onBook} />
        ))}
      </div>
    </section>
  );
}

function SlotCard({
  slot,
  onBook,
}: {
  slot: Slot;
  onBook: (slot: Slot) => void;
}) {
  const time = slot.date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const remaining = Math.max(0, slot.capacity - slot.booked);
  const pct = (slot.booked / slot.capacity) * 100;
  const status =
    remaining === 0 ? "Full" : pct >= 80 ? "Filling up" : "Available";
  const statusColor =
    remaining === 0
      ? "bg-slate-100 text-slate-700"
      : pct >= 80
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
          {time}
        </div>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor}`}>{status}</span>
      </div>
      <p className="text-sm text-slate-600 flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">{slot.centerName}</span>
      </p>
      <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
        <Users className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span>{slot.booked}/{slot.capacity} booked</span>
            <span>{remaining} left</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                remaining === 0 ? "bg-slate-400" : pct >= 80 ? "bg-amber-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => onBook(slot)}
        disabled={remaining === 0}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
      >
        {remaining === 0 ? "Fully Booked" : "Book Appointment"}
      </button>
    </div>
  );
}

function CalendarView({
  weekStart,
  weekDays,
  slotsByDate,
  onPrevWeek,
  onNextWeek,
  onBook,
}: {
  weekStart: Date;
  weekDays: Date[];
  slotsByDate: Record<string, Slot[]>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onBook: (slot: Slot) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevWeek}
          className="p-2 hover:bg-slate-100 rounded-lg"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">
          {weekStart.toLocaleDateString(undefined, { month: "long", day: "numeric" })} –{" "}
          {weekDays[6].toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </h2>
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-slate-100 rounded-lg"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const key = day.toDateString();
          const daySlots = slotsByDate[key] || [];
          const isToday = new Date().toDateString() === key;
          return (
            <div
              key={key}
              className={`min-h-[180px] border border-slate-200 rounded-lg p-2 ${
                isToday ? "bg-red-50 border-red-200" : "bg-white"
              }`}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-slate-500">
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <p className={`text-lg font-bold ${isToday ? "text-red-600" : "text-slate-900"}`}>
                  {day.getDate()}
                </p>
              </div>
              <div className="space-y-1">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center">No slots</p>
                ) : (
                  daySlots.slice(0, 3).map((slot) => {
                    const remaining = slot.capacity - slot.booked;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => onBook(slot)}
                        disabled={remaining === 0}
                        className={`w-full text-xs px-2 py-1 rounded font-medium transition-colors ${
                          remaining === 0
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                            : remaining <= 2
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {slot.date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </button>
                    );
                  })
                )}
                {daySlots.length > 3 && (
                  <p className="text-xs text-slate-500 text-center">+{daySlots.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-200" aria-hidden="true" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-200" aria-hidden="true" />
          Filling up
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-200" aria-hidden="true" />
          Full
        </div>
      </div>
    </div>
  );
}
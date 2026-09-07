"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Plus, Trash2 } from "lucide-react";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { useCalendarScheduleStore } from "../store/useCalendarScheduleStore";
import { formatScheduleSummary, isScheduleOnDate } from "../scheduleUtils";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const inputClass = "w-full border-2 border-[#6b4325] bg-[#fcedc7] p-2 text-xs text-[#261408] focus:border-[#b45309] focus:outline-none";

export function CalendarSchedulePanel({ selectedDate }: { selectedDate: string }) {
  const { schedules, addSchedule, completeOneTimeSchedule, removeSchedule } = useCalendarScheduleStore();
  const [isAdding, setIsAdding] = useState(false);
  const [scheduleType, setScheduleType] = useState<"WEEKLY" | "ONCE">("WEEKLY");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("07:00");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [scheduledAt, setScheduledAt] = useState(selectedDate);

  const toggleAdding = () => {
    setIsAdding((value) => {
      const nextValue = !value;
      if (nextValue) setScheduledAt(selectedDate);
      return nextValue;
    });
  };

  const visibleSchedules = useMemo(() => {
    const date = new Date(`${selectedDate}T12:00:00`);
    return schedules.filter((schedule) => isScheduleOnDate(schedule, date));
  }, [schedules, selectedDate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    addSchedule({
      title: title.trim(),
      time,
      scheduleType,
      dayOfWeek: scheduleType === "WEEKLY" ? Number(dayOfWeek) : null,
      scheduledAt: scheduleType === "ONCE" ? `${scheduledAt}T${time}:00` : null,
    });
    setTitle("");
    setIsAdding(false);
  };

  return (
    <section className="border-2 border-[#6b4325] bg-[#1b0d07]/95 p-4 shadow-[0_4px_0_0_#000]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[#78350f] bg-[#120703] text-[#fbbf24]">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-pixel text-base font-bold uppercase tracking-wider text-[#fef08a]">Personal Schedules</h2>
            <p className="text-xs text-amber-100/70">Recurring plans and one-time calendar events</p>
          </div>
        </div>
        <PixelButton variant="gold" size="sm" onClick={toggleAdding}>
          <Plus className="mr-1 h-4 w-4" /> Add Schedule
        </PixelButton>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 border-t border-[#542d17] pt-4 sm:grid-cols-2 lg:grid-cols-5">
          <input className={inputClass} placeholder="Class, meeting, deadline..." value={title} onChange={(event) => setTitle(event.target.value)} required />
          <select className={inputClass} value={scheduleType} onChange={(event) => setScheduleType(event.target.value as "WEEKLY" | "ONCE")}>
            <option value="WEEKLY">Every week</option>
            <option value="ONCE">One time</option>
          </select>
          {scheduleType === "WEEKLY" ? (
            <select className={inputClass} value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)}>
              {WEEKDAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
            </select>
          ) : (
            <input className={inputClass} type="date" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required />
          )}
          <input className={inputClass} type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          <PixelButton type="submit" variant="gold" size="sm">Save Schedule</PixelButton>
        </form>
      )}

      <div className="mt-4 grid gap-2">
        {visibleSchedules.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">No schedules set for this date.</p>
        ) : visibleSchedules.map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between gap-3 border border-[#542d17] bg-[#120703] px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#fef08a]">{schedule.title}</p>
              <p className="text-xs text-amber-100/70">{formatScheduleSummary(schedule)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {schedule.scheduleType === "ONCE" && (
                <button type="button" className="p-2 text-emerald-400 hover:bg-emerald-950/50" title="Mark complete" onClick={() => completeOneTimeSchedule(schedule.id)}><Check className="h-4 w-4" /></button>
              )}
              <button type="button" className="p-2 text-red-400 hover:bg-red-950/50" title="Delete schedule" onClick={() => removeSchedule(schedule.id)}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

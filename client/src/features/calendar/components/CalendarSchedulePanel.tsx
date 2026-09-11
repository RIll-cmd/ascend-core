"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Plus, Trash2 } from "lucide-react";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useCalendarScheduleStore } from "../store/useCalendarScheduleStore";
import { formatScheduleSummary, isScheduleOnDate, removeCompletedOneTimeSchedules } from "../scheduleUtils";
import { RivetedBoilerCard } from "@/components/ui/steampunk/RivetedBoilerCard";
import type { StoredCalendarSchedule } from "../store/useCalendarScheduleStore";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const inputClass = "w-full border-2 border-[#6b4325] bg-[#fcedc7] p-2 text-xs text-[#261408] focus:border-[#b45309] focus:outline-none";

export function CalendarSchedulePanel({ selectedDate }: { selectedDate: string }) {
  const { character } = useCharacterStore();
  const {
    schedules,
    fetchSchedules,
    addSchedule,
    completeOneTimeSchedule,
    removeSchedule,
  } = useCalendarScheduleStore();
  const [isAdding, setIsAdding] = useState(false);
  const [scheduleType, setScheduleType] = useState<"WEEKLY" | "ONCE">("WEEKLY");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("07:00");
  const [endTime, setEndTime] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [scheduledAt, setScheduledAt] = useState(selectedDate);

  useEffect(() => {
    if (character?.id) {
      fetchSchedules(character.id);
    }
  }, [character?.id, fetchSchedules]);

  const toggleAdding = () => {
    setIsAdding((value) => {
      const nextValue = !value;
      if (nextValue) setScheduledAt(selectedDate);
      return nextValue;
    });
  };

  const [filterMode, setFilterMode] = useState<"ALL" | "DATE">("ALL");

  const allActiveSchedules = useMemo<StoredCalendarSchedule[]>(() => {
    return removeCompletedOneTimeSchedules(schedules);
  }, [schedules]);

  const dateFilteredSchedules = useMemo<StoredCalendarSchedule[]>(() => {
    const date = new Date(`${selectedDate}T12:00:00`);
    return allActiveSchedules.filter((schedule: StoredCalendarSchedule) => isScheduleOnDate(schedule, date));
  }, [allActiveSchedules, selectedDate]);

  const visibleSchedules: StoredCalendarSchedule[] = filterMode === "ALL" ? allActiveSchedules : dateFilteredSchedules;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await addSchedule(
      {
        title: title.trim(),
        time,
        endTime: endTime || null,
        scheduleType,
        dayOfWeek: scheduleType === "WEEKLY" ? Number(dayOfWeek) : null,
        scheduledAt: scheduleType === "ONCE" ? `${scheduledAt}T${time}:00` : null,
      },
      character?.id
    );
    setTitle("");
    setEndTime("");
    setIsAdding(false);
  };

  return (
    <RivetedBoilerCard variant="default" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#542d17] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[#78350f] bg-[#120703] text-[#fbbf24]">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-pixel text-base font-bold uppercase tracking-wider text-[#fef08a]">Personal Schedules</h2>
            <p className="text-xs text-amber-100/70">Recurring plans and one-time calendar events</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#120703] border border-[#45200c] text-xs font-pixel font-bold">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`px-2.5 py-1 transition-all cursor-pointer ${
                filterMode === "ALL"
                  ? "bg-[#381a0c] text-[#fef08a] border border-[#f59e0b] shadow-sm"
                  : "text-amber-200/70 hover:text-white"
              }`}
            >
              ALL ({allActiveSchedules.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("DATE")}
              className={`px-2.5 py-1 transition-all cursor-pointer ${
                filterMode === "DATE"
                  ? "bg-[#381a0c] text-[#fef08a] border border-[#f59e0b] shadow-sm"
                  : "text-amber-200/70 hover:text-white"
              }`}
            >
              SELECTED ({dateFilteredSchedules.length})
            </button>
          </div>

          <PixelButton variant="gold" size="sm" onClick={toggleAdding}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </PixelButton>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 border-t border-[#542d17] pt-4 sm:grid-cols-2 lg:grid-cols-6">
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
          <input className={inputClass} type="time" value={time} onChange={(event) => setTime(event.target.value)} required title="Start time" />
          <input className={inputClass} type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} placeholder="End (optional)" title="End time (optional)" />
          <PixelButton type="submit" variant="gold" size="sm">Save Schedule</PixelButton>
        </form>
      )}

      <div className="mt-4 grid gap-2">
        {visibleSchedules.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-xs text-slate-400">
              {filterMode === "ALL"
                ? "No active schedules registered. Ask AIRA in Command Center or add one above."
                : `No active schedules set for ${selectedDate}. Switch to 'ALL' to view all schedules.`}
            </p>
          </div>
        ) : visibleSchedules.map((schedule: StoredCalendarSchedule) => {
          const isWeekly = schedule.scheduleType === "WEEKLY";
          const dayName = isWeekly && schedule.dayOfWeek !== null && schedule.dayOfWeek !== undefined
            ? WEEKDAYS[Number(schedule.dayOfWeek)]
            : null;

          return (
            <div key={schedule.id} className="flex items-center justify-between gap-3 border border-[#542d17] bg-[#120703] px-3.5 py-2.5 rounded-sm hover:border-[#78350f] transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0 shadow-[0_0_6px_#2dd4bf]" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="truncate text-sm font-bold text-[#fef08a]">{schedule.title}</p>
                    {dayName && (
                      <span className="px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-500/40 text-teal-300 font-mono text-[10px] font-bold">
                        {dayName.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-[#2a1309] border border-[#78350f] text-amber-200 font-mono text-[10px] font-bold">
                      {schedule.time}{schedule.endTime ? ` - ${schedule.endTime}` : ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/60 font-mono mt-0.5">{formatScheduleSummary(schedule)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {schedule.scheduleType === "ONCE" && (
                  <button type="button" className="p-2 text-emerald-400 hover:bg-emerald-950/50 transition-colors" title="Mark complete" onClick={() => completeOneTimeSchedule(schedule.id, character?.id)}><Check className="h-4 w-4" /></button>
                )}
                <button type="button" className="p-2 text-red-400 hover:bg-red-950/50 transition-colors" title="Delete schedule" onClick={() => removeSchedule(schedule.id, character?.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </RivetedBoilerCard>
  );
}

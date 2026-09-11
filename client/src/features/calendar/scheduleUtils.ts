export type ScheduleType = "WEEKLY" | "ONCE";

export interface CalendarSchedule {
  id: string;
  scheduleType: ScheduleType;
  dayOfWeek?: number | null;
  scheduledAt?: string | null;
  endTime?: string | null;
  completed?: boolean;
}

export function formatScheduleSummary(
  schedule: Pick<CalendarSchedule, "scheduleType" | "dayOfWeek" | "scheduledAt" | "endTime"> & {
    time: string;
  }
) {
  const timeDisplay = schedule.endTime ? `${schedule.time} - ${schedule.endTime}` : schedule.time;

  if (schedule.scheduleType === "WEEKLY") {
    return `${timeDisplay} · Every ${WEEKDAYS[schedule.dayOfWeek ?? 0]}`;
  }

  const date = schedule.scheduledAt?.slice(0, 10);
  if (!date) return `${timeDisplay} · One time`;

  const [year, month, day] = date.split("-").map(Number);
  return `${timeDisplay} · ${MONTHS[month - 1]} ${day}, ${year}`;
}

export function isOneTimeScheduleExpired(
  schedule: Pick<CalendarSchedule, "scheduleType" | "scheduledAt" | "completed"> & {
    time?: string;
    endTime?: string | null;
  },
  now = new Date()
): boolean {
  if (schedule.scheduleType !== "ONCE" || !schedule.scheduledAt) {
    return false;
  }
  if (schedule.completed) {
    return true;
  }
  try {
    const dateStr = schedule.scheduledAt.slice(0, 10);
    const cutoffTime = schedule.endTime || schedule.time || "00:00";
    const [hours, minutes] = cutoffTime.split(":").map(Number);
    const [year, month, day] = dateStr.split("-").map(Number);
    const cutoffDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now.getTime() >= cutoffDate.getTime();
  } catch {
    return false;
  }
}

export function isScheduleOnDate(
  schedule: Pick<CalendarSchedule, "scheduleType" | "dayOfWeek" | "scheduledAt" | "completed"> & {
    time?: string;
    endTime?: string | null;
  },
  date: Date
) {
  if (schedule.scheduleType === "ONCE" && schedule.completed) {
    return false;
  }

  if (schedule.scheduleType === "WEEKLY") {
    return schedule.dayOfWeek !== null && schedule.dayOfWeek !== undefined && Number(schedule.dayOfWeek) === date.getDay();
  }

  return Boolean(
    schedule.scheduledAt &&
      schedule.scheduledAt.slice(0, 10) === formatLocalDate(date)
  );
}

export function formatLocalDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function removeCompletedOneTimeSchedules<
  T extends CalendarSchedule & { time?: string; endTime?: string | null }
>(schedules: T[]) {
  return schedules.filter(
    (schedule) => !(schedule.scheduleType === "ONCE" && (schedule.completed || isOneTimeScheduleExpired(schedule)))
  );
}

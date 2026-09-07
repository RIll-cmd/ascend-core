export type ScheduleType = "WEEKLY" | "ONCE";

export interface CalendarSchedule {
  id: string;
  scheduleType: ScheduleType;
  dayOfWeek?: number | null;
  scheduledAt?: string | null;
  completed?: boolean;
}

export function formatScheduleSummary(
  schedule: Pick<CalendarSchedule, "scheduleType" | "dayOfWeek" | "scheduledAt"> & {
    time: string;
  }
) {
  if (schedule.scheduleType === "WEEKLY") {
    return `${schedule.time} · Every ${WEEKDAYS[schedule.dayOfWeek ?? 0]}`;
  }

  const date = schedule.scheduledAt?.slice(0, 10);
  if (!date) return `${schedule.time} · One time`;

  const [year, month, day] = date.split("-").map(Number);
  return `${schedule.time} · ${MONTHS[month - 1]} ${day}, ${year}`;
}

export function isScheduleOnDate(
  schedule: Pick<CalendarSchedule, "scheduleType" | "dayOfWeek" | "scheduledAt">,
  date: Date
) {
  if (schedule.scheduleType === "WEEKLY") {
    return schedule.dayOfWeek === date.getDay();
  }

  return Boolean(
    schedule.scheduledAt &&
      schedule.scheduledAt.slice(0, 10) === formatLocalDate(date)
  );
}

function formatLocalDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function removeCompletedOneTimeSchedules<T extends CalendarSchedule>(
  schedules: T[]
) {
  return schedules.filter(
    (schedule) => !(schedule.scheduleType === "ONCE" && schedule.completed)
  );
}

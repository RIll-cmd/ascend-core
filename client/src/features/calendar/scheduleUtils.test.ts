import { describe, expect, it } from "vitest";
import {
  formatScheduleSummary,
  isScheduleOnDate,
  removeCompletedOneTimeSchedules,
} from "./scheduleUtils";

describe("calendar schedule utilities", () => {
  it("matches a weekly schedule only on its selected weekday", () => {
    const schedule = { scheduleType: "WEEKLY" as const, dayOfWeek: 1 };

    expect(isScheduleOnDate(schedule, new Date("2026-09-07T07:00:00"))).toBe(true);
    expect(isScheduleOnDate(schedule, new Date("2026-09-08T07:00:00"))).toBe(false);
  });

  it("matches a one-time schedule only on its calendar date", () => {
    const schedule = { scheduleType: "ONCE" as const, scheduledAt: "2026-09-10T15:00:00" };

    expect(isScheduleOnDate(schedule, new Date("2026-09-10T00:00:00"))).toBe(true);
    expect(isScheduleOnDate(schedule, new Date("2026-09-11T00:00:00"))).toBe(false);
  });

  it("removes completed one-time schedules while preserving recurring plans", () => {
    const schedules = [
      { id: "once", scheduleType: "ONCE" as const, completed: true },
      { id: "weekly", scheduleType: "WEEKLY" as const, completed: true },
      { id: "active", scheduleType: "ONCE" as const, completed: false },
    ];

    expect(removeCompletedOneTimeSchedules(schedules).map((item) => item.id)).toEqual([
      "weekly",
      "active",
    ]);
  });

  it("includes the weekday for recurring schedules and date for one-time schedules", () => {
    expect(
      formatScheduleSummary({ scheduleType: "WEEKLY", dayOfWeek: 1, time: "07:00" })
    ).toBe("07:00 · Every Monday");
    expect(
      formatScheduleSummary({
        scheduleType: "ONCE",
        scheduledAt: "2026-09-10T15:00:00",
        time: "15:00",
      })
    ).toBe("15:00 · Sep 10, 2026");
  });
});

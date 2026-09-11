"""Persistent SQLite store for Core personal calendar schedules."""

import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


def _default_calendar_db_path() -> Path:
    override = os.getenv("CALENDAR_SCHEDULES_PATH")
    if override:
        return Path(override)
    return Path(__file__).resolve().parent.parent / "data" / "calendar_schedules.sqlite3"


class LocalCalendarScheduleStore:
    def __init__(self, db_path: Path | str | None = None) -> None:
        self.db_path = Path(db_path) if db_path else _default_calendar_db_path()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS calendar_schedules (
                    id TEXT PRIMARY KEY,
                    character_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    time TEXT NOT NULL,
                    end_time TEXT,
                    schedule_type TEXT NOT NULL,
                    day_of_week INTEGER,
                    scheduled_at TEXT,
                    completed INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            table_info = conn.execute("PRAGMA table_info(calendar_schedules)").fetchall()
            existing_cols = {col["name"] for col in table_info}
            if "end_time" not in existing_cols:
                conn.execute("ALTER TABLE calendar_schedules ADD COLUMN end_time TEXT")

            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_calendar_schedules_char
                ON calendar_schedules(character_id)
                """
            )
            conn.commit()

    @staticmethod
    def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
        keys = row.keys()
        return {
            "id": row["id"],
            "characterId": row["character_id"],
            "title": row["title"],
            "time": row["time"],
            "endTime": row["end_time"] if "end_time" in keys else None,
            "scheduleType": row["schedule_type"],
            "dayOfWeek": row["day_of_week"],
            "scheduledAt": row["scheduled_at"],
            "completed": bool(row["completed"]),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }

    def create_schedule(self, data: dict[str, Any]) -> dict[str, Any]:
        schedule_id = data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO calendar_schedules (
                    id, character_id, title, time, end_time, schedule_type,
                    day_of_week, scheduled_at, completed, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    schedule_id,
                    data["characterId"],
                    data["title"],
                    data["time"],
                    data.get("endTime") or data.get("end_time"),
                    data["scheduleType"],
                    data.get("dayOfWeek"),
                    data.get("scheduledAt"),
                    1 if data.get("completed") else 0,
                    now,
                    now,
                ),
            )
            conn.commit()

        schedule = self.get_schedule(schedule_id)
        if not schedule:
            raise RuntimeError(f"Failed to load schedule {schedule_id} after insertion.")
        return schedule

    def _auto_complete_expired_schedules(self, character_id: str) -> None:
        """Automatically marks one-time events as completed if their scheduled date and end time have passed."""
        now = datetime.now()
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT id, scheduled_at, time, end_time FROM calendar_schedules
                WHERE character_id = ? AND schedule_type = 'ONCE' AND completed = 0
                """,
                (character_id,),
            )
            rows = cursor.fetchall()
            expired_ids = []
            for row in rows:
                sched_at = row["scheduled_at"]
                if not sched_at:
                    continue
                date_part = str(sched_at)[:10]
                time_part = row["end_time"] or row["time"] or "00:00"
                try:
                    cutoff_dt = datetime.strptime(f"{date_part} {time_part}", "%Y-%m-%d %H:%M")
                    if now >= cutoff_dt:
                        expired_ids.append(row["id"])
                except Exception:
                    pass

            if expired_ids:
                now_iso = datetime.now(timezone.utc).isoformat()
                placeholders = ",".join("?" for _ in expired_ids)
                conn.execute(
                    f"""
                    UPDATE calendar_schedules
                    SET completed = 1, updated_at = ?
                    WHERE id IN ({placeholders})
                    """,
                    (now_iso, *expired_ids),
                )
                conn.commit()

    def get_schedules_for_character(self, character_id: str) -> list[dict[str, Any]]:
        self._auto_complete_expired_schedules(character_id)
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT * FROM calendar_schedules
                WHERE character_id = ?
                ORDER BY created_at ASC
                """,
                (character_id,),
            )
            rows = cursor.fetchall()
            return [self._row_to_dict(r) for r in rows]

    def get_schedule(self, schedule_id: str) -> Optional[dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM calendar_schedules WHERE id = ?",
                (schedule_id,),
            )
            row = cursor.fetchone()
            return self._row_to_dict(row) if row else None

    def complete_schedule(self, schedule_id: str) -> Optional[dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                UPDATE calendar_schedules
                SET completed = 1, updated_at = ?
                WHERE id = ?
                """,
                (now, schedule_id),
            )
            conn.commit()
            if cursor.rowcount == 0:
                return None
        return self.get_schedule(schedule_id)

    def delete_schedule(self, schedule_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "DELETE FROM calendar_schedules WHERE id = ?",
                (schedule_id,),
            )
            conn.commit()
            return cursor.rowcount > 0


_calendar_store_instance: Optional[LocalCalendarScheduleStore] = None


def get_calendar_schedule_store() -> LocalCalendarScheduleStore:
    global _calendar_store_instance
    if _calendar_store_instance is None:
        _calendar_store_instance = LocalCalendarScheduleStore()
    return _calendar_store_instance

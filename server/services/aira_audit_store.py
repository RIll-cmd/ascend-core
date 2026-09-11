"""Durable local audit and idempotency storage for explicit AIRA local mode."""

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class LocalAuditConfigurationError(RuntimeError):
    """A local audit backend was requested without an explicit local-mode flag."""


def get_aira_audit_store() -> "LocalSQLiteAuditStore":
    """Return the local store only when deliberately enabled for local development."""
    if os.getenv("AIRA_LOCAL_MODE", "").lower() != "true":
        raise LocalAuditConfigurationError(
            "AIRA local execution is disabled. Set AIRA_LOCAL_MODE=true for the local SQLite audit backend."
        )
    configured_path = os.getenv("AIRA_LOCAL_AUDIT_PATH")
    default_path = Path(__file__).resolve().parents[1] / "data" / "aira_audit.sqlite3"
    return LocalSQLiteAuditStore(configured_path or default_path)


class LocalSQLiteAuditStore:
    """A small, persistent local store; each method uses an atomic SQLite write."""

    def __init__(self, path: Path | str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connection(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS aira_operation_audits (
                    actor_id TEXT NOT NULL,
                    request_id TEXT NOT NULL,
                    character_id TEXT NOT NULL,
                    operation TEXT NOT NULL,
                    status TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    result_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (actor_id, request_id)
                )
                """
            )

    @staticmethod
    def _record(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "actorId": row["actor_id"],
            "requestId": row["request_id"],
            "characterId": row["character_id"],
            "operation": row["operation"],
            "status": row["status"],
            "metadata": json.loads(row["metadata_json"]),
            "result": json.loads(row["result_json"]),
        }

    async def reserve(
        self,
        actor_id: str,
        character_id: str,
        operation: str,
        request_id: str,
        metadata: dict[str, Any],
    ) -> tuple[bool, dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        with self._connection() as connection:
            try:
                connection.execute(
                    """
                    INSERT INTO aira_operation_audits
                    (actor_id, request_id, character_id, operation, status, metadata_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?)
                    """,
                    (actor_id, request_id, character_id, operation, json.dumps(metadata, sort_keys=True), now, now),
                )
            except sqlite3.IntegrityError:
                row = connection.execute(
                    "SELECT * FROM aira_operation_audits WHERE actor_id = ? AND request_id = ?",
                    (actor_id, request_id),
                ).fetchone()
                if row is None:
                    raise
                return False, self._record(row)

            row = connection.execute(
                "SELECT * FROM aira_operation_audits WHERE actor_id = ? AND request_id = ?",
                (actor_id, request_id),
            ).fetchone()
            return True, self._record(row)

    async def complete(self, actor_id: str, request_id: str, result: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        with self._connection() as connection:
            connection.execute(
                """
                UPDATE aira_operation_audits
                SET status = 'COMPLETED', result_json = ?, updated_at = ?
                WHERE actor_id = ? AND request_id = ?
                """,
                (json.dumps(result, sort_keys=True), now, actor_id, request_id),
            )
            row = connection.execute(
                "SELECT * FROM aira_operation_audits WHERE actor_id = ? AND request_id = ?",
                (actor_id, request_id),
            ).fetchone()
            if row is None:
                raise RuntimeError("AIRA audit reservation disappeared.")
            return self._record(row)

    async def fail(self, actor_id: str, request_id: str, error: str) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                UPDATE aira_operation_audits
                SET status = 'FAILED', result_json = ?, updated_at = ?
                WHERE actor_id = ? AND request_id = ?
                """,
                (json.dumps({"error": error}), datetime.now(timezone.utc).isoformat(), actor_id, request_id),
            )

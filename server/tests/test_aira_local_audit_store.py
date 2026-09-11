import pytest

from services.aira_audit_store import LocalAuditConfigurationError, LocalSQLiteAuditStore, get_aira_audit_store


@pytest.mark.asyncio
async def test_local_store_reserves_idempotency_key_across_store_instances(tmp_path):
    path = tmp_path / "aira_audit.sqlite3"
    first_store = LocalSQLiteAuditStore(path)

    created, first = await first_store.reserve(
        "user-1", "character-1", "create_habit", "request-1", {"source": "aira"}
    )
    await first_store.complete("user-1", "request-1", {"habitId": "habit-1"})

    second_store = LocalSQLiteAuditStore(path)
    created_again, replay = await second_store.reserve(
        "user-1", "character-1", "create_habit", "request-1", {"source": "aira"}
    )

    assert created is True
    assert first["status"] == "PENDING"
    assert created_again is False
    assert replay["status"] == "COMPLETED"
    assert replay["result"] == {"habitId": "habit-1"}


def test_audit_store_requires_explicit_local_mode(monkeypatch, tmp_path):
    monkeypatch.delenv("AIRA_LOCAL_MODE", raising=False)

    with pytest.raises(LocalAuditConfigurationError):
        get_aira_audit_store()

    monkeypatch.setenv("AIRA_LOCAL_MODE", "true")
    monkeypatch.setenv("AIRA_LOCAL_AUDIT_PATH", str(tmp_path / "local.sqlite3"))

    assert isinstance(get_aira_audit_store(), LocalSQLiteAuditStore)

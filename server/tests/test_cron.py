import pytest
from fastapi import HTTPException
from routers.cron import verify_cron_authorization, run_status_sweep_cron, run_midnight_decay_cron


def test_verify_cron_authorization_success_bearer(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "super-secret-cron-token")
    monkeypatch.setenv("ENVIRONMENT", "production")

    assert verify_cron_authorization(authorization="Bearer super-secret-cron-token") is True


def test_verify_cron_authorization_success_header(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "super-secret-cron-token")
    monkeypatch.setenv("ENVIRONMENT", "production")

    assert verify_cron_authorization(x_cron_secret="super-secret-cron-token") is True


def test_verify_cron_authorization_unauthorized(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "super-secret-cron-token")
    monkeypatch.setenv("ENVIRONMENT", "production")

    with pytest.raises(HTTPException) as exc_info:
        verify_cron_authorization(authorization="Bearer wrong-token")
    assert exc_info.value.status_code == 401


def test_verify_cron_authorization_missing_secret_in_prod(monkeypatch):
    monkeypatch.delenv("CRON_SECRET", raising=False)
    monkeypatch.setenv("ENVIRONMENT", "production")

    with pytest.raises(HTTPException) as exc_info:
        verify_cron_authorization(authorization="Bearer any-token")
    assert exc_info.value.status_code == 500


@pytest.mark.asyncio
async def test_status_sweep_cron_execution(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "test-secret")
    
    recorded = {}

    class DummyService:
        async def record_heartbeat(self, service_id, instance_id, now=None):
            recorded["heartbeat"] = (service_id, instance_id)
            return object()

        async def sweep(self, now=None):
            recorded["swept"] = True

    monkeypatch.setattr("services.status_service.get_status_service", lambda: DummyService())

    res = await run_status_sweep_cron(None, authorization="Bearer test-secret")
    assert res["status"] == "success"
    assert res["job"] == "status-sweep"
    assert res["heartbeatRecorded"] is True
    assert recorded.get("swept") is True

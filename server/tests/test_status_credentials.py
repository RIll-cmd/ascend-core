from datetime import datetime, timezone

import pytest

from services.status_repository import InMemoryStatusRepository
from services.status_service import StatusService
from cli.status_credentials import execute


@pytest.mark.asyncio
async def test_producer_credential_is_bound_to_one_service_instance():
    service = StatusService(InMemoryStatusRepository())
    raw_secret = await service.provision_producer_credential(
        credential_id="vision-1",
        service_id="ascend-vision",
        instance_id="vision-1",
    )

    producer = await service.authenticate_producer(f"vision-1.{raw_secret}")

    assert producer.service_id == "ascend-vision"
    assert producer.instance_id == "vision-1"
    with pytest.raises(PermissionError, match="bound"):
        service.assert_producer_owns_event(producer, "ascend-vision", "vision-2")


@pytest.mark.asyncio
async def test_revoked_producer_credential_is_rejected():
    service = StatusService(InMemoryStatusRepository())
    raw_secret = await service.provision_producer_credential(
        credential_id="core-1",
        service_id="ascend-core",
        instance_id="core-1",
    )
    await service.revoke_producer_credential("core-1", now=datetime.now(timezone.utc))

    with pytest.raises(PermissionError, match="Invalid or revoked"):
        await service.authenticate_producer(f"core-1.{raw_secret}")


@pytest.mark.asyncio
async def test_create_rejects_a_second_active_credential_for_the_same_instance():
    service = StatusService(InMemoryStatusRepository())
    await service.provision_producer_credential(credential_id="vision-1", service_id="ascend-vision", instance_id="vision-1")

    with pytest.raises(ValueError, match="rotate or revoke"):
        await service.provision_producer_credential(credential_id="vision-2", service_id="ascend-vision", instance_id="vision-1")


@pytest.mark.asyncio
async def test_rotate_revokes_previous_credential_and_issues_one_new_secret():
    service = StatusService(InMemoryStatusRepository())
    old_secret = await service.provision_producer_credential(credential_id="vision-old", service_id="ascend-vision", instance_id="vision-1")

    credential_id, new_secret = await service.rotate_producer_credential(service_id="ascend-vision", instance_id="vision-1")

    with pytest.raises(PermissionError):
        await service.authenticate_producer(f"vision-old.{old_secret}")
    producer = await service.authenticate_producer(f"{credential_id}.{new_secret}")
    assert producer.instance_id == "vision-1"


@pytest.mark.asyncio
async def test_cli_list_outputs_safe_metadata_without_a_secret_or_hash():
    service = StatusService(InMemoryStatusRepository())
    created = await execute(["create", "--service-id", "ascend-vision", "--instance-id", "vision-1"], service=service)
    secret = created.rsplit(".", 1)[1]

    output = await execute(["list"], service=service)

    assert "Save this once:" in created
    assert "vision-1" in output
    assert secret not in output
    assert "secretHash" not in output


@pytest.mark.asyncio
async def test_cli_revoke_changes_listed_credential_to_revoked():
    service = StatusService(InMemoryStatusRepository())
    created = await execute(["create", "--service-id", "ascend-core", "--instance-id", "core-local-1"], service=service)
    credential_id = created.rsplit("\n", 1)[1].split(".", 1)[0]

    await execute(["revoke", "--credential-id", credential_id], service=service)

    assert "revoked" in await execute(["list"], service=service)

"""Safely provision and revoke Status Shelf producer credentials."""

from __future__ import annotations

import argparse
import asyncio
from datetime import timezone

from services.status_service import get_status_service


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage instance-bound Status Shelf producer credentials.")
    commands = parser.add_subparsers(dest="action", required=True)
    for action in ("create", "rotate"):
        command = commands.add_parser(action)
        command.add_argument("--service-id", required=True)
        command.add_argument("--instance-id", required=True)
    revoke = commands.add_parser("revoke")
    revoke.add_argument("--credential-id", required=True)
    commands.add_parser("list")
    return parser


async def execute(argv: list[str], *, service=None) -> str:
    args = _parser().parse_args(argv)
    service = service or get_status_service()
    if args.action == "create":
        credential_id = f"{args.service_id}-{args.instance_id}"[:110]
        # A random suffix makes the public identifier non-reusable after revoke.
        from secrets import token_hex
        credential_id = f"{credential_id}-{token_hex(6)}"
        secret = await service.provision_producer_credential(credential_id=credential_id, service_id=args.service_id, instance_id=args.instance_id)
        return f"Created credential for {args.service_id}/{args.instance_id}. Save this once:\n{credential_id}.{secret}"
    if args.action == "rotate":
        credential_id, secret = await service.rotate_producer_credential(service_id=args.service_id, instance_id=args.instance_id)
        return f"Rotated credential for {args.service_id}/{args.instance_id}. Save this once:\n{credential_id}.{secret}"
    if args.action == "revoke":
        await service.revoke_producer_credential(args.credential_id)
        return f"Revoked credential {args.credential_id}."
    rows = await service.list_producer_credentials()
    if not rows:
        return "No status producer credentials."
    return "\n".join(
        f"{row.credential_id}\t{row.service_id}\t{row.instance_id}\t{row.created_at.astimezone(timezone.utc).isoformat() if row.created_at else 'unknown'}\t{'revoked' if row.revoked_at else 'active'}"
        for row in rows
    )


async def _main() -> int:
    from db import db
    if not db.is_connected():
        await db.connect()
    try:
        try:
            print(await execute(__import__("sys").argv[1:]))
        except ValueError as error:
            print(f"ERROR: {error}")
            return 2
        return 0
    finally:
        if db.is_connected():
            await db.disconnect()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(_main()))

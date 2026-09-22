"""Operator-only management for the Hub's read-only Shelf credential."""

from __future__ import annotations

import argparse
import asyncio
import secrets
from datetime import timezone

from services.status_service import get_status_service


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage the read-only Status Shelf credential.")
    commands = parser.add_subparsers(dest="action", required=True)
    commands.add_parser("create")
    commands.add_parser("list")
    revoke = commands.add_parser("revoke")
    revoke.add_argument("--credential-id", required=True)
    return parser


async def execute(argv: list[str], *, service=None) -> str:
    args = _parser().parse_args(argv)
    service = service or get_status_service()
    if args.action == "create":
        credential_id = f"hub-shelf-read-{secrets.token_hex(6)}"
        secret = await service.provision_shelf_read_credential(credential_id=credential_id)
        return f"Created Hub Shelf read credential. Save this once:\n{credential_id}.{secret}"
    if args.action == "revoke":
        await service.revoke_shelf_read_credential(args.credential_id)
        return f"Revoked Shelf read credential {args.credential_id}."
    rows = await service.list_shelf_read_credentials()
    if not rows:
        return "No Shelf read credentials."
    return "\n".join(
        f"{row.credential_id}\t{row.created_at.astimezone(timezone.utc).isoformat() if row.created_at else 'unknown'}\t{'revoked' if row.revoked_at else 'active'}"
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

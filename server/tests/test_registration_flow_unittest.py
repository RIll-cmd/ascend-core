import sqlite3
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

from fastapi import HTTPException, Response
from pydantic import ValidationError

from routers import auth


register = auth.register.__wrapped__
login = auth.login.__wrapped__
send_otp = auth.send_otp.__wrapped__


class RegistrationFlowTests(unittest.IsolatedAsyncioTestCase):
    def test_registration_requires_both_handle_and_email(self):
        with self.assertRaises(ValidationError):
            auth.RegisterInput(username="new_hunter", password="ValidPass123!")

    async def test_registration_without_email_code_creates_unverified_account(self):
        new_user = {
            "id": "user-new",
            "username": "new_hunter",
            "email": "new@example.com",
            "isEmailVerified": False,
        }
        with (
            patch.object(auth, "get_all_users", new=AsyncMock(return_value=[])),
            patch.object(auth, "hash_password", return_value="hashed-password"),
            patch.object(auth, "insert_user", new=AsyncMock(return_value=new_user)) as insert,
            patch.object(auth, "ensure_character_exists", new=AsyncMock(return_value=SimpleNamespace(id="char-new"))),
            patch.object(auth, "create_access_token", return_value="signed-token"),
            patch.object(auth, "set_auth_cookie"),
        ):
            result = await register(
                None,
                auth.RegisterInput(username="new_hunter", email="new@example.com", password="ValidPass123!"),
                Response(),
            )

        self.assertFalse(result["isEmailVerified"])
        self.assertFalse(result["user"]["isEmailVerified"])
        self.assertEqual(insert.await_args.args[2], "new@example.com")
        self.assertFalse(insert.await_args.kwargs["is_verified"])

    async def test_duplicate_handle_or_email_does_not_insert(self):
        existing = [{"id": "user-old", "username": "TakenHunter", "email": "taken@example.com"}]
        cases = [
            ("takenhunter", "new@example.com"),
            ("new_hunter", "TAKEN@example.com"),
        ]
        for username, email in cases:
            with self.subTest(username=username, email=email):
                with (
                    patch.object(auth, "get_all_users", new=AsyncMock(return_value=existing)),
                    patch.object(auth, "insert_user", new=AsyncMock()) as insert,
                ):
                    with self.assertRaises(HTTPException) as failure:
                        await register(
                            None,
                            auth.RegisterInput(username=username, email=email, password="ValidPass123!"),
                            Response(),
                        )
                    self.assertEqual(failure.exception.status_code, 409)
                    insert.assert_not_awaited()

    async def test_duplicate_check_reads_cloud_and_local_accounts(self):
        connection = sqlite3.connect(":memory:")
        connection.row_factory = sqlite3.Row
        connection.execute("CREATE TABLE User (id TEXT, username TEXT, email TEXT, password TEXT, isEmailVerified INTEGER)")
        connection.execute("INSERT INTO User VALUES (?, ?, ?, ?, ?)", ("local-id", "LocalHunter", "local@example.com", "hash", 0))
        cloud_user = SimpleNamespace(
            id="cloud-id", username="CloudHunter", email="cloud@example.com", password="hash", isEmailVerified=True
        )
        database = SimpleNamespace(
            is_connected=lambda: True,
            user=SimpleNamespace(find_many=AsyncMock(return_value=[cloud_user])),
        )
        with (
            patch.object(auth, "db", database),
            patch.object(auth, "get_db_connection", return_value=connection),
        ):
            users = await auth.get_all_users()

        self.assertEqual({user["id"] for user in users}, {"cloud-id", "local-id"})

    async def test_passwordless_account_cannot_sign_in_with_password(self):
        user = {"id": "guest-id", "username": "Guest_1234", "email": None, "password": ""}
        with (
            patch.object(auth, "get_user_by_identifier", new=AsyncMock(return_value=user)),
            patch.object(auth, "create_access_token") as token,
        ):
            with self.assertRaises(HTTPException) as failure:
                await login(None, auth.LoginInput(identifier="Guest_1234", password="anything"), Response())
            self.assertEqual(failure.exception.status_code, 400)
            token.assert_not_called()

    async def test_unconfigured_email_sender_does_not_create_code(self):
        with (
            patch.object(auth, "is_email_sender_configured", return_value=False),
            patch.object(auth, "create_and_store_otp", new=AsyncMock()) as store,
        ):
            with self.assertRaises(HTTPException) as failure:
                await send_otp(None, auth.SendOtpInput(email="new@example.com"))
            self.assertEqual(failure.exception.status_code, 503)
            store.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()

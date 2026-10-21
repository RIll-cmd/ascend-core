"""Authenticated encryption for private notification details and push capabilities."""
from __future__ import annotations

import os

from cryptography.fernet import Fernet, InvalidToken


class NotificationCipher:
    def __init__(self, key: str):
        try:
            self._fernet = Fernet(key.encode("ascii"))
        except (ValueError, UnicodeEncodeError) as error:
            raise ValueError("notification encryption key is invalid") from error

    @classmethod
    def from_environment(cls, environ=None) -> "NotificationCipher":
        values = os.environ if environ is None else environ
        key = values.get("ASCEND_NOTIFICATION_ENCRYPTION_KEY", "").strip()
        if not key:
            raise RuntimeError("ASCEND_NOTIFICATION_ENCRYPTION_KEY is required for notification storage")
        return cls(key)

    @classmethod
    def from_key(cls, key: str) -> "NotificationCipher":
        return cls(key)

    def encrypt(self, plaintext: str) -> str:
        if not isinstance(plaintext, str):
            raise TypeError("notification plaintext must be text")
        return self._fernet.encrypt(plaintext.encode("utf-8")).decode("ascii")

    def decrypt(self, ciphertext: str) -> str:
        if not isinstance(ciphertext, str):
            raise TypeError("notification ciphertext must be text")
        try:
            return self._fernet.decrypt(ciphertext.encode("ascii")).decode("utf-8")
        except (InvalidToken, UnicodeEncodeError) as error:
            raise ValueError("notification ciphertext cannot be decrypted") from error

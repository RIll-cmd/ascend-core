-- Additive pairing and link persistence. Apply with the same migration tooling
-- used for the target database; do not use db push to replace these indexes.
CREATE TABLE "PhoneDiscordPairing" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PhoneDiscordPairing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PhoneDiscordPairing_codeHash_key" ON "PhoneDiscordPairing"("codeHash");
CREATE INDEX "PhoneDiscordPairing_ownerId_idx" ON "PhoneDiscordPairing"("ownerId");
CREATE INDEX "PhoneDiscordPairing_expiresAt_consumedAt_idx" ON "PhoneDiscordPairing"("expiresAt", "consumedAt");
ALTER TABLE "PhoneDiscordPairing" ADD CONSTRAINT "PhoneDiscordPairing_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PhoneDiscordLink" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "PhoneDiscordLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PhoneDiscordLink_ownerId_revokedAt_idx" ON "PhoneDiscordLink"("ownerId", "revokedAt");
CREATE INDEX "PhoneDiscordLink_discordUserId_revokedAt_idx" ON "PhoneDiscordLink"("discordUserId", "revokedAt");
CREATE UNIQUE INDEX "PhoneDiscordLink_active_owner_key" ON "PhoneDiscordLink"("ownerId") WHERE "revokedAt" IS NULL;
CREATE UNIQUE INDEX "PhoneDiscordLink_active_discord_user_key" ON "PhoneDiscordLink"("discordUserId") WHERE "revokedAt" IS NULL;
ALTER TABLE "PhoneDiscordLink" ADD CONSTRAINT "PhoneDiscordLink_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

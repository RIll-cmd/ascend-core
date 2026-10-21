-- Additive, owner-scoped notification records. Details and push capability
-- material are encrypted by the application before insertion.
CREATE TYPE "CompanionNotificationChannel" AS ENUM ('pwa_push', 'discord_dm');
CREATE TYPE "CompanionNotificationDeliveryStatus" AS ENUM
    ('queued', 'claimed', 'retry', 'attempted', 'acknowledged', 'unknown', 'failed', 'expired', 'revoked');

CREATE UNIQUE INDEX IF NOT EXISTS "PhoneChatDevice_ownerId_id_key"
    ON "PhoneChatDevice"("ownerId", "id");

CREATE TABLE "CompanionNotificationPreference" (
    "ownerId" TEXT NOT NULL,
    "pwaPushEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "discordDmEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CompanionNotificationPreference_pkey" PRIMARY KEY ("ownerId"),
    CONSTRAINT "CompanionNotificationPreference_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CompanionPushSubscription" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "endpointHash" TEXT NOT NULL,
    "payloadCiphertext" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "CompanionPushSubscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CompanionPushSubscription_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanionPushSubscription_ownerId_deviceId_fkey"
        FOREIGN KEY ("ownerId", "deviceId") REFERENCES "PhoneChatDevice"("ownerId", "id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CompanionPushSubscription_deviceId_key" ON "CompanionPushSubscription"("deviceId");
CREATE UNIQUE INDEX "CompanionPushSubscription_ownerId_deviceId_key" ON "CompanionPushSubscription"("ownerId", "deviceId");
CREATE UNIQUE INDEX "CompanionPushSubscription_endpointHash_key" ON "CompanionPushSubscription"("endpointHash");
CREATE INDEX "CompanionPushSubscription_ownerId_revokedAt_idx" ON "CompanionPushSubscription"("ownerId", "revokedAt");

CREATE TABLE "CompanionNotificationIntent" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "triggerKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "detailCiphertext" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CompanionNotificationIntent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CompanionNotificationIntent_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CompanionNotificationIntent_ownerId_triggerKey_key"
    ON "CompanionNotificationIntent"("ownerId", "triggerKey");
CREATE UNIQUE INDEX "CompanionNotificationIntent_id_ownerId_key"
    ON "CompanionNotificationIntent"("id", "ownerId");
CREATE INDEX "CompanionNotificationIntent_ownerId_createdAt_idx"
    ON "CompanionNotificationIntent"("ownerId", "createdAt");
CREATE INDEX "CompanionNotificationIntent_expiresAt_idx" ON "CompanionNotificationIntent"("expiresAt");

CREATE TABLE "CompanionNotificationDelivery" (
    "id" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "channel" "CompanionNotificationChannel" NOT NULL,
    "destinationId" TEXT NOT NULL,
    "status" "CompanionNotificationDeliveryStatus" NOT NULL DEFAULT 'queued',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "claimId" TEXT,
    "claimExpiresAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanionNotificationDelivery_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CompanionNotificationDelivery_intentId_ownerId_fkey"
        FOREIGN KEY ("intentId", "ownerId") REFERENCES "CompanionNotificationIntent"("id", "ownerId")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanionNotificationDelivery_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CompanionNotificationDelivery_intentId_channel_destinationId_key"
    ON "CompanionNotificationDelivery"("intentId", "channel", "destinationId");
CREATE INDEX "CompanionNotificationDelivery_status_claimExpiresAt_nextAttemptAt_createdAt_idx"
    ON "CompanionNotificationDelivery"("status", "claimExpiresAt", "nextAttemptAt", "createdAt");
CREATE INDEX "CompanionNotificationDelivery_ownerId_createdAt_idx"
    ON "CompanionNotificationDelivery"("ownerId", "createdAt");

CREATE TABLE "CompanionNotificationDailyBudget" (
    "ownerId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CompanionNotificationDailyBudget_pkey" PRIMARY KEY ("ownerId", "day"),
    CONSTRAINT "CompanionNotificationDailyBudget_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

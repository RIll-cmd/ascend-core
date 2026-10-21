-- Additive migration for the owner/device latest-context record.
-- Existing deployments must retain their current bootstrap schema before applying this.
CREATE TABLE IF NOT EXISTS "CompanionContextRecord" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "bootId" TEXT NOT NULL,
    "bootStartedAt" TIMESTAMP(3) NOT NULL,
    "snapshotRevision" INTEGER NOT NULL,
    "sourceSequencesJson" TEXT NOT NULL,
    "snapshotJson" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "leaseExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CompanionContextRecord_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CompanionContextRecord_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CompanionContextRecord_ownerId_deviceId_key"
    ON "CompanionContextRecord"("ownerId", "deviceId");

CREATE INDEX IF NOT EXISTS "CompanionContextRecord_leaseExpiresAt_idx"
    ON "CompanionContextRecord"("leaseExpiresAt");

-- Bounded voice bytes exist only while the queue item is active. Application
-- transitions clear these fields on completion, cancellation, expiry, or revoke.
ALTER TABLE "PhoneChatJob" ADD COLUMN IF NOT EXISTS "audioData" BYTEA;
ALTER TABLE "PhoneChatJob" ADD COLUMN IF NOT EXISTS "audioMimeType" TEXT;

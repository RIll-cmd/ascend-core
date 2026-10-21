-- Additive B4 browser task persistence. Existing phone chat tables and rows are untouched.
DO $$ BEGIN
    CREATE TYPE "BrowserRemoteChannel" AS ENUM ('phone_pwa', 'discord_dm');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "BrowserRemoteTaskState" AS ENUM
        ('queued', 'claimed', 'running', 'paused', 'waiting_for_user', 'stopping',
         'completed', 'partial', 'failed', 'unknown', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "PhoneDiscordLink"
    ADD COLUMN IF NOT EXISTS "generation" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS "BrowserLaptop" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "currentBootId" TEXT,
    "lastHeartbeatAt" TIMESTAMP(3),
    "availability" TEXT NOT NULL DEFAULT 'offline',
    "descriptorJson" TEXT NOT NULL DEFAULT '{}',
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BrowserLaptop_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrowserLaptop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "BrowserLaptop_ownerId_revokedAt_idx" ON "BrowserLaptop"("ownerId", "revokedAt");

CREATE TABLE IF NOT EXISTS "BrowserRemoteSession" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "channel" "BrowserRemoteChannel" NOT NULL,
    "sourceDeviceId" TEXT,
    "sourceDiscordLinkId" TEXT,
    "discordGeneration" INTEGER,
    "parentSessionId" TEXT,
    "providerConsent" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrowserRemoteSession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrowserRemoteSession_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserRemoteSession_sourceDeviceId_fkey" FOREIGN KEY ("sourceDeviceId") REFERENCES "PhoneChatDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserRemoteSession_sourceDiscordLinkId_fkey" FOREIGN KEY ("sourceDiscordLinkId") REFERENCES "PhoneDiscordLink"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserRemoteSession_source_binding_check" CHECK (
        ("channel" = 'phone_pwa' AND "sourceDeviceId" IS NOT NULL AND "sourceDiscordLinkId" IS NULL AND "discordGeneration" IS NULL)
        OR ("channel" = 'discord_dm' AND "sourceDeviceId" IS NULL AND "sourceDiscordLinkId" IS NOT NULL AND "discordGeneration" IS NOT NULL)
    ),
    CONSTRAINT "BrowserRemoteSession_expiry_check" CHECK ("expiresAt" > "createdAt")
);
CREATE INDEX IF NOT EXISTS "BrowserRemoteSession_ownerId_channel_expiresAt_endedAt_idx"
    ON "BrowserRemoteSession"("ownerId", "channel", "expiresAt", "endedAt");
CREATE INDEX IF NOT EXISTS "BrowserRemoteSession_sourceDeviceId_expiresAt_idx"
    ON "BrowserRemoteSession"("sourceDeviceId", "expiresAt");
CREATE INDEX IF NOT EXISTS "BrowserRemoteSession_sourceDiscordLinkId_discordGeneration_expiresAt_idx"
    ON "BrowserRemoteSession"("sourceDiscordLinkId", "discordGeneration", "expiresAt");

CREATE TABLE IF NOT EXISTS "BrowserRemoteSessionLaptop" (
    "sessionId" TEXT NOT NULL,
    "laptopId" TEXT NOT NULL,
    CONSTRAINT "BrowserRemoteSessionLaptop_pkey" PRIMARY KEY ("sessionId", "laptopId"),
    CONSTRAINT "BrowserRemoteSessionLaptop_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BrowserRemoteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserRemoteSessionLaptop_laptopId_fkey" FOREIGN KEY ("laptopId") REFERENCES "BrowserLaptop"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BrowserTask" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "laptopId" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "scopeVersion" INTEGER NOT NULL,
    "goal" TEXT,
    "state" "BrowserRemoteTaskState" NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queueExpiresAt" TIMESTAMP(3) NOT NULL,
    "activeExpiresAt" TIMESTAMP(3),
    "claimTokenHash" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "prestartAttempts" INTEGER NOT NULL DEFAULT 0,
    "fence" INTEGER NOT NULL DEFAULT 0,
    "brokerBootId" TEXT,
    "startedAt" TIMESTAMP(3),
    "cancelRequested" BOOLEAN NOT NULL DEFAULT FALSE,
    "requestedControl" TEXT,
    "currentProposalId" TEXT,
    "eventCursor" INTEGER NOT NULL DEFAULT 0,
    "resultJson" TEXT,
    "terminalReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    CONSTRAINT "BrowserTask_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrowserTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BrowserRemoteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserTask_laptopId_fkey" FOREIGN KEY ("laptopId") REFERENCES "BrowserLaptop"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserTask_bounds_check" CHECK ("scopeVersion" > 0 AND "prestartAttempts" >= 0 AND "fence" >= 0 AND "eventCursor" >= 0)
);
CREATE INDEX IF NOT EXISTS "BrowserTask_laptopId_state_queueExpiresAt_createdAt_idx"
    ON "BrowserTask"("laptopId", "state", "queueExpiresAt", "createdAt");
CREATE INDEX IF NOT EXISTS "BrowserTask_ownerId_sessionId_createdAt_idx" ON "BrowserTask"("ownerId", "sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "BrowserTask_state_leaseExpiresAt_idx" ON "BrowserTask"("state", "leaseExpiresAt");
CREATE INDEX IF NOT EXISTS "BrowserTask_completedAt_idx" ON "BrowserTask"("completedAt");

CREATE TABLE IF NOT EXISTS "BrowserTaskEvent" (
    "taskId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "summary" TEXT,
    "proposalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrowserTaskEvent_pkey" PRIMARY KEY ("taskId", "sequence"),
    CONSTRAINT "BrowserTaskEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BrowserTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserTaskEvent_bounds_check" CHECK ("sequence" > 0 AND length("eventType") <= 64 AND ("summary" IS NULL OR length("summary") <= 8192))
);
CREATE INDEX IF NOT EXISTS "BrowserTaskEvent_createdAt_idx" ON "BrowserTaskEvent"("createdAt");

CREATE TABLE IF NOT EXISTS "BrowserTaskReconciliation" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "previousBrokerBootId" TEXT NOT NULL,
    "fence" INTEGER NOT NULL,
    "actionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "proposalDigest" TEXT,
    "outcome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrowserTaskReconciliation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrowserTaskReconciliation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BrowserTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserTaskReconciliation_taskId_actionId_key" UNIQUE ("taskId", "actionId"),
    CONSTRAINT "BrowserTaskReconciliation_bounds_check" CHECK (
        "fence" > 0 AND length("actionId") BETWEEN 1 AND 128 AND length("action") BETWEEN 1 AND 64
        AND "action" ~ '^[a-z][a-z0-9_]*$'
        AND ("proposalDigest" IS NULL OR "proposalDigest" ~ '^[a-f0-9]{64}$')
        AND "outcome" IN ('not_attempted', 'attempted', 'unknown')
    )
);
CREATE INDEX IF NOT EXISTS "BrowserTaskReconciliation_taskId_createdAt_idx"
    ON "BrowserTaskReconciliation"("taskId", "createdAt");

CREATE TABLE IF NOT EXISTS "BrowserActionReview" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "proposalJson" TEXT,
    "proposalDigest" TEXT NOT NULL,
    "laptopId" TEXT NOT NULL,
    "brokerBootId" TEXT NOT NULL,
    "fence" INTEGER NOT NULL,
    "decision" TEXT,
    "decidedByOwnerId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "permitConsumedAt" TIMESTAMP(3),
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrowserActionReview_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrowserActionReview_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BrowserTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserActionReview_decidedByOwnerId_fkey" FOREIGN KEY ("decidedByOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BrowserActionReview_taskId_actionId_key" UNIQUE ("taskId", "actionId"),
    CONSTRAINT "BrowserActionReview_fence_check" CHECK ("fence" >= 0),
    CONSTRAINT "BrowserActionReview_proposalDigest_check" CHECK (length("proposalDigest") = 64)
);
CREATE INDEX IF NOT EXISTS "BrowserActionReview_taskId_expiresAt_idx" ON "BrowserActionReview"("taskId", "expiresAt");
CREATE INDEX IF NOT EXISTS "BrowserActionReview_expiresAt_idx" ON "BrowserActionReview"("expiresAt");

CREATE TABLE IF NOT EXISTS "BrowserReviewAccess" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sourceSessionId" TEXT NOT NULL,
    "discordGeneration" INTEGER NOT NULL,
    "reviewerDeviceId" TEXT,
    "reviewerSessionId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrowserReviewAccess_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrowserReviewAccess_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BrowserTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserReviewAccess_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserReviewAccess_sourceSessionId_fkey" FOREIGN KEY ("sourceSessionId") REFERENCES "BrowserRemoteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrowserReviewAccess_tokenHash_key" UNIQUE ("tokenHash")
);
CREATE INDEX IF NOT EXISTS "BrowserReviewAccess_taskId_expiresAt_idx" ON "BrowserReviewAccess"("taskId", "expiresAt");
CREATE INDEX IF NOT EXISTS "BrowserReviewAccess_ownerId_expiresAt_idx" ON "BrowserReviewAccess"("ownerId", "expiresAt");

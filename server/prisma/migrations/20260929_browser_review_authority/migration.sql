-- Additive B4 review binding and durable, content-free dispatch replay ledger.
ALTER TABLE "BrowserTask" ADD COLUMN IF NOT EXISTS "waitingForUserType" TEXT;
ALTER TABLE "BrowserTask" ADD COLUMN IF NOT EXISTS "scopeDescriptorJson" TEXT;
ALTER TABLE "BrowserActionReview" ADD COLUMN IF NOT EXISTS "reviewerDeviceId" TEXT;
ALTER TABLE "BrowserActionReview" ADD COLUMN IF NOT EXISTS "reviewerSessionId" TEXT;
CREATE TABLE IF NOT EXISTS "BrowserDispatchAttempt" (
    "taskId" TEXT NOT NULL REFERENCES "BrowserTask"("id") ON DELETE CASCADE,
    "attemptId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "proposalDigest" TEXT,
    "fence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("taskId", "attemptId")
);

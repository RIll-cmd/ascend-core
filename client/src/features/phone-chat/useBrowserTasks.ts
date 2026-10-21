"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { PhoneChatApi, PhoneChatApiError } from "./api";
import {
  clearBrowserTaskContent,
  pendingBrowserSessionEnds,
  removePendingBrowserSessionEnd,
  queueBrowserSessionEnd,
} from "./browserTaskStorage";
import type { BrowserActionReviewData, BrowserAvailability, BrowserTaskView } from "./types";
import { validBrowserReview } from "./BrowserActionReview";

const api = new PhoneChatApi();
const SESSION_KEY = "ascend.browser-tasks.session.v1";
const PROVIDER_KEY = "ascend.browser-tasks.provider.v1";
const TASK_KEY = "ascend.browser-tasks.active-task.v1";

function sessionStorageOrNull(reviewOnly = false): Storage | null {
  if (reviewOnly) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function uuid(): string {
  return globalThis.crypto.randomUUID();
}

function errorText(error: unknown): string {
  if (error instanceof PhoneChatApiError) {
    if (error.status === 401 || error.status === 403)
      return "Your phone link is no longer authorized. Reconnect it, then try again.";
    if (error.status === 404 || error.status === 410)
      return "This browser session or task has expired. Start a new Browser session.";
    if (error.status === 409)
      return "Core rejected a stale or conflicting browser request. Refresh task status before retrying.";
    if (error.status === 429)
      return "Too many browser requests. Wait a moment and retry.";
  }
  return "Vision could not reach the browser task service. Your task ID is kept for a safe retry.";
}

export function useBrowserTasks(
  deviceId: string | null,
  parentSessionId: string,
  reviewOnly = false
) {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const [availability, setAvailability] = useState<BrowserAvailability | null>(
    null
  );
  const [task, setTask] = useState<BrowserTaskView | null>(null);
  const [browserSessionId, setBrowserSessionId] = useState<string | null>(null);
  const [consentedProvider, setConsentedProvider] = useState<string | null>(
    null
  );
  const [goal, setGoal] = useState("");
  const [providerConsent, setProviderConsent] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [selectedScope, setSelectedScope] = useState("public_research");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingTaskId = useRef<string | null>(null);
  const authorityEpoch = useRef(0);
  const pendingIntent = useRef<{
    taskId: string;
    goal: string;
    provider: string;
    scopeId: string;
    scopeVersion: number;
  } | null>(null);

  useEffect(() => {
    authorityEpoch.current += 1;
    pendingTaskId.current = null;
    pendingIntent.current = null;
    setTask(null);
    setBrowserSessionId(null);
    setConsentedProvider(null);
    setGoal("");
    setProviderConsent(false);
    setBusy(false);
    setError(null);
    if (!authenticated || !deviceId) {
      const storage = sessionStorageOrNull(reviewOnly);
      storage?.removeItem(SESSION_KEY);
      storage?.removeItem(PROVIDER_KEY);
      storage?.removeItem(TASK_KEY);
      pendingTaskId.current = null;
      pendingIntent.current = null;
      setAvailability(null);
      setTask(null);
      setBrowserSessionId(null);
      setConsentedProvider(null);
      setGoal("");
      setProviderConsent(false);
      setBusy(false);
      setError(null);
      return;
    }
    const storage = sessionStorageOrNull(reviewOnly);
    let cancelled = false;
    const retryPendingEnds = async () => {
      if (!storage) return;
      for (const pendingSessionId of pendingBrowserSessionEnds(storage)) {
        if (cancelled) return;
        try {
          await api.endBrowserSession(deviceId, pendingSessionId);
          removePendingBrowserSessionEnd(storage, pendingSessionId);
        } catch {
          return;
        }
      }
    };
    if (pendingBrowserSessionEnds(storage).length) void retryPendingEnds();
    window.addEventListener("online", retryPendingEnds);
    window.addEventListener("focus", retryPendingEnds);
    const savedSession = storage?.getItem(SESSION_KEY) ?? null;
    const savedProvider = storage?.getItem(PROVIDER_KEY) ?? null;
    const savedTask = storage?.getItem(TASK_KEY) ?? null;
    if (savedSession && /^[0-9a-f-]{36}$/i.test(savedSession))
      setBrowserSessionId(savedSession);
    if (savedProvider && /^[a-z]{3,24}$/.test(savedProvider))
      setConsentedProvider(savedProvider);
    if (savedTask && /^[0-9a-f-]{36}$/i.test(savedTask))
      pendingTaskId.current = savedTask;
    void api
      .getBrowserAvailability(deviceId)
      .then((value) => {
        if (!cancelled) {
          setAvailability(value);
          if (value.provider) setSelectedProvider(value.provider);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(errorText(caught));
      });
    return () => {
      authorityEpoch.current += 1;
      cancelled = true;
      window.removeEventListener("online", retryPendingEnds);
      window.removeEventListener("focus", retryPendingEnds);
    };
  }, [authenticated, deviceId, parentSessionId, reviewOnly]);

  const refreshTask = useCallback(async () => {
    if (
      !deviceId ||
      !browserSessionId ||
      !pendingTaskId.current ||
      document.visibilityState === "hidden"
    )
      return;
    try {
      const epoch = authorityEpoch.current;
      const taskId = pendingTaskId.current;
      const value = await api.getBrowserTask(
        pendingTaskId.current,
        deviceId,
        browserSessionId,
        task?.cursor ?? 0
      );
      if (epoch !== authorityEpoch.current || taskId !== pendingTaskId.current
        || !useAuthStore.getState().isAuthenticated) return;
      setTask((previous) => ({ ...value, events: value.resetRequired || previous?.taskId !== value.taskId
        ? value.events
        : [...new Map([...previous.events, ...value.events].map((event) => [event.sequence, event])).values()].slice(-200) }));
      setError(null);
    } catch (caught) {
      if (caught instanceof PhoneChatApiError && [401, 403, 404, 410].includes(caught.status)) setTask(null);
      setError(errorText(caught));
    }
  }, [browserSessionId, deviceId, task?.cursor]);

  useEffect(() => {
    if (!browserSessionId || !pendingTaskId.current) return;
    void refreshTask();
    const poll = () => {
      if (document.visibilityState === "visible") void refreshTask();
    };
    const timer = window.setInterval(poll, 2_000);
    window.addEventListener("focus", poll);
    document.addEventListener("visibilitychange", poll);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", poll);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [browserSessionId, refreshTask]);

  const start = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = goal.trim();
      const provider = selectedProvider;
      const scope = availability?.scopes.find((item) => item.scopeId === selectedScope);
      if (
        !deviceId ||
        !availability ||
        !provider ||
        !availability.laptopId ||
        !text ||
        !providerConsent || !scope || reviewOnly
      )
        return;
      if (task) return;
      if (busy || !useAuthStore.getState().isAuthenticated) return;
      const epoch = authorityEpoch.current;
      if (
        pendingIntent.current &&
        (pendingIntent.current.goal !== text ||
          pendingIntent.current.provider !== provider || pendingIntent.current.scopeId !== scope.scopeId
          || pendingIntent.current.scopeVersion !== scope.version)
      ) {
        setError(
          "A previous send is unconfirmed. Retry the same goal or end this Browser session first."
        );
        return;
      }
      setBusy(true);
      setError(null);
      try {
        let activeSession = browserSessionId;
        if (activeSession && consentedProvider !== provider) {
          await api.endBrowserSession(deviceId, activeSession);
          if (epoch !== authorityEpoch.current || !useAuthStore.getState().isAuthenticated) return;
          sessionStorageOrNull(reviewOnly)?.removeItem(SESSION_KEY);
          sessionStorageOrNull(reviewOnly)?.removeItem(PROVIDER_KEY);
          activeSession = null;
          setBrowserSessionId(null);
          setConsentedProvider(null);
        }
        if (!activeSession) {
          const created = await api.createBrowserSession({
            deviceId,
            parentSessionId: parentSessionId || null,
            providerConsent: provider,
          });
          activeSession = created.browserSessionId;
          if (epoch !== authorityEpoch.current || !useAuthStore.getState().isAuthenticated) {
            queueBrowserSessionEnd(sessionStorageOrNull(), activeSession);
            return;
          }
          sessionStorageOrNull(reviewOnly)?.setItem(SESSION_KEY, activeSession);
          sessionStorageOrNull(reviewOnly)?.setItem(PROVIDER_KEY, provider);
          setBrowserSessionId(activeSession);
          setConsentedProvider(provider);
        }
        const taskId =
          pendingIntent.current?.taskId ?? pendingTaskId.current ?? uuid();
        pendingIntent.current = { taskId, goal: text, provider, scopeId: scope.scopeId, scopeVersion: scope.version };
        pendingTaskId.current = taskId;
        sessionStorageOrNull(reviewOnly)?.setItem(TASK_KEY, taskId);
        await api.enqueueBrowserTask(
          {
            taskId,
            browserSessionId: activeSession,
            laptopId: availability.laptopId,
            goal: text,
            scopeId: scope.scopeId,
            scopeVersion: scope.version,
          },
          deviceId
        );
        if (epoch !== authorityEpoch.current || !useAuthStore.getState().isAuthenticated) return;
        setGoal("");
        setProviderConsent(false);
        setError(null);
        const value = await api.getBrowserTask(taskId, deviceId, activeSession);
        if (epoch !== authorityEpoch.current || !useAuthStore.getState().isAuthenticated) return;
        setTask(value);
      } catch (caught) {
        if (epoch === authorityEpoch.current && useAuthStore.getState().isAuthenticated) setError(errorText(caught));
      } finally {
        setBusy(false);
      }
    },
    [
      availability,
      busy,
      browserSessionId,
      consentedProvider,
      deviceId,
      goal,
      parentSessionId,
      providerConsent,
      refreshTask,
      selectedProvider,
      selectedScope,
      reviewOnly,
    ]
  );

  const control = useCallback(
    async (command: "pause" | "resume" | "stop") => {
      if (!deviceId || !browserSessionId || !task) return;
      setBusy(true);
      try {
        await api.controlBrowserTask(
          task.taskId,
          deviceId,
          browserSessionId,
          command
        );
        await refreshTask();
        setError(null);
      } catch (caught) {
        setError(errorText(caught));
      } finally {
        setBusy(false);
      }
    },
    [browserSessionId, deviceId, refreshTask, task]
  );

  const dismiss = useCallback(async () => {
    if (
      !deviceId ||
      !browserSessionId ||
      !task ||
      ![
        "completed",
        "partial",
        "failed",
        "unknown",
        "cancelled",
        "expired",
      ].includes(task.status)
    )
      return;
    setBusy(true);
    try {
      await api.acknowledgeBrowserTask(task.taskId, deviceId, browserSessionId);
      pendingTaskId.current = null;
      pendingIntent.current = null;
      sessionStorageOrNull(reviewOnly)?.removeItem(TASK_KEY);
      setTask(null);
      setError(null);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(false);
    }
  }, [browserSessionId, deviceId, task, reviewOnly]);

  const endSession = useCallback(async () => {
    if (!browserSessionId || !deviceId) return;
    setBusy(true);
    try {
      await api.endBrowserSession(deviceId, browserSessionId);
      sessionStorageOrNull(reviewOnly)?.removeItem(SESSION_KEY);
      sessionStorageOrNull(reviewOnly)?.removeItem(PROVIDER_KEY);
      sessionStorageOrNull(reviewOnly)?.removeItem(TASK_KEY);
      pendingTaskId.current = null;
      pendingIntent.current = null;
      setBrowserSessionId(null);
      setConsentedProvider(null);
      setTask(null);
      setError(null);
    } catch (caught) {
      if (
        caught instanceof PhoneChatApiError &&
        [404, 410].includes(caught.status)
      ) {
        const storage = sessionStorageOrNull(reviewOnly);
        storage?.removeItem(SESSION_KEY);
        storage?.removeItem(PROVIDER_KEY);
        storage?.removeItem(TASK_KEY);
        pendingTaskId.current = null;
        pendingIntent.current = null;
        setBrowserSessionId(null);
        setConsentedProvider(null);
        setTask(null);
        setError(null);
        return;
      }
      if (reviewOnly) queueBrowserSessionEnd(sessionStorageOrNull(), browserSessionId);
      else clearBrowserTaskContent(sessionStorageOrNull(), browserSessionId);
      pendingTaskId.current = null;
      pendingIntent.current = null;
      setBrowserSessionId(null);
      setConsentedProvider(null);
      setTask(null);
      setError(
        "Browser task content was cleared from this tab. Core has not confirmed the laptop stopped; the session-end request will retry when this phone reconnects."
      );
    } finally {
      setBusy(false);
    }
  }, [browserSessionId, deviceId, reviewOnly]);

  const decideReview = useCallback(async (review: BrowserActionReviewData, approved: boolean) => {
    const current = task && validBrowserReview(task);
    if (!deviceId || !browserSessionId || !current || current.proposal.digest !== review.proposal.digest
      || current.proposal.action_id !== review.proposal.action_id || current.fence !== review.fence
      || current.brokerBootId !== review.brokerBootId) return;
    setBusy(true);
    setTask((previous) => previous ? { ...previous, review: null } : previous);
    try {
      await api.decideBrowserReview(task!.taskId, review.proposal.action_id, review.proposal.digest,
        approved, deviceId, browserSessionId);
      await refreshTask();
      setError(null);
    } catch (caught) { setError(errorText(caught)); }
    finally { setBusy(false); }
  }, [browserSessionId, deviceId, refreshTask, task]);

  const openSharedTask = useCallback(async (token: string) => {
    if (!reviewOnly || !deviceId || !availability?.provider || !providerConsent || busy || task) return;
    setBusy(true);
    const epoch = authorityEpoch.current;
    try {
      const session = await api.createBrowserSession({ deviceId, parentSessionId: parentSessionId || null,
        providerConsent: availability.provider });
      if (epoch !== authorityEpoch.current || !useAuthStore.getState().isAuthenticated) return;
      setBrowserSessionId(session.browserSessionId);
      setConsentedProvider(availability.provider);
      const grant = await api.consumeBrowserReviewAccess(deviceId, session.browserSessionId, token);
      if (epoch !== authorityEpoch.current || !useAuthStore.getState().isAuthenticated) return;
      pendingTaskId.current = grant.taskId;
      const shared = await api.getBrowserTask(grant.taskId, deviceId, session.browserSessionId);
      if (epoch !== authorityEpoch.current || !useAuthStore.getState().isAuthenticated) return;
      setTask(shared);
      setError(null);
    } catch (caught) { setError(errorText(caught)); }
    finally { setBusy(false); }
  }, [availability, busy, deviceId, parentSessionId, providerConsent, reviewOnly, task]);

  return {
    deviceId,
    availability,
    task,
    browserSessionId,
    consentedProvider,
    goal,
    setGoal,
    selectedProvider,
    setSelectedProvider,
    selectedScope,
    setSelectedScope,
    providerConsent,
    setProviderConsent,
    busy,
    error,
    setError,
    start,
    control,
    dismiss,
    endSession,
    refreshTask,
    decideReview,
    openSharedTask,
  };
}

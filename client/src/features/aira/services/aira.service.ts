import { API_BASE_URL } from "@/constants";
import { AIRAChatResponse, AIRADefeatResponse, AIRADailyReportResponse, AIRAPendingAction, AIRASystemStatusResponse } from "../types";

/**
 * Sends a chat prompt to AIRA via POST /api/aira/chat
 */
export async function sendAiraChat(
  prompt: string,
  characterId: string = "char-id-123"
): Promise<AIRAChatResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/aira/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, characterId }),
    });

    if (!res.ok) {
      console.warn(`[aira.service] Failed to send chat: ${res.statusText}`);
      return null;
    }

    return (await res.json()) as AIRAChatResponse;
  } catch (error) {
    console.error("[aira.service] Error sending chat to AIRA:", error);
    return null;
  }
}

/**
 * Sends battle logs to AIRA for defeat diagnosis via POST /api/aira/diagnose-defeat
 */
export async function diagnoseTowerDefeat(
  battleLogs: string[],
  characterId: string = "char-id-123",
  floorNumber: number = 1
): Promise<AIRADefeatResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/aira/diagnose-defeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ battleLogs, characterId, floorNumber }),
    });

    if (!res.ok) {
      console.warn(`[aira.service] Failed to diagnose defeat: ${res.statusText}`);
      return null;
    }

    return (await res.json()) as AIRADefeatResponse;
  } catch (error) {
    console.error("[aira.service] Error diagnosing defeat:", error);
    return null;
  }
}

/**
 * Fetches AIRA's morning briefing report via GET /api/aira/daily-report/{character_id}
 */
export async function fetchDailyReport(
  characterId: string
): Promise<AIRADailyReportResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/aira/daily-report/${characterId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[aira.service] Failed to fetch daily report: ${res.statusText}`);
      return null;
    }

    return (await res.json()) as AIRADailyReportResponse;
  } catch (error) {
    console.error("[aira.service] Error fetching daily report:", error);
    return null;
  }
}

/**
 * Executes a pending action via POST /api/aira/execute
 */
export async function executeAiraAction(
  pendingAction: AIRAPendingAction,
  characterId: string = "char-id-123"
): Promise<{ success: boolean; message?: string; result?: Record<string, unknown>; idempotentReplay?: boolean } | null> {
  try {
    const isSignedPreview = Boolean(
      pendingAction.operation && pendingAction.requestId && pendingAction.confirmationToken
    );
    const res = await fetch(`${API_BASE_URL}${isSignedPreview ? "/api/aira/operations/execute" : "/api/aira/execute"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isSignedPreview ? {
        characterId,
        requestId: pendingAction.requestId,
        operation: pendingAction.operation,
        confirmationToken: pendingAction.confirmationToken,
      } : {
        action_type: pendingAction.action_type,
        action_args: pendingAction.action_args,
        characterId,
      }),
    });

    if (!res.ok) {
      console.warn(`[aira.service] Failed to execute action: ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("[aira.service] Error executing action:", error);
    return null;
  }
}

/**
 * Fetches AIRA's proactive system status via GET /api/aira/status/{character_id}
 */
export async function fetchSystemStatus(
  characterId: string
): Promise<AIRASystemStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/aira/status/${characterId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[aira.service] Failed to fetch system status: ${res.statusText}`);
      return null;
    }

    return (await res.json()) as AIRASystemStatusResponse;
  } catch (error) {
    console.error("[aira.service] Error fetching system status:", error);
    return null;
  }
}

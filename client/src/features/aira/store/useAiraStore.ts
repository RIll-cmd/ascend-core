import { create } from "zustand";
import { toast } from "sonner";
import { AIRAMessage, AIRAPendingAction } from "../types";
import { sendAiraChat, diagnoseTowerDefeat, fetchDailyReport, executeAiraAction } from "../services";
import { playNoticeSound, playUnderstoodSound, playSuccessfulSound } from "@/features/audio/useSystemAudio";

export interface PeriodicToast {
  id: string;
  text: string;
  category: string;
}

export interface AiraStore {
  messages: AIRAMessage[];
  currentMood: string;
  dailyReport: string | null;
  isLoading: boolean;
  activeInsight: string | null;
  autoBriefingsEnabled: boolean;
  activePeriodicToast: PeriodicToast | null;
  toggleAutoBriefings: () => void;
  showPeriodicToast: (text: string, category: string, mood?: string) => void;
  dismissPeriodicToast: () => void;
  loadDailyReport: (characterId?: string) => Promise<void>;
  sendPrompt: (prompt: string, characterId?: string) => Promise<void>;
  diagnoseDefeat: (
    battleLogs: string[],
    characterId?: string,
    floorNumber?: number
  ) => Promise<string | null>;
  confirmAction: (messageId: string, characterId?: string) => Promise<void>;
  cancelAction: (messageId: string) => void;
  clearMessages: () => void;
}

const DEFAULT_CHARACTER_ID = "char-id-123";

const INITIAL_WELCOME_MESSAGE: AIRAMessage = {
  id: "msg-welcome-0",
  sender: "aira",
  text: "<< Notice. >> AIRA system online. Resonance calculation at 100% accuracy. State your query or request Master, I am prepared to calculate your optimal Attribute Enhancement trajectory.",
  timestamp: new Date(),
  type: "notice",
};

export const useAiraStore = create<AiraStore>((set, get) => ({
  messages: [INITIAL_WELCOME_MESSAGE],
  currentMood: "NEUTRAL",
  dailyReport: null,
  isLoading: false,
  activeInsight: null,
  autoBriefingsEnabled: true,
  activePeriodicToast: null,

  toggleAutoBriefings: () => {
    set((state) => {
      const next = !state.autoBriefingsEnabled;
      toast.info(`AIRA Auto-Briefings ${next ? "ACTIVE" : "PAUSED"}`);
      return { autoBriefingsEnabled: next, activePeriodicToast: null };
    });
  },

  showPeriodicToast: (text: string, category: string, mood?: string) => {
    set({
      activePeriodicToast: {
        id: `toast-${Date.now()}`,
        text,
        category,
      },
      currentMood: mood || "NEUTRAL",
    });
  },

  dismissPeriodicToast: () => {
    set({ activePeriodicToast: null });
  },

  loadDailyReport: async (characterId?: string) => {
    const targetId = characterId || DEFAULT_CHARACTER_ID;
    set({ isLoading: true });
    try {
      const res = await fetchDailyReport(targetId);
      if (res && res.report) {
        set({
          dailyReport: res.report,
          activeInsight: res.report,
          isLoading: false,
        });
        playNoticeSound();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("[useAiraStore] Error loading daily report:", error);
      set({ isLoading: false });
    }
  },

  sendPrompt: async (prompt: string, characterId?: string) => {
    if (!prompt.trim()) return;
    const targetId = characterId || DEFAULT_CHARACTER_ID;

    const userMsg: AIRAMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }));

    try {
      const res = await sendAiraChat(prompt, targetId);
      const airaText =
        res?.response ||
        "<< Answer. >> Analysis complete with 100% calculation accuracy. Master's query has been registered for Skill Acquisition optimization.";

      const airaMsg: AIRAMessage = {
        id: `msg-aira-${Date.now()}`,
        sender: "aira",
        text: airaText,
        timestamp: new Date(),
        type: res?.pending_action 
          ? "notice" 
          : airaText.includes("<< Report. >>")
          ? "report"
          : airaText.includes("<< Notice. >>")
          ? "notice"
          : "answer",
        mood: res?.pending_action ? "ANALYZING" : "NEUTRAL",
        pendingAction: res?.pending_action,
      };

      set((state) => ({
        messages: [...state.messages, airaMsg],
        currentMood: res?.pending_action ? "ANALYZING" : "NEUTRAL",
        activeInsight: airaText,
        isLoading: false,
      }));

      // Play AIRA voice audio cue
      playNoticeSound();
    } catch (error) {
      console.error("[useAiraStore] Error sending prompt:", error);
      set({ isLoading: false });
    }
  },

  diagnoseDefeat: async (
    battleLogs: string[],
    characterId?: string,
    floorNumber: number = 1
  ) => {
    const targetId = characterId || DEFAULT_CHARACTER_ID;
    set({ isLoading: true });
    try {
      const res = await diagnoseTowerDefeat(battleLogs, targetId, floorNumber);
      const diagnosisText =
        res?.diagnosis ||
        `<< Report. >> Defeat on Floor ${floorNumber} analyzed. Calculation indicates a deficit in Recovery attributes. Recommend 3 days of Sleep & Restoration routines.`;

      const airaMsg: AIRAMessage = {
        id: `msg-defeat-${Date.now()}`,
        sender: "aira",
        text: diagnosisText,
        timestamp: new Date(),
        type: "report",
        mood: "WARNING",
      };

      set((state) => ({
        messages: [...state.messages, airaMsg],
        currentMood: "WARNING",
        activeInsight: diagnosisText,
        isLoading: false,
      }));

      playNoticeSound();
      return diagnosisText;
    } catch (error) {
      console.error("[useAiraStore] Error diagnosing defeat:", error);
      set({ isLoading: false });
      return null;
    }
  },

  confirmAction: async (messageId: string, characterId?: string) => {
    const state = get();
    const msgIndex = state.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;
    const msg = state.messages[msgIndex];
    if (!msg.pendingAction) return;

    set({ isLoading: true });
    try {
      const result = await executeAiraAction(msg.pendingAction, characterId || DEFAULT_CHARACTER_ID);
      
      if (result && result.success) {
        // Remove pending action and append success msg
        const updatedMsg = { ...msg };
        delete updatedMsg.pendingAction;
        
        const newMessages = [...state.messages];
        newMessages[msgIndex] = updatedMsg;
        
        const successMsg: AIRAMessage = {
          id: `msg-success-${Date.now()}`,
          sender: "aira",
          text: `<< Notice. >> ${result.idempotentReplay ? "Existing execution restored." : "Execution successful."} ${result.message || "Core operation completed."}`,
          timestamp: new Date(),
          type: "notice",
          mood: "SUCCESS"
        };
        
        newMessages.push(successMsg);
        
        set({
          messages: newMessages,
          currentMood: "SUCCESS",
          isLoading: false
        });
        
        playSuccessfulSound();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("[useAiraStore] Error confirming action:", error);
      set({ isLoading: false });
    }
  },

  cancelAction: (messageId: string) => {
    const state = get();
    const msgIndex = state.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;
    
    const updatedMsg = { ...state.messages[msgIndex] };
    delete updatedMsg.pendingAction;
    
    const newMessages = [...state.messages];
    newMessages[msgIndex] = updatedMsg;
    
    set({ messages: newMessages, currentMood: "DISAPPOINTED" });
  },

  clearMessages: () => {
    set({ messages: [INITIAL_WELCOME_MESSAGE], currentMood: "NEUTRAL" });
  },
}));

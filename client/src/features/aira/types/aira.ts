export type AIRAMessageType = "notice" | "report" | "answer" | "chat";

export interface AIRAScheduleEntry {
  title?: string;
  time?: string;
  schedule_type?: string;
  scheduleType?: string;
  day_of_week?: number;
  dayOfWeek?: number;
  scheduled_at?: string;
  scheduledAt?: string;
}

export interface AIRAPendingAction {
  action_type: string;
  action_args: Record<string, any>;
  summary: string;
  operation?: string;
  requestId?: string;
  confirmationToken?: string;
  expiresAt?: string;
  warnings?: string[];
  /** For create_calendar_schedule_multi: individual per-day schedule slots */
  schedules?: AIRAScheduleEntry[];
}

export interface AIRAMessage {
  id: string;
  sender: "user" | "aira";
  text: string;
  timestamp: Date;
  type?: AIRAMessageType;
  mood?: string;
  pendingAction?: AIRAPendingAction;
}

export interface AIRAChatResponse {
  response: string;
  pending_action?: AIRAPendingAction;
}

export interface AIRADefeatResponse {
  diagnosis: string;
}

export interface AIRADailyReportResponse {
  report: string;
}

export interface AIRASystemStatusResponse {
  status: "warning" | "optimal";
  message: string;
}

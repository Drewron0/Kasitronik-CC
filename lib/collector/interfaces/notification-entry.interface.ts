export interface NotificationEntry {
  id?: string;
  channel: "push" | "email";
  kind: string;
  recipient: string;
  payload: unknown;
  status: "sent" | "failed";
  attempts: number;
  lastError: string | null;
}

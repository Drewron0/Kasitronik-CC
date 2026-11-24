import type { PushTarget } from "../../collector/interfaces/push-target.interface.ts";
import type { EmailMessage } from "./email-message.interface.ts";
import type { PushPayload } from "./push-payload.interface.ts";
import type { SendResult } from "./send-result.type.ts";

export interface Notifier {
  push(target: PushTarget, payload: PushPayload): Promise<SendResult>;
  email(message: EmailMessage): Promise<SendResult>;
}

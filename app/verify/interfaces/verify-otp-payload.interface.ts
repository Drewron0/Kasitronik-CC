export interface VerifyOtpPayload {
  email: string;
  token: string;
  type?: "signup" | "email" | "magiclink";
}

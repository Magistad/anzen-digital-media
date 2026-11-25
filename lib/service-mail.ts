import { readEnv } from "./env";
import { STUDIO_EMAIL } from "./studio";

export type ServiceMail = {
  to: string;
  subject: string;
  text: string;
};

export type MailResult = "sent" | "pending_configuration" | "failed";

/**
 * Customer mail uses Resend when SERVICE_MAIL_API_KEY is a real key.
 * A blank or placeholder key does not send. DNS for the from-address is not changed here.
 */
export async function sendServiceMail(message: ServiceMail): Promise<MailResult> {
  const key = readEnv("SERVICE_MAIL_API_KEY");
  if (!key || key.includes("REPLACE")) return "pending_configuration";
  const from = readEnv("SERVICE_MAIL_FROM") ?? `Anzen Digital Media <${STUDIO_EMAIL}>`;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        reply_to: STUDIO_EMAIL,
        subject: message.subject,
        text: message.text,
      }),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

/** Best-effort copy for the existing Netlify form notification. Failure does not block the order. */
export async function notifyServiceForm(fields: Record<string, string>): Promise<void> {
  const site = readEnv("URL") ?? readEnv("DEPLOY_PRIME_URL");
  if (!site) return;
  const body = new URLSearchParams({ "form-name": "service-order", ...fields });
  try {
    await fetch(site, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    // The order record is the source of truth. The form post is a notification only.
  }
}

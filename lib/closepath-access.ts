import { isCheckoutSessionId, isClosepathSession, isPaidClosepathDownload } from "./closepath-order";
import { getStripe } from "./stripe";

export type ClosepathAccess =
  | { state: "unconfigured" }
  | { state: "invalid" }
  | { state: "unpaid" }
  | { state: "paid"; email: string | null };

export async function closepathDownloadAccess(
  sessionId: string | undefined,
): Promise<ClosepathAccess> {
  if (!sessionId || !isCheckoutSessionId(sessionId)) return { state: "invalid" };

  const stripe = getStripe();
  if (!stripe) return { state: "unconfigured" };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    if (!isClosepathSession(session)) return { state: "invalid" };
    if (!isPaidClosepathDownload(session)) return { state: "unpaid" };
    return { state: "paid", email: session.customer_details?.email ?? null };
  } catch {
    return { state: "invalid" };
  }
}

import { findAccount } from "./closepath-account";
import { buildIcs, feedCalendarEvents } from "./closepath-calendar";

/** ICS for the signed-in book. Sample rows and closed files are left out. */
export async function closepathCalendarIcs(email: string): Promise<string | null> {
  const account = await findAccount(email);
  if (!account) return null;
  const parsed = Date.parse(account.updatedAt);
  const stamp = Number.isFinite(parsed) ? new Date(parsed) : new Date();
  return buildIcs(feedCalendarEvents(account.workspace.files), { calendarName: "Closepath", stamp });
}

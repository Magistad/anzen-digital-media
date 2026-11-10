import { createHash, randomBytes, timingSafeEqual } from "crypto";
import {
  dummyPasswordHash,
  hashPassword,
  verifyPassword,
} from "./closepath-auth";
import { normalizeStoredCustomerId, normalizeStoredSubscriptionId } from "./closepath-order";
import {
  type Workspace,
  emptyWorkspace,
  normalizeEmail,
  sanitizeWorkspace,
} from "./closepath-model";
import { getClosepathStore } from "./closepath-store";

/** 32 bytes, base64url, no padding. */
const FEED_TOKEN = /^[A-Za-z0-9_-]{43}$/;

const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60 * 1000;

export type ClosepathAccount = {
  email: string;
  passwordHash: string;
  stripeSessionId: string;
  /** Monthly subscription. Null on accounts opened before subscriptions. */
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  failedSignIns: number;
  lockedUntil: string | null;
  /** Secret for the private calendar feed. Null until the agent turns it on. */
  calendarFeedToken: string | null;
  workspace: Workspace;
};

function feedToken(value: unknown): string | null {
  return typeof value === "string" && FEED_TOKEN.test(value) ? value : null;
}

function feedIndex(token: string): string {
  return `calendar-feed:${createHash("sha256").update(token).digest("hex")}`;
}

function keyFor(email: string): string {
  return `account:${email}`;
}

function parseAccount(raw: string | null): ClosepathAccount | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as ClosepathAccount;
    if (!value || typeof value.email !== "string" || typeof value.passwordHash !== "string") return null;
    const workspace = sanitizeWorkspace(value.workspace) ?? emptyWorkspace();
    return {
      ...value,
      workspace,
      stripeSubscriptionId: normalizeStoredSubscriptionId(value.stripeSubscriptionId),
      stripeCustomerId: normalizeStoredCustomerId(value.stripeCustomerId),
      calendarFeedToken: feedToken(value.calendarFeedToken),
    };
  } catch {
    return null;
  }
}

export async function findAccount(email: string): Promise<ClosepathAccount | null> {
  const raw = await getClosepathStore().get(keyFor(email));
  return parseAccount(raw);
}

async function writeAccount(account: ClosepathAccount): Promise<void> {
  await getClosepathStore().set(keyFor(account.email), JSON.stringify(account));
}

export async function createAccount(input: {
  email: string;
  password: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
}): Promise<ClosepathAccount> {
  const now = new Date().toISOString();
  const account: ClosepathAccount = {
    email: input.email,
    passwordHash: await hashPassword(input.password),
    stripeSessionId: input.stripeSessionId,
    stripeSubscriptionId: normalizeStoredSubscriptionId(input.stripeSubscriptionId),
    stripeCustomerId: normalizeStoredCustomerId(input.stripeCustomerId),
    createdAt: now,
    updatedAt: now,
    failedSignIns: 0,
    lockedUntil: null,
    calendarFeedToken: null,
    workspace: emptyWorkspace(),
  };
  await writeAccount(account);
  return account;
}

export async function resetAccountPassword(
  email: string,
  password: string,
  stripeSessionId: string,
  billing?: { stripeSubscriptionId?: string | null; stripeCustomerId?: string | null },
): Promise<void> {
  const account = await findAccount(email);
  if (!account) throw new Error("Closepath account is missing");
  account.passwordHash = await hashPassword(password);
  account.stripeSessionId = stripeSessionId;
  const subscriptionId = normalizeStoredSubscriptionId(billing?.stripeSubscriptionId);
  const customerId = normalizeStoredCustomerId(billing?.stripeCustomerId);
  if (subscriptionId) account.stripeSubscriptionId = subscriptionId;
  if (customerId) account.stripeCustomerId = customerId;
  account.failedSignIns = 0;
  account.lockedUntil = null;
  account.updatedAt = new Date().toISOString();
  await writeAccount(account);
}

export async function authenticate(
  email: string,
  password: string,
  now = Date.now(),
): Promise<{ ok: true; email: string } | { ok: false; reason: "invalid" | "locked" }> {
  const normalized = normalizeEmail(email);
  const account = normalized ? await findAccount(normalized) : null;
  if (account?.lockedUntil && Date.parse(account.lockedUntil) > now) {
    return { ok: false, reason: "locked" };
  }
  const hash = account?.passwordHash ?? (await dummyPasswordHash());
  const match = await verifyPassword(password, hash);
  if (!account || !match || !normalized) {
    if (account) {
      account.failedSignIns += 1;
      if (account.failedSignIns >= LOCK_AFTER) {
        account.lockedUntil = new Date(now + LOCK_MS).toISOString();
        account.failedSignIns = 0;
      }
      account.updatedAt = new Date(now).toISOString();
      await writeAccount(account);
    }
    return { ok: false, reason: "invalid" };
  }
  if (account.failedSignIns || account.lockedUntil) {
    account.failedSignIns = 0;
    account.lockedUntil = null;
    account.updatedAt = new Date(now).toISOString();
    await writeAccount(account);
  }
  return { ok: true, email: account.email };
}

export async function loadWorkspace(email: string): Promise<Workspace> {
  const account = await findAccount(email);
  return account?.workspace ?? emptyWorkspace();
}

export async function saveWorkspace(email: string, workspace: Workspace): Promise<void> {
  const account = await findAccount(email);
  if (!account) throw new Error("Closepath account is missing");
  account.workspace = workspace;
  account.updatedAt = new Date().toISOString();
  await writeAccount(account);
}

async function requireAccount(email: string): Promise<ClosepathAccount> {
  const account = await findAccount(email);
  if (!account) throw new Error("Closepath account is missing");
  return account;
}

async function storeFeedToken(account: ClosepathAccount, previous: string | null): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const store = getClosepathStore();
  await store.set(feedIndex(token), account.email);
  account.calendarFeedToken = token;
  account.updatedAt = new Date().toISOString();
  await writeAccount(account);
  if (previous && previous !== token && FEED_TOKEN.test(previous)) await store.delete(feedIndex(previous));
  return token;
}

export async function calendarFeedTokenFor(email: string): Promise<string | null> {
  const account = await findAccount(email);
  return feedToken(account?.calendarFeedToken);
}

/** Creates the private feed token, or returns the one this book already has. */
export async function enableCalendarFeed(email: string): Promise<string> {
  const account = await requireAccount(email);
  const existing = feedToken(account.calendarFeedToken);
  if (existing) {
    await getClosepathStore().set(feedIndex(existing), account.email);
    return existing;
  }
  return storeFeedToken(account, null);
}

/** Replaces the feed token. Calendar apps that subscribed to the old link stop updating. */
export async function rotateCalendarFeed(email: string): Promise<string> {
  const account = await requireAccount(email);
  return storeFeedToken(account, account.calendarFeedToken);
}

export async function revokeCalendarFeed(email: string): Promise<void> {
  const account = await requireAccount(email);
  const previous = feedToken(account.calendarFeedToken);
  account.calendarFeedToken = null;
  account.updatedAt = new Date().toISOString();
  await writeAccount(account);
  if (previous) await getClosepathStore().delete(feedIndex(previous));
}

/** Maps a feed token back to the account email. Null when the link is unknown or revoked. */
export async function emailForCalendarToken(token: string): Promise<string | null> {
  if (!FEED_TOKEN.test(token)) return null;
  const stored = await getClosepathStore().get(feedIndex(token));
  const email = stored ? normalizeEmail(stored) : null;
  if (!email) return null;
  const account = await findAccount(email);
  const actual = account?.calendarFeedToken;
  if (!actual || !FEED_TOKEN.test(actual)) return null;
  const got = Buffer.from(token);
  const expected = Buffer.from(actual);
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  return account.email;
}

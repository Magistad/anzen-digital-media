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
  workspace: Workspace;
};

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
    workspace: emptyWorkspace(),
  };
  await writeAccount(account);
  return account;
}

/**
 * Checkout collects an email. It does not prove the person owns it.
 * An existing account can be reset or rebound only from that account's signed-in
 * session, or when the email was verified some other way.
 */
export function checkoutMayResetExistingAccount(input: {
  accountEmail: string;
  checkoutEmail: string | null;
  signedInEmail: string | null;
  emailVerified?: boolean;
}): boolean {
  const account = normalizeEmail(input.accountEmail);
  const checkout = input.checkoutEmail ? normalizeEmail(input.checkoutEmail) : null;
  const signedIn = input.signedInEmail ? normalizeEmail(input.signedInEmail) : null;
  if (!account || !checkout || account !== checkout) return false;
  if (input.emailVerified) return true;
  return signedIn === account;
}

/** New checkout accounts are allowed. An existing account is refused unless reset is authorized. */
export function checkoutAccountAction(input: {
  accountExists: boolean;
  accountEmail: string;
  checkoutEmail: string | null;
  signedInEmail: string | null;
  emailVerified?: boolean;
  resetRequested: boolean;
}): "create" | "reset" | "refuse" {
  if (!input.accountExists) return "create";
  if (input.resetRequested && checkoutMayResetExistingAccount(input)) return "reset";
  return "refuse";
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

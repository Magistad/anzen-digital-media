import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { readEnv } from "./env";

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 60;

export const SESSION_COOKIE = "closepath_session";

function scryptKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export function sessionSecret(): string | null {
  const secret = readEnv("CLOSEPATH_SESSION_SECRET");
  if (!secret || secret.length < 16) return null;
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptKey(password, salt);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (n !== SCRYPT_N || r !== SCRYPT_R || p !== SCRYPT_P) return false;
  const salt = Buffer.from(parts[4] ?? "", "base64url");
  const expected = Buffer.from(parts[5] ?? "", "base64url");
  if (salt.length < 8 || expected.length !== KEY_LEN) return false;
  const actual = await scryptKey(password, salt);
  return timingSafeEqual(actual, expected);
}

let dummyHash: string | null = null;

export async function dummyPasswordHash(): Promise<string> {
  if (!dummyHash) dummyHash = await hashPassword("closepath-not-a-password");
  return dummyHash;
}

type SessionPayload = { v: 1; email: string; exp: number };

export function issueSession(email: string, now = Date.now(), ttlMs = SESSION_TTL_MS): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload: SessionPayload = { v: 1, email, exp: now + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readSession(token: string | undefined, now = Date.now()): { email: string } | null {
  const secret = sessionSecret();
  if (!secret || !token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const actualBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (payload.v !== 1 || typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp <= now) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string, secure: boolean): { name: string; value: string; options: CookieOptions } {
  return { name: SESSION_COOKIE, value: token, options: cookieOptions(60 * 60 * 24 * 60, secure) };
}

export function clearSessionCookie(secure: boolean): { name: string; value: string; options: CookieOptions } {
  return { name: SESSION_COOKIE, value: "", options: cookieOptions(0, secure) };
}

type CookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

function cookieOptions(maxAge: number, secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  };
}

export function tokenFromRequest(req: Request): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== SESSION_COOKIE) continue;
    try {
      return decodeURIComponent(trimmed.slice(eq + 1));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

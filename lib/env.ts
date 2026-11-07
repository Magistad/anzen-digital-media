/** Read a server env var at runtime. Dynamic access is not inlined at build. */
export function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isStripeConfigured(): boolean {
  return Boolean(readEnv("STRIPE_SECRET_KEY"));
}

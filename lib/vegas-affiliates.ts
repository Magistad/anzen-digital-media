import { readEnv } from "./env";

/** Outbound ticket and booking links. Unset ids leave the URL unchanged. */
export type AffiliateEnv = {
  TICKETMASTER_IMPACT_ID?: string;
  SEATGEEK_AID?: string;
  VIATOR_PARTNER_ID?: string;
  GETYOURGUIDE_PARTNER_ID?: string;
};

export function affiliateEnv(source: NodeJS.ProcessEnv = process.env): AffiliateEnv {
  return {
    TICKETMASTER_IMPACT_ID: readEnvFrom(source, "TICKETMASTER_IMPACT_ID"),
    SEATGEEK_AID: readEnvFrom(source, "SEATGEEK_AID"),
    VIATOR_PARTNER_ID: readEnvFrom(source, "VIATOR_PARTNER_ID"),
    GETYOURGUIDE_PARTNER_ID: readEnvFrom(source, "GETYOURGUIDE_PARTNER_ID"),
  };
}

function readEnvFrom(source: NodeJS.ProcessEnv, name: string): string | undefined {
  if (source === process.env) return readEnv(name);
  const value = source[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function hostOf(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, "");
}

/** Append a provider affiliate id when one is configured. Otherwise return the same string. */
export function withAffiliate(url: string, env: AffiliateEnv = affiliateEnv()): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const host = hostOf(parsed);
  let changed = false;
  const apply = (param: string, value: string | undefined) => {
    const id = value?.trim();
    if (!id) return;
    parsed.searchParams.set(param, id);
    changed = true;
  };
  if (host === "ticketmaster.com" || host.endsWith(".ticketmaster.com")) apply("irpid", env.TICKETMASTER_IMPACT_ID);
  if (host === "seatgeek.com" || host.endsWith(".seatgeek.com")) apply("aid", env.SEATGEEK_AID);
  if (host === "viator.com" || host.endsWith(".viator.com")) apply("pid", env.VIATOR_PARTNER_ID);
  if (host === "getyourguide.com" || host.endsWith(".getyourguide.com")) apply("partner_id", env.GETYOURGUIDE_PARTNER_ID);
  return changed ? parsed.toString() : url;
}

export const NWS_FORECAST_URL = "https://api.weather.gov/gridpoints/VEF/123,98/forecast";
export const NWS_ZONE_URL = "https://api.weather.gov/zones/forecast/NVZ020";
export const NWS_OFFICE_URL = "https://www.weather.gov/vef/";
export const FAA_STATUS_URL = "https://nasstatus.faa.gov/api/airport-status-information";
export const FAA_HOME_URL = "https://nasstatus.faa.gov/";
export const AIRPORT_HOME_URL = "https://www.harryreidairport.com/";
export const AIRPORT_WAIT_URL = "https://www.harryreidairport.com/security-wait-times";

export const NWS_USER_AGENT =
  "Anzen Digital Media (https://anzendigitalmedia.com; contact@anzendigitalmedia.com)";

export const WEATHER_FALLBACK =
  "The valley forecast is unavailable right now. Check the National Weather Service.";
export const FAA_FALLBACK = "FAA status is unavailable right now. Check the FAA airport status page.";
export const FAA_CLEAR = "No FAA delays reported";

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export type ForecastSnapshot = {
  line: string;
  periodName: string;
  updated: string | null;
};

export type FaaSnapshot = {
  line: string;
  updated: string | null;
};

export type FeedResult<T> = { ok: true; data: T } | { ok: false; fallback: string };

export type ConditionsReport = {
  checkedAt: string;
  weather: FeedResult<ForecastSnapshot>;
  faa: FeedResult<FaaSnapshot>;
};

type ForecastPeriod = {
  name: string;
  startTime: string;
  endTime: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  windSpeed?: string;
  windDirection?: string;
};

export function formatPacific(instant: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(instant);
}

export function parseFaaUpdated(value: string): Date | null {
  const match = value.match(/([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+(\d{4})\s+GMT/);
  if (!match) return null;
  const month = MONTHS[match[1]];
  if (month === undefined) return null;
  const instant = new Date(
    Date.UTC(Number(match[6]), month, Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5])),
  );
  return Number.isNaN(instant.getTime()) ? null : instant;
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tagText(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return null;
  const text = decodeXml(match[1]);
  return text || null;
}

function blocks(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))].map((match) => match[1]);
}

function lasIn(section: string, itemTag: string, kind: "stop" | "delay"): string[] {
  const lines: string[] = [];
  for (const item of blocks(section, itemTag)) {
    if (tagText(item, "ARPT")?.toUpperCase() !== "LAS") continue;
    if (kind === "stop") {
      const reason = tagText(item, "Reason");
      const end = tagText(item, "End_Time");
      const sentence = reason ? `Ground stop: ${reason}.` : "Ground stop.";
      lines.push(end ? `${sentence} Ends ${end}.` : sentence);
    } else {
      const reason = tagText(item, "Reason");
      const avg = tagText(item, "Avg");
      const max = tagText(item, "Max");
      let sentence = reason ? `Ground delay: ${reason}.` : "Ground delay.";
      if (avg) sentence += ` Average ${avg}.`;
      if (max) sentence += ` Maximum ${max}.`;
      lines.push(sentence);
    }
  }
  return lines;
}

export function parseFaaStatus(xml: string): FaaSnapshot | null {
  if (!xml.includes("<AIRPORT_STATUS_INFORMATION")) return null;
  const updatedRaw = tagText(xml, "Update_Time");
  const updatedAt = updatedRaw ? parseFaaUpdated(updatedRaw) : null;
  const lines: string[] = [];
  for (const section of blocks(xml, "Delay_type")) {
    const name = (tagText(section, "Name") ?? "").toLowerCase();
    if (name.includes("ground stop")) lines.push(...lasIn(section, "Program", "stop"));
    if (name.includes("ground delay")) lines.push(...lasIn(section, "Ground_Delay", "delay"));
  }
  return {
    line: lines.join(" ") || FAA_CLEAR,
    updated: updatedAt ? updatedAt.toISOString() : null,
  };
}

function isPeriod(value: unknown): value is ForecastPeriod {
  if (!value || typeof value !== "object") return false;
  const period = value as Partial<ForecastPeriod>;
  return (
    typeof period.name === "string" &&
    typeof period.startTime === "string" &&
    typeof period.endTime === "string" &&
    typeof period.temperature === "number" &&
    Number.isFinite(period.temperature) &&
    typeof period.temperatureUnit === "string" &&
    typeof period.shortForecast === "string" &&
    period.shortForecast.trim().length > 0
  );
}

export function formatForecastLine(period: ForecastPeriod): string {
  const temperature = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(period.temperature);
  let line = `${period.name}: ${temperature}°${period.temperatureUnit}. ${period.shortForecast}.`;
  if (period.windSpeed && period.windDirection) {
    line += ` Wind ${period.windSpeed}, ${period.windDirection}.`;
  }
  return line;
}

export function parseForecast(body: unknown, now: Date): ForecastSnapshot | null {
  if (!body || typeof body !== "object") return null;
  const properties = (body as { properties?: unknown }).properties;
  if (!properties || typeof properties !== "object") return null;
  const periods = (properties as { periods?: unknown }).periods;
  if (!Array.isArray(periods)) return null;
  const usable = periods.filter(isPeriod);
  if (usable.length === 0) return null;
  const current =
    usable.find((period) => {
      const start = Date.parse(period.startTime);
      const end = Date.parse(period.endTime);
      return Number.isFinite(start) && Number.isFinite(end) && start <= now.getTime() && now.getTime() < end;
    }) ?? usable[0];
  const updatedRaw = (properties as { updateTime?: unknown; generatedAt?: unknown }).updateTime;
  const generatedRaw = (properties as { generatedAt?: unknown }).generatedAt;
  const stamp = typeof updatedRaw === "string" ? updatedRaw : typeof generatedRaw === "string" ? generatedRaw : null;
  const updatedAt = stamp ? new Date(stamp) : null;
  return {
    line: formatForecastLine(current),
    periodName: current.name,
    updated: updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt.toISOString() : null,
  };
}

async function readText(
  fetchImpl: typeof fetch,
  url: string,
  headers: Record<string, string>,
): Promise<string> {
  const response = await fetchImpl(url, {
    headers,
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`status ${response.status}`);
  return response.text();
}

export async function loadConditions(fetchImpl: typeof fetch, now = new Date()): Promise<ConditionsReport> {
  const headers = {
    Accept: "application/json, application/geo+json, text/xml, */*",
    "User-Agent": NWS_USER_AGENT,
  };
  const [weatherResult, faaResult] = await Promise.allSettled([
    readText(fetchImpl, NWS_FORECAST_URL, headers),
    readText(fetchImpl, FAA_STATUS_URL, headers),
  ]);

  let weather: FeedResult<ForecastSnapshot> = { ok: false, fallback: WEATHER_FALLBACK };
  if (weatherResult.status === "fulfilled") {
    try {
      const parsed = parseForecast(JSON.parse(weatherResult.value) as unknown, now);
      if (parsed) weather = { ok: true, data: parsed };
    } catch {
      weather = { ok: false, fallback: WEATHER_FALLBACK };
    }
  }

  let faa: FeedResult<FaaSnapshot> = { ok: false, fallback: FAA_FALLBACK };
  if (faaResult.status === "fulfilled") {
    const parsed = parseFaaStatus(faaResult.value);
    if (parsed) faa = { ok: true, data: parsed };
  }

  return { checkedAt: now.toISOString(), weather, faa };
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  FAA_CLEAR,
  FAA_FALLBACK,
  NWS_USER_AGENT,
  WEATHER_FALLBACK,
  formatPacific,
  loadConditions,
  parseFaaStatus,
  parseFaaUpdated,
  parseForecast,
} from "./vegas-conditions";

const FAA_DELAY = `<?xml version="1.0"?>
<AIRPORT_STATUS_INFORMATION>
  <Update_Time>Fri Nov 20 00:15:13 2026 GMT</Update_Time>
  <Delay_type>
    <Name>Ground Stop Programs</Name>
    <Ground_Stop_List>
      <Program><ARPT>SAN</ARPT><Reason>low visibility</Reason><End_Time>5:00 pm PST</End_Time></Program>
    </Ground_Stop_List>
  </Delay_type>
  <Delay_type>
    <Name>Ground Delay Programs</Name>
    <Ground_Delay_List>
      <Ground_Delay><ARPT>SFO</ARPT><Reason>LOW</Reason><Avg>1 hour</Avg><Max>2 hours</Max></Ground_Delay>
      <Ground_Delay><ARPT>LAS</ARPT><Reason>low ceilings</Reason><Avg>47 minutes</Avg><Max>1 hour and 29 minutes</Max></Ground_Delay>
    </Ground_Delay_List>
  </Delay_type>
  <Delay_type>
    <Name>Airport Closures</Name>
    <Airport_Closure_List>
      <Airport><ARPT>LAS</ARPT><Reason>GA aircraft prior permission</Reason></Airport>
    </Airport_Closure_List>
  </Delay_type>
</AIRPORT_STATUS_INFORMATION>`;

const FAA_STOP = `<?xml version="1.0"?>
<AIRPORT_STATUS_INFORMATION>
  <Update_Time>Fri Nov 20 00:15:13 2026 GMT</Update_Time>
  <Delay_type>
    <Name>Ground Stop Programs</Name>
    <Ground_Stop_List>
      <Program><ARPT>LAS</ARPT><Reason>thunderstorms</Reason><End_Time>6:00 pm PST</End_Time></Program>
    </Ground_Stop_List>
  </Delay_type>
</AIRPORT_STATUS_INFORMATION>`;

const FAA_CLEAR_XML = `<?xml version="1.0"?>
<AIRPORT_STATUS_INFORMATION>
  <Update_Time>Fri Nov 20 00:15:13 2026 GMT</Update_Time>
  <Delay_type><Name>Ground Delay Programs</Name><Ground_Delay_List></Ground_Delay_List></Delay_type>
</AIRPORT_STATUS_INFORMATION>`;

const FORECAST = {
  properties: {
    updateTime: "2026-11-19T21:47:57+00:00",
    periods: [
      {
        name: "This Afternoon",
        startTime: "2026-11-19T16:00:00-08:00",
        endTime: "2026-11-19T18:00:00-08:00",
        temperature: 62,
        temperatureUnit: "F",
        shortForecast: "Chance Rain Showers",
        windSpeed: "7 mph",
        windDirection: "S",
      },
      {
        name: "Tonight",
        startTime: "2026-11-19T18:00:00-08:00",
        endTime: "2026-11-20T06:00:00-08:00",
        temperature: 45,
        temperatureUnit: "F",
        shortForecast: "Mostly Clear",
        windSpeed: "7 to 22 mph",
        windDirection: "SW",
      },
    ],
  },
};

test("pacific time uses the America/Los_Angeles zone", () => {
  const label = formatPacific(new Date("2026-11-20T00:15:13Z"));
  assert.match(label, /Nov/);
  assert.match(label, /19/);
  assert.match(label, /4:15/);
  assert.match(label, /PST/);
});

test("FAA update stamps parse from the feed's GMT line", () => {
  const parsed = parseFaaUpdated("Fri Nov 20 00:15:13 2026 GMT");
  assert.equal(parsed?.toISOString(), "2026-11-20T00:15:13.000Z");
  assert.equal(parseFaaUpdated("not a time"), null);
});

test("FAA status keeps LAS ground delay and ignores other airports and closures", () => {
  const status = parseFaaStatus(FAA_DELAY);
  assert.ok(status);
  assert.match(status.line, /Ground delay: low ceilings/);
  assert.match(status.line, /Average 47 minutes/);
  assert.match(status.line, /Maximum 1 hour and 29 minutes/);
  assert.equal(status.line.includes("SAN"), false);
  assert.equal(status.line.includes("SFO"), false);
  assert.equal(status.line.includes("prior permission"), false);
  assert.equal(status.line.includes(FAA_CLEAR), false);
});

test("FAA status shows a LAS ground stop", () => {
  const status = parseFaaStatus(FAA_STOP);
  assert.match(status?.line ?? "", /Ground stop: thunderstorms/);
  assert.match(status?.line ?? "", /Ends 6:00 pm PST/);
});

test("FAA status falls back to the clear line when LAS has no ground program", () => {
  assert.equal(parseFaaStatus(FAA_CLEAR_XML)?.line, FAA_CLEAR);
  assert.equal(parseFaaStatus("<html>nope</html>"), null);
  assert.equal(parseFaaStatus(""), null);
});

test("forecast parsing picks the period covering now and rejects a bad feed", () => {
  const now = new Date("2026-11-20T02:00:00Z");
  const forecast = parseForecast(FORECAST, now);
  assert.equal(forecast?.periodName, "Tonight");
  assert.match(forecast?.line ?? "", /45°F/);
  assert.match(forecast?.line ?? "", /Mostly Clear/);
  assert.match(forecast?.line ?? "", /Wind 7 to 22 mph, SW/);
  assert.equal(parseForecast({ properties: { periods: [] } }, now), null);
  assert.equal(parseForecast(null, now), null);
  assert.equal(parseForecast("nope", now), null);
});

test("condition loading keeps each feed when the other fails", async () => {
  const now = new Date("2026-11-20T02:00:00Z");
  const report = await loadConditions(async (input, init) => {
    const url = String(input);
    assert.equal((init?.headers as Record<string, string>)["User-Agent"], NWS_USER_AGENT);
    if (url.includes("weather.gov")) {
      return new Response(JSON.stringify(FORECAST), { status: 200 });
    }
    return new Response("down", { status: 503 });
  }, now);
  assert.equal(report.weather.ok, true);
  assert.equal(report.faa.ok, false);
  if (!report.faa.ok) assert.equal(report.faa.fallback, FAA_FALLBACK);
  assert.equal(report.checkedAt, now.toISOString());
});

test("condition loading uses fallback text when both feeds fail", async () => {
  const report = await loadConditions(async () => {
    throw new Error("offline");
  });
  assert.equal(report.weather.ok, false);
  assert.equal(report.faa.ok, false);
  if (!report.weather.ok) assert.equal(report.weather.fallback, WEATHER_FALLBACK);
  if (!report.faa.ok) assert.equal(report.faa.fallback, FAA_FALLBACK);
});

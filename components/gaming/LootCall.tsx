"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "anzen-gaming-rob-run-encounters";

const ACTIVITY = [
  { value: 0, label: "Quiet", hint: "Little traffic, no nearby gunfire." },
  { value: 1, label: "Normal", hint: "Some cars, maybe a player passed." },
  { value: 2, label: "Packed", hint: "Gunfire close by, heavy traffic, or several players." },
] as const;

const HOTSPOT = [
  { value: 0, label: "Low", hint: "A dead street or a spot people skip." },
  { value: 1, label: "Medium", hint: "A regular stop, not the most farmed." },
  { value: 2, label: "High", hint: "A marked building or a farm everyone runs." },
] as const;

type Verdict = {
  title: string;
  body: string;
};

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function decide(
  activity: number,
  hotspot: number,
  encounters: number,
  secured: number,
  remaining: number,
): Verdict {
  const risk = activity + hotspot + Math.min(encounters, 4);
  const bagIsHeavier = secured > 0 && secured >= remaining;
  const roomIsRicher = remaining > secured;

  if (secured <= 0 && remaining <= 0) {
    return {
      title: "Fill in the bag first",
      body: "Add what you already have and what is still in the room. The leave call is about those two piles.",
    };
  }

  if (bagIsHeavier && risk >= 4) {
    return {
      title: "Leave",
      body: `What you already have (${money(secured)}) is worth more than what is left in the room (${money(remaining)}), and this area feels dangerous. I would take the bag and go.`,
    };
  }

  if (bagIsHeavier) {
    return {
      title: "Leave",
      body: `The bag already beats the room: ${money(secured)} secured, ${money(remaining)} still on the floor. I only stay if it is still quiet, and even then I would already be walking to the door.`,
    };
  }

  if (roomIsRicher && risk >= 5) {
    return {
      title: "I would still go",
      body: `There is more left in the room (${money(remaining)}) than you have secured (${money(secured)}), but the street feels packed or this spot has burned you. A half bag that makes it out is better than a full one that does not.`,
    };
  }

  if (roomIsRicher && risk >= 3) {
    return {
      title: "One more crate, then go",
      body: `The room still has more on the floor (${money(remaining)}) than you have bagged (${money(secured)}), but the area is not quiet. Grab the closest pile if you can do it fast, then leave.`,
    };
  }

  return {
    title: "You can keep looking",
    body: `The room still has more than the bag: ${money(remaining)} on the floor, ${money(secured)} already secured, and the area still feels manageable. Keep an ear on the street. The moment the bag passes the room, leave.`,
  };
}

export function LootCall() {
  const [activity, setActivity] = useState(1);
  const [hotspot, setHotspot] = useState(1);
  const [encounters, setEncounters] = useState(0);
  const [secured, setSecured] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed >= 0) setEncounters(parsed);
      }
    } catch {
      // Private mode or blocked storage. The count still works for this visit.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(encounters));
    } catch {
      // Same as above: the recommendation still updates in memory.
    }
  }, [encounters, ready]);

  const verdict = useMemo(
    () => decide(activity, hotspot, encounters, secured, remaining),
    [activity, hotspot, encounters, secured, remaining],
  );

  const activityMeta = ACTIVITY[activity] ?? ACTIVITY[1];
  const hotspotMeta = HOTSPOT[hotspot] ?? HOTSPOT[1];

  return (
    <section className="loot-call" aria-labelledby="loot-call-title">
      <h2 id="loot-call-title">Leave or stay</h2>
      <p className="loot-call-lead">
        This uses what you can actually see and hear. It does not invent a lobby count.
      </p>

      <div className="loot-call-grid">
        <div className="loot-field">
          <label htmlFor="loot-activity">
            How busy does this area feel?
            <span>{activityMeta.label}</span>
          </label>
          <input
            id="loot-activity"
            name="activity"
            type="range"
            min={0}
            max={2}
            step={1}
            value={activity}
            aria-valuetext={activityMeta.label}
            onChange={(event) => setActivity(Number(event.target.value))}
          />
          <p className="loot-hint">{activityMeta.hint}</p>
        </div>

        <div className="loot-field">
          <label htmlFor="loot-hotspot">
            Is this a hotspot?
            <span>{hotspotMeta.label}</span>
          </label>
          <input
            id="loot-hotspot"
            name="hotspot"
            type="range"
            min={0}
            max={2}
            step={1}
            value={hotspot}
            aria-valuetext={hotspotMeta.label}
            onChange={(event) => setHotspot(Number(event.target.value))}
          />
          <p className="loot-hint">{hotspotMeta.hint}</p>
        </div>

        <div className="loot-field">
          <p className="loot-legend" id="loot-encounters-label">
            Jumps at this spot
          </p>
          <div className="loot-counter" role="group" aria-labelledby="loot-encounters-label">
            <p className="loot-count">
              <span className="loot-count-num">{encounters}</span>
              {encounters === 1 ? " recorded encounter" : " recorded encounters"}
            </p>
            <button type="button" onClick={() => setEncounters((n) => n + 1)}>
              I got jumped here
            </button>
            <button
              type="button"
              className="loot-quiet"
              onClick={() => setEncounters(0)}
              disabled={encounters === 0}
            >
              Clear log
            </button>
          </div>
          <p className="loot-hint">Kept on this browser so the next run at the same place starts from what you already learned.</p>
        </div>

        <div className="loot-values">
        <div className="loot-field">
          <label htmlFor="loot-secured">Already secured</label>
          <input
            id="loot-secured"
            name="secured"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={secured || ""}
            placeholder="0"
            autoComplete="off"
            onChange={(event) => setSecured(Math.max(0, Number(event.target.value) || 0))}
          />
        </div>

        <div className="loot-field">
          <label htmlFor="loot-remaining">Still in the room</label>
          <input
            id="loot-remaining"
            name="remaining"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={remaining || ""}
            placeholder="0"
            autoComplete="off"
            onChange={(event) => setRemaining(Math.max(0, Number(event.target.value) || 0))}
          />
        </div>
        </div>
      </div>

      <p className="loot-verdict" aria-live="polite">
        <strong>{verdict.title}</strong>
        <span>{verdict.body}</span>
      </p>
    </section>
  );
}

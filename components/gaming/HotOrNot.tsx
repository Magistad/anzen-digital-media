"use client";

import { useState } from "react";
import { steamGameByAppId, type SteamGame } from "../../lib/gaming/steam";

type Vote = "hot" | "not" | null;

export function HotOrNot({ appId, game }: { appId?: string; game?: SteamGame }) {
  const resolved = game ?? (appId ? steamGameByAppId(appId) : undefined);
  const [vote, setVote] = useState<Vote>(null);

  if (!resolved) return null;

  return (
    <section className="hot-or-not" aria-labelledby="hot-or-not-title">
      <h2 id="hot-or-not-title">Hot or Not</h2>
      <p className="hot-or-not-note">Votes are not saved yet. This is a preview of the tracker.</p>
      <a
        className="hot-or-not-art"
        href={resolved.storeUrl}
        rel="noopener"
        target="_blank"
      >
        {/* Official Steam header art, linked to the Steam store page. */}
        <img
          src={resolved.capsuleUrl}
          alt={`${resolved.name} on Steam`}
          width={resolved.capsuleWidth}
          height={resolved.capsuleHeight}
          referrerPolicy="no-referrer"
        />
      </a>
      <div className="hot-or-not-actions">
        <button
          type="button"
          className={vote === "hot" ? "is-on" : undefined}
          aria-pressed={vote === "hot"}
          onClick={() => setVote("hot")}
        >
          Hot
        </button>
        <button
          type="button"
          className={vote === "not" ? "is-on" : undefined}
          aria-pressed={vote === "not"}
          onClick={() => setVote("not")}
        >
          Not
        </button>
      </div>
      <p className="hot-or-not-status" aria-live="polite">
        {vote === "hot"
          ? `You marked ${resolved.name} hot. The vote stays on this page only.`
          : vote === "not"
            ? `You marked ${resolved.name} not. The vote stays on this page only.`
            : `Official art from Steam. Opens the ${resolved.name} store page.`}
      </p>
    </section>
  );
}

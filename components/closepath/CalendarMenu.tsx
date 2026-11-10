"use client";

import { useState } from "react";
import {
  type CalendarEvent,
  appleEventHref,
  buildIcs,
  calendarFilename,
  formatCalendarDate,
  googleEventUrl,
  outlookEventUrl,
} from "../../lib/closepath-calendar";

function downloadCalendar(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function EventLinks({ event, filename }: { event: CalendarEvent; filename: string }) {
  return (
    <>
      <a href={googleEventUrl(event)} target="_blank" rel="noreferrer" className="book-quiet text-paper">
        Google
      </a>
      <a href={outlookEventUrl(event)} target="_blank" rel="noreferrer" className="book-quiet text-paper">
        Outlook
      </a>
      <a href={appleEventHref([event], "Closepath")} download={filename} className="book-quiet text-paper">
        Apple
      </a>
    </>
  );
}

export function CalendarMenu({
  events,
  label = "Add to calendar",
  filename,
  note = false,
}: {
  events: CalendarEvent[];
  label?: string;
  filename?: string;
  note?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!events.length) return null;
  const file = filename ?? calendarFilename(events.length === 1 ? events[0]?.label ?? label : label);
  if (!open) {
    return (
      <button type="button" className="book-quiet text-paper" aria-expanded={false} onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }

  return (
    <div className="max-w-xl" role="group" aria-label={label}>
      {events.length === 1 && events[0] ? (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <EventLinks event={events[0]} filename={file} />
          <button type="button" className="book-quiet" onClick={() => setOpen(false)}>
            Close
          </button>
        </span>
      ) : (
        <div>
          <button
            type="button"
            className="book-quiet text-paper"
            onClick={() => downloadCalendar(file, buildIcs(events, { calendarName: "Closepath" }))}
          >
            Download all for Apple, Google, or Outlook
          </button>
          <ul className="mt-1">
            {events.map((event) => (
              <li key={event.uid} className="flex flex-wrap items-baseline gap-x-3 gap-y-0 border-b border-paper/10 py-1">
                <span className="min-w-0 text-[14px] text-paper/75">
                  {event.label}
                  <span className="text-paper/45"> · {formatCalendarDate(event.date)}</span>
                </span>
                <span className="flex flex-wrap gap-x-3">
                  <EventLinks event={event} filename={calendarFilename(event.label)} />
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="book-quiet mt-1" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
      {note ? (
        <p className="mt-1 max-w-xl text-[13px] leading-snug text-paper/50">
          Adds a copy of these dates. It stays put if you later move a date. Subscribe to keep the calendar in step.
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";

export function GamingNotes() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    setEnhanced(true);
    if (new URLSearchParams(window.location.search).get("noted") === "1") {
      setSent(true);
    }
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const email = form.elements.namedItem("email");
    if (!(email instanceof HTMLInputElement) || !email.value.trim() || email.validity.typeMismatch) {
      event.preventDefault();
      setError("Enter an email like you@domain.com.");
      if (email instanceof HTMLInputElement) email.focus();
      return;
    }
    setError("");
    setPending(true);
  }

  if (sent) {
    return (
      <p className="gaming-notes-done" role="status">
        Got it. That note goes to the same studio inbox as the contact form.
      </p>
    );
  }

  return (
    <form
      className="gaming-notes"
      name="contact"
      method="POST"
      action="/gaming?noted=1"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={onSubmit}
      noValidate={enhanced}
      aria-busy={pending}
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="name" value="Gaming notes" />
      <input
        type="hidden"
        name="message"
        value="Send me a note when LUNCHBRK publishes a gaming piece."
      />
      <p className="contact-hp" hidden>
        <label>
          Do not fill this in
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <p>Leave an email if you want a note when I publish the next one. It lands in the same inbox as the contact form.</p>
      <div className="gaming-notes-row">
        <label htmlFor="gaming-notes-email">
          <span>Email</span>
          <input
            id="gaming-notes-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            inputMode="email"
            placeholder="you@domain.com…"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "gaming-notes-error" : undefined}
          />
        </label>
        <button type="submit" className="hud-signin" disabled={pending}>
          {pending ? "Sending…" : "Request a note"}
        </button>
      </div>
      {error ? (
        <p id="gaming-notes-error" className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

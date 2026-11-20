"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendVegasEvent } from "./TrackEvents";

type Problem = { id: string; message: string };

function useFormGuard() {
  const dirty = useRef(false);
  const warn = useRef<(event: BeforeUnloadEvent) => void>(() => {});
  const [enhanced, setEnhanced] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const onBefore = (event: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    warn.current = onBefore;
    window.addEventListener("beforeunload", onBefore);
    setEnhanced(true);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, []);

  function markDirty() {
    dirty.current = true;
  }

  function allowLeave() {
    dirty.current = false;
    window.removeEventListener("beforeunload", warn.current);
    setPending(true);
  }

  return { enhanced, pending, markDirty, allowLeave };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  );
}

function Honeypot() {
  return (
    <p className="contact-hp" hidden>
      <label>
        Do not fill this in
        <input name="bot-field" tabIndex={-1} autoComplete="off" />
      </label>
    </p>
  );
}

function problemsFor(form: HTMLFormElement, names: string[]): Problem[] {
  const found: Problem[] = [];
  for (const name of names) {
    const node = form.elements.namedItem(name);
    if (!(node instanceof HTMLInputElement) && !(node instanceof HTMLTextAreaElement)) continue;
    if (node.required && !node.value.trim()) {
      found.push({ id: node.id, message: node.dataset.required || "Enter this." });
    } else if (node instanceof HTMLInputElement && node.type === "email" && node.value.trim() && node.validity.typeMismatch) {
      found.push({ id: node.id, message: "Enter an email like you@example.com." });
    }
  }
  return found;
}

export function WaitlistForm({ done }: { done: boolean }) {
  const guard = useFormGuard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (done) {
    return (
      <p className="contact-success" role="status">
        You are on the list.
      </p>
    );
  }
  return (
    <form
      className="contact-form vegas-form"
      name="vegas-waitlist"
      method="POST"
      action="/products/vegas?joined=1"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      noValidate={guard.enhanced}
      aria-busy={guard.pending}
      onInput={guard.markDirty}
      onSubmit={(event) =>
        submitForm(event, ["email"], setErrors, () => {
          guard.allowLeave();
          sendVegasEvent("waitlist", "vegas-waitlist");
        })
      }
    >
      <input type="hidden" name="form-name" value="vegas-waitlist" />
      <Honeypot />
      <div>
        <label htmlFor="vegas-waitlist-email">
          <span>Email</span>
          <input
            id="vegas-waitlist-email"
            name="email"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
            data-required="Enter an email like you@example.com."
            aria-invalid={errors["vegas-waitlist-email"] ? true : undefined}
            aria-describedby={errors["vegas-waitlist-email"] ? "vegas-waitlist-email-error" : undefined}
          />
        </label>
        <FieldError id="vegas-waitlist-email-error" message={errors["vegas-waitlist-email"]} />
      </div>
      <button type="submit" className="hud-signin" disabled={guard.pending}>
        {guard.pending ? "Joining…" : "Join the Waitlist"}
      </button>
    </form>
  );
}

function submitForm(
  event: FormEvent<HTMLFormElement>,
  names: string[],
  setErrors: (next: Record<string, string>) => void,
  onOk: () => void,
) {
  const form = event.currentTarget;
  const found = problemsFor(form, names);
  const next: Record<string, string> = {};
  for (const problem of found) next[problem.id] = problem.message;
  setErrors(next);
  if (found[0]) {
    event.preventDefault();
    document.getElementById(found[0].id)?.focus();
    return;
  }
  onOk();
}


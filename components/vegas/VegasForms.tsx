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
      <label className="vegas-check" htmlFor="vegas-waitlist-community">
        <input id="vegas-waitlist-community" name="community" type="checkbox" value="yes" />
        <span>I’d join a Vegas locals and visitors community</span>
      </label>
      <button type="submit" className="hud-signin" disabled={guard.pending}>
        {guard.pending ? "Joining…" : "Join the Waitlist"}
      </button>
    </form>
  );
}

export function AskForm({ done }: { done: boolean }) {
  const guard = useFormGuard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (done) {
    return (
      <p className="contact-success" role="status">
        Question received. It is not on the page until it is reviewed.
      </p>
    );
  }
  return (
    <form
      className="contact-form vegas-form"
      name="vegas-ask-a-local"
      method="POST"
      action="/products/vegas?asked=1"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      noValidate={guard.enhanced}
      aria-busy={guard.pending}
      onInput={guard.markDirty}
      onSubmit={(event) =>
        submitForm(event, ["question", "email"], setErrors, () => {
          guard.allowLeave();
          sendVegasEvent("ask", "vegas-ask-a-local");
        })
      }
    >
      <input type="hidden" name="form-name" value="vegas-ask-a-local" />
      <Honeypot />
      <div>
        <label htmlFor="vegas-ask-question">
          <span>Question</span>
          <textarea
            id="vegas-ask-question"
            name="question"
            required
            rows={4}
            autoComplete="off"
            placeholder="Ask about a walk, a ride, or a week…"
            data-required="Enter a question."
            aria-invalid={errors["vegas-ask-question"] ? true : undefined}
            aria-describedby={errors["vegas-ask-question"] ? "vegas-ask-question-error" : undefined}
          />
        </label>
        <FieldError id="vegas-ask-question-error" message={errors["vegas-ask-question"]} />
      </div>
      <div>
        <label htmlFor="vegas-ask-dates">
          <span>Trip dates, if you have them</span>
          <input
            id="vegas-ask-dates"
            name="dates"
            type="text"
            autoComplete="off"
            placeholder="May 12 to May 15…"
            aria-describedby="vegas-ask-dates-hint"
          />
        </label>
        <p id="vegas-ask-dates-hint" className="vegas-hint">
          Optional. Dates help the answer fit your week.
        </p>
      </div>
      <div>
        <label htmlFor="vegas-ask-email">
          <span>Email, if you want a reply</span>
          <input
            id="vegas-ask-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
            aria-invalid={errors["vegas-ask-email"] ? true : undefined}
            aria-describedby={errors["vegas-ask-email"] ? "vegas-ask-email-error" : "vegas-ask-email-hint"}
          />
        </label>
        <p id="vegas-ask-email-hint" className="vegas-hint">
          Optional. The best questions are answered on this page after review.
        </p>
        <FieldError id="vegas-ask-email-error" message={errors["vegas-ask-email"]} />
      </div>
      <button type="submit" className="hud-signin" disabled={guard.pending}>
        {guard.pending ? "Sending…" : "Send the Question"}
      </button>
    </form>
  );
}

export function TipForm({ done }: { done: boolean }) {
  const guard = useFormGuard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (done) {
    return (
      <p className="contact-success" role="status">
        Tip received. It is not on the page until it is reviewed.
      </p>
    );
  }
  return (
    <form
      className="contact-form vegas-form"
      name="vegas-local-tip"
      method="POST"
      action="/products/vegas?tipped=1"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      noValidate={guard.enhanced}
      aria-busy={guard.pending}
      onInput={guard.markDirty}
      onSubmit={(event) =>
        submitForm(event, ["tip", "area", "email"], setErrors, () => {
          guard.allowLeave();
          sendVegasEvent("tip", "vegas-local-tip");
        })
      }
    >
      <input type="hidden" name="form-name" value="vegas-local-tip" />
      <Honeypot />
      <div>
        <label htmlFor="vegas-tip-body">
          <span>Tip</span>
          <textarea
            id="vegas-tip-body"
            name="tip"
            required
            rows={4}
            autoComplete="off"
            placeholder="A specific tip a visitor can use…"
            data-required="Enter a tip."
            aria-invalid={errors["vegas-tip-body"] ? true : undefined}
            aria-describedby={errors["vegas-tip-body"] ? "vegas-tip-body-error" : undefined}
          />
        </label>
        <FieldError id="vegas-tip-body-error" message={errors["vegas-tip-body"]} />
      </div>
      <div>
        <label htmlFor="vegas-tip-area">
          <span>Neighborhood or area</span>
          <input
            id="vegas-tip-area"
            name="area"
            type="text"
            required
            autoComplete="off"
            placeholder="Fremont Street…"
            data-required="Enter a neighborhood or area."
            aria-invalid={errors["vegas-tip-area"] ? true : undefined}
            aria-describedby={errors["vegas-tip-area"] ? "vegas-tip-area-error" : undefined}
          />
        </label>
        <FieldError id="vegas-tip-area-error" message={errors["vegas-tip-area"]} />
      </div>
      <div>
        <label htmlFor="vegas-tip-name">
          <span>Name or handle</span>
          <input
            id="vegas-tip-name"
            name="name"
            type="text"
            autoComplete="nickname"
            spellCheck={false}
            placeholder="Alex…"
            aria-describedby="vegas-tip-name-hint"
          />
        </label>
        <p id="vegas-tip-name-hint" className="vegas-hint">
          Optional. Tips are reviewed before they are posted.
        </p>
      </div>
      <div>
        <label htmlFor="vegas-tip-email">
          <span>Email</span>
          <input
            id="vegas-tip-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
            aria-invalid={errors["vegas-tip-email"] ? true : undefined}
            aria-describedby={errors["vegas-tip-email"] ? "vegas-tip-email-error" : "vegas-tip-email-hint"}
          />
        </label>
        <p id="vegas-tip-email-hint" className="vegas-hint">
          Optional. Nothing you send is published automatically.
        </p>
        <FieldError id="vegas-tip-email-error" message={errors["vegas-tip-email"]} />
      </div>
      <button type="submit" className="hud-signin" disabled={guard.pending}>
        {guard.pending ? "Sending…" : "Send the Tip"}
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


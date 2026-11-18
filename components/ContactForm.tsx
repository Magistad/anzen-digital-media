"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type FieldName = "name" | "email" | "message";
type Errors = Partial<Record<FieldName, string>>;

const fields: { name: FieldName; id: string }[] = [
  { name: "name", id: "contact-name" },
  { name: "email", id: "contact-email" },
  { name: "message", id: "contact-message" },
];

function messageFor(name: FieldName, value: string, typeMismatch: boolean): string {
  if (name === "name" && !value.trim()) return "Enter your name.";
  if (name === "email" && (!value.trim() || typeMismatch)) return "Enter an email like you@brokerage.com.";
  if (name === "message" && !value.trim()) return "Enter a message.";
  return "";
}

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const dirty = useRef(false);
  const warn = useRef<(event: BeforeUnloadEvent) => void>(() => {});

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const next: Errors = {};
    for (const field of fields) {
      const node = form.elements.namedItem(field.name);
      if (!(node instanceof HTMLInputElement) && !(node instanceof HTMLTextAreaElement)) continue;
      const problem = messageFor(field.name, node.value, node instanceof HTMLInputElement && node.validity.typeMismatch);
      if (problem) next[field.name] = problem;
    }
    setErrors(next);
    const first = fields.find((field) => next[field.name]);
    if (first) {
      event.preventDefault();
      document.getElementById(first.id)?.focus();
      return;
    }
    dirty.current = false;
    window.removeEventListener("beforeunload", warn.current);
    setPending(true);
  }

  return (
    <form
      className="contact-form"
      name="contact"
      method="POST"
      action="/contact?sent=1"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onInput={() => {
        dirty.current = true;
      }}
      onSubmit={onSubmit}
      noValidate={enhanced}
      aria-busy={pending}
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="contact-hp" hidden>
        <label>
          Do not fill this in
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div>
        <label htmlFor="contact-name">
          <span>Name</span>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
        </label>
        {errors.name ? (
          <p id="contact-name-error" className="field-error" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="contact-email">
          <span>Email</span>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
        </label>
        {errors.email ? (
          <p id="contact-email-error" className="field-error" role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="contact-message">
          <span>Message</span>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            autoComplete="off"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
        </label>
        {errors.message ? (
          <p id="contact-message-error" className="field-error" role="alert">
            {errors.message}
          </p>
        ) : null}
      </div>
      <button type="submit" className="hud-signin" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

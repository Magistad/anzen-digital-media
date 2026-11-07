"use client";

import { useEffect, useState } from "react";
import { LIMITS } from "../../lib/closepath-model";

function Caption({ children, bare }: { children: string; bare?: boolean }) {
  return <span className={bare ? "sr-only" : "block text-[12px] leading-none text-paper/45"}>{children}</span>;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  maxLength = LIMITS.text,
  autoComplete = "off",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <Caption>{label}</Caption>
      <input
        id={id}
        className="book-input mt-1 text-[15px]"
        type={type}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function AreaField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <Caption>{label}</Caption>
      <textarea
        id={id}
        className="book-input mt-1 text-[15px]"
        value={value}
        maxLength={LIMITS.notes}
        rows={2}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  bare = false,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  bare?: boolean;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <Caption bare={bare}>{label}</Caption>
      <select
        id={id}
        className={`book-input text-[15px] ${bare ? "" : "mt-1"}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DateField({
  id,
  label,
  value,
  onChange,
  bare = false,
}: {
  id: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  bare?: boolean;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <Caption bare={bare}>{label}</Caption>
      <input
        id={id}
        className={`book-input text-[15px] ${bare ? "" : "mt-1"}`}
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </label>
  );
}

function parseLoose(value: string): number | null {
  const cleaned = value.replace(/[$,%\s]/g, "");
  if (!cleaned) return null;
  const next = Number(cleaned);
  if (!Number.isFinite(next) || next < 0) return null;
  return next;
}

function NumberField({
  id,
  label,
  value,
  onChange,
  max,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  max?: number;
}) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value === null ? "" : String(value));
  }, [focused, value]);

  return (
    <label htmlFor={id} className="block min-w-0">
      <Caption>{label}</Caption>
      <input
        id={id}
        className="book-input mt-1 text-[15px] tabular-nums"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const next = parseLoose(text);
          const capped = next !== null && max !== undefined && next > max ? null : next;
          onChange(capped);
          setText(capped === null ? "" : String(capped));
        }}
        onChange={(event) => setText(event.target.value)}
      />
    </label>
  );
}

export function MoneyField(props: {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return <NumberField {...props} />;
}

export function PercentField(props: {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return <NumberField {...props} max={100} />;
}

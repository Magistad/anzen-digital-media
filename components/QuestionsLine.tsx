import Link from "next/link";

export function QuestionsLine({ className = "" }: { className?: string }) {
  return (
    <div className={`max-w-md text-sm leading-snug text-paper/75 ${className}`}>
      <p>
        Questions?{" "}
        <a className="text-link" href="mailto:contact@anzendigitalmedia.com">
          contact@anzendigitalmedia.com
        </a>
      </p>
      <nav aria-label="Legal" className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Link className="text-link" href="/terms">
          Terms
        </Link>
        <Link className="text-link" href="/privacy">
          Privacy
        </Link>
        <Link className="text-link" href="/refunds">
          Refunds
        </Link>
      </nav>
    </div>
  );
}

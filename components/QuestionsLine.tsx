import Link from "next/link";

const linkClass = "text-paper/80 transition-colors duration-300 hover:text-paper";

export function QuestionsLine({ className = "" }: { className?: string }) {
  return (
    <p className={`max-w-md text-sm leading-snug text-paper/60 ${className}`}>
      Questions?{" "}
      <a className={linkClass} href="mailto:contact@anzendigitalmedia.com">
        contact@anzendigitalmedia.com
      </a>
      <span className="text-paper/35" aria-hidden="true">
        {" "}
        ·{" "}
      </span>
      <Link className={linkClass} href="/terms">
        Terms
      </Link>
      <span className="text-paper/35" aria-hidden="true">
        {" "}
        ·{" "}
      </span>
      <Link className={linkClass} href="/privacy">
        Privacy
      </Link>
      <span className="text-paper/35" aria-hidden="true">
        {" "}
        ·{" "}
      </span>
      <Link className={linkClass} href="/refunds">
        Refunds
      </Link>
    </p>
  );
}

import Link from "next/link";

export function DeskCard({
  href,
  kicker,
  title,
  detail,
  meta,
}: {
  href: string;
  kicker: string;
  title: string;
  detail?: string;
  meta?: string;
}) {
  return (
    <Link href={href} className="desk-card">
      <span className="desk-card-kicker">{kicker}</span>
      <span className="desk-card-title">{title}</span>
      {detail ? <span className="desk-card-detail">{detail}</span> : null}
      {meta ? <span className="desk-card-meta">{meta}</span> : null}
    </Link>
  );
}

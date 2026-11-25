import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_PAGE } from "../../../lib/service-copy";

export const metadata: Metadata = {
  title: FAQ_PAGE.title,
  description: FAQ_PAGE.description,
  openGraph: { title: FAQ_PAGE.title, description: FAQ_PAGE.description, url: "/faq" },
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <main id="content" className="desk-shell">
      <div className="desk-frame">
        <p className="desk-kicker">
          <Link href="/services">Services</Link>
        </p>
        <h1 className="desk-title">{FAQ_PAGE.title}</h1>
        <p className="desk-lead">{FAQ_PAGE.lead}</p>
        <dl className="faq-list">
          {FAQ_PAGE.items.map((item) => (
            <div key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}

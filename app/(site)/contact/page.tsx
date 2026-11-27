import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "../../../components/ContactForm";

const description = "Send a note to Anzen Digital Media.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  openGraph: {
    title: "Contact",
    description,
    url: "/contact",
  },
};

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { sent?: string | string[] };
}) {
  const sent = searchParams?.sent === "1" || (Array.isArray(searchParams?.sent) && searchParams.sent[0] === "1");

  return (
    <main id="content" className="relative min-h-[100svh] overflow-hidden px-4 pb-16 pt-[calc(7rem+env(safe-area-inset-top))] font-display text-paper sm:px-8">
      <div className="section-art-bleed" data-slot="contact" aria-hidden="true">
        <picture>
          <source srcSet="/brand/section-contact.webp" type="image/webp" />
          <img src="/brand/section-contact.jpg" alt="" width={2400} height={1356} decoding="async" />
        </picture>
      </div>
      <div className="glass-panel relative z-[1] mr-auto w-full max-w-xl">
        <Link href="/" className="hud-tab">
          Studio
        </Link>
        <h1 className="page-title mt-8 text-[clamp(3.2rem,8vw,5.4rem)]">Contact</h1>
        {sent ? (
          <p className="contact-success" role="status">
            Message sent. We will read it.
          </p>
        ) : (
          <ContactForm />
        )}
      </div>
    </main>
  );
}

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
    <main id="content" className="brand-wash min-h-[100svh] bg-black px-4 pb-16 pt-12 font-display text-paper sm:px-8 md:pt-16">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/" className="hud-tab">
          Studio
        </Link>
        <h1 className="hud-releases-title mt-8">Contact</h1>
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

import type { Metadata } from "next";
import Link from "next/link";

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
    <main id="content" className="bg-black px-4 pb-16 pt-12 font-display text-paper sm:px-8 md:pt-16">
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
          <form
            className="contact-form"
            name="contact"
            method="POST"
            action="/contact?sent=1"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="contact-hp" hidden>
              <label>
                Do not fill this in
                <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>
            <label>
              <span>Name</span>
              <input name="name" type="text" required autoComplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              <span>Message</span>
              <textarea name="message" required rows={6} />
            </label>
            <button type="submit" className="hud-signin">
              Send
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

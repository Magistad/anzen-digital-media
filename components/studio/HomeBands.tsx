import Link from "next/link";
import { CLOSEPATH_OFFER } from "../../lib/closepath";
import { ArtPicture } from "./ArtPicture";

function offerLine(text: string) {
  return text.replace(/(\d+)\s+(days)/g, "$1\u00a0$2");
}

export function HomeBands() {
  return (
    <>
      <section className="home-band home-band-projects" aria-labelledby="home-projects">
        <ArtPicture
          slot="projects"
          webp="/brand/section-projects.webp"
          jpg="/brand/section-projects.jpg"
          width={2400}
          height={1356}
          className="home-band-art"
        />
        <div className="home-band-shade" aria-hidden="true" />
        <div className="frame home-band-copy">
          <h2 id="home-projects" className="home-band-title">
            Projects
          </h2>
          <p>
            Small apps from the studio. Open a live one, or read what is still on the bench.
          </p>
          <Link href="/projects" className="home-band-link">
            Projects
          </Link>
        </div>
      </section>

      <section className="home-band home-band-closepath" aria-labelledby="home-closepath">
        <ArtPicture
          slot="closepath"
          webp="/brand/section-closepath.webp"
          jpg="/brand/section-closepath.jpg"
          width={2400}
          height={1356}
          className="home-band-art"
        />
        <div className="home-band-shade" aria-hidden="true" />
        <div className="frame home-band-copy">
          <h2 id="home-closepath" className="home-band-title" translate="no">
            Closepath
          </h2>
          <p>Never lose a deal to a missed date. {offerLine(CLOSEPATH_OFFER)}</p>
          <Link href="/products/closepath" className="home-band-link">
            Closepath
          </Link>
        </div>
      </section>

      <section className="home-band home-band-gaming" aria-labelledby="home-gaming">
        <div className="frame home-band-copy">
          <h2 id="home-gaming" className="home-band-title">
            Gaming
          </h2>
          <p>Notes on games we play and watch.</p>
          <Link href="/gaming" className="home-band-link">
            Gaming
          </Link>
        </div>
      </section>

      <section className="home-band home-band-contact" aria-labelledby="home-contact">
        <ArtPicture
          slot="contact"
          webp="/brand/section-contact.webp"
          jpg="/brand/section-contact.jpg"
          width={2400}
          height={1356}
          className="home-band-art"
        />
        <div className="home-band-shade" aria-hidden="true" />
        <div className="frame home-band-copy">
          <h2 id="home-contact" className="home-band-title">
            Contact
          </h2>
          <p>Send a note to Anzen Digital Media.</p>
          <Link href="/contact" className="home-band-link">
            Contact
          </Link>
        </div>
      </section>

      <footer className="hud-foot home-legal">
        <nav aria-label="Legal" className="hud-legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
        </nav>
      </footer>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="frame py-10 text-sm tracking-[-0.01em] text-paper/60 md:py-14">
      <p>Anzen Digital Media LLC</p>
      <p className="mt-2">
        Questions go to{" "}
        <a
          href="mailto:contact@anzendigitalmedia.com"
          className="text-paper/80 transition-colors duration-300 hover:text-paper"
        >
          contact@anzendigitalmedia.com
        </a>
        .
      </p>
    </footer>
  );
}

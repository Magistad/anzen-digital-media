/**
 * One source of truth for who publishes the site and who writes for it.
 * AI search tools trust a brand more when the same short description shows
 * up word for word on the site, in structured data, and in every social bio.
 * Change the wording here, then copy it to the bios. Do not paraphrase it.
 *
 * Anzen Digital Media is the publisher. LUNCHBRK is Javier Segura's creator
 * persona and the author of the gaming pieces.
 */

export const SITE_ORIGIN = "https://anzendigitalmedia.com";

export const PUBLISHER = {
  id: `${SITE_ORIGIN}/#organization`,
  name: "Anzen Digital Media",
  legalName: "Anzen Digital Media LLC",
  url: SITE_ORIGIN,
  email: "contact@anzendigitalmedia.com",
  description:
    "Anzen Digital Media LLC is a Las Vegas media company run by Javier Segura. It publishes gaming, business, tech, and money guides and sells three research services.",
} as const;

/** The only public LUNCHBRK profile. */
export const LUNCHBRK_TWITCH = "https://www.twitch.tv/lunchbrk";

export const LUNCHBRK_AVATAR = {
  jpg: "/images/lunchbrk-avatar.jpg",
  webp: "/images/lunchbrk-avatar.webp",
  width: 1024,
  height: 768,
  alt: "LUNCHBRK avatar",
} as const;

export const CREATOR = {
  id: `${SITE_ORIGIN}/about#lunchbrk`,
  personName: "Javier Segura",
  handle: "LUNCHBRK",
  url: `${SITE_ORIGIN}/about`,
  description:
    "LUNCHBRK is Javier Segura's gaming channel. He plays, tests, and writes the gaming guides for Anzen Digital Media.",
  sameAs: [LUNCHBRK_TWITCH],
} as const;

export const FOUNDER_PORTRAIT = {
  jpg: "/images/javier-segura.jpg",
  webp: "/images/javier-segura.webp",
  width: 1600,
  height: 904,
  alt: "Javier Segura, founder of Anzen Digital Media",
} as const;

/** Bylines written as either name resolve to the same person. */
export function isCreatorByline(author: string): boolean {
  const name = author.trim().toLowerCase();
  return name === CREATOR.personName.toLowerCase() || name === CREATOR.handle.toLowerCase();
}

export function creatorByline(): string {
  return `${CREATOR.handle} (${CREATOR.personName})`;
}

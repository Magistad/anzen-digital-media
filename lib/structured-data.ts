import { CREATOR, FOUNDER_PORTRAIT, PUBLISHER, SITE_ORIGIN, isCreatorByline } from "./identity";

type Node = Record<string, unknown>;

const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

export function organizationNode(): Node {
  return {
    "@type": "Organization",
    "@id": PUBLISHER.id,
    name: PUBLISHER.name,
    legalName: PUBLISHER.legalName,
    url: PUBLISHER.url,
    email: PUBLISHER.email,
    description: PUBLISHER.description,
    address: { "@type": "PostalAddress", addressLocality: "Las Vegas", addressRegion: "NV", addressCountry: "US" },
    founder: { "@id": CREATOR.id },
  };
}

export function founderImage(): Node {
  return {
    "@type": "ImageObject",
    url: `${SITE_ORIGIN}${FOUNDER_PORTRAIT.jpg}`,
    width: FOUNDER_PORTRAIT.width,
    height: FOUNDER_PORTRAIT.height,
    caption: FOUNDER_PORTRAIT.alt,
  };
}

export function creatorNode(): Node {
  return {
    "@type": "Person",
    "@id": CREATOR.id,
    name: CREATOR.personName,
    alternateName: CREATOR.handle,
    url: CREATOR.url,
    description: CREATOR.description,
    image: founderImage(),
    sameAs: [...CREATOR.sameAs],
    worksFor: { "@id": PUBLISHER.id },
  };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: PUBLISHER.name,
    url: SITE_ORIGIN,
    publisher: { "@id": PUBLISHER.id },
  };
}

/** Sitewide graph: who publishes, who writes, and the site itself. */
export function siteGraph(): Node {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), creatorNode(), websiteNode()],
  };
}

export type ArticleInput = {
  title: string;
  excerpt: string;
  href: string;
  date: string;
  updated: string | null;
  author: string;
  game: string | null;
  steamAppId: string | null;
};

/** Article markup. It only states what the page already shows. */
export function articleGraph(post: ArticleInput): Node {
  const url = `${SITE_ORIGIN}${post.href}`;
  const author = isCreatorByline(post.author)
    ? {
        "@id": CREATOR.id,
        "@type": "Person",
        name: CREATOR.personName,
        alternateName: CREATOR.handle,
        url: CREATOR.url,
        image: founderImage(),
      }
    : { "@type": "Person", name: post.author };

  const article: Node = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt || undefined,
    url,
    mainEntityOfPage: url,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author,
    publisher: { "@id": PUBLISHER.id },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en-US",
  };

  if (post.game) {
    const store = post.steamAppId ? `https://store.steampowered.com/app/${post.steamAppId}/` : undefined;
    article.about = {
      "@type": "VideoGame",
      name: post.game,
      ...(store ? { url: store, sameAs: store } : {}),
    };
  }

  return { "@context": "https://schema.org", ...article };
}

/** Safe to drop into a script tag: no closing tags can break out. */
export function serializeJsonLd(data: Node): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

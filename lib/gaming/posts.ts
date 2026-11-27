import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { draftsArePublic } from "./drafts";
import { sectionBySlug, type GamingSection } from "./sections";

const CONTENT_DIR = path.join(process.cwd(), "content", "gaming");

export type GamingPostMeta = {
  slug: string;
  title: string;
  date: string;
  author: string;
  section: string;
  excerpt: string;
  draft: boolean;
  todo: string | null;
  steamAppId: string | null;
  /** Optional plain game name, used for the VideoGame part of the article markup. */
  game: string | null;
  /** Optional last real update, YYYY-MM-DD. Only set it when facts changed. */
  updated: string | null;
  href: string;
};

export type GamingPost = GamingPostMeta & {
  content: string;
  sectionName: string;
};

type Frontmatter = {
  title?: unknown;
  slug?: unknown;
  date?: unknown;
  author?: unknown;
  section?: unknown;
  excerpt?: unknown;
  draft?: unknown;
  todo?: unknown;
  steamAppId?: unknown;
  game?: unknown;
  updated?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asDateString(value: unknown): string {
  if (typeof value === "string") return value.trim().slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

function asBool(value: unknown): boolean {
  return value === true || value === "true";
}

function readAllSource(): GamingPost[] {
  let files: string[] = [];
  try {
    files = readdirSync(CONTENT_DIR).filter((name) => name.endsWith(".mdx"));
  } catch {
    return [];
  }

  const posts = files.map((file) => {
    const raw = readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const parsed = matter(raw);
    const data = parsed.data as Frontmatter;
    const slug = asString(data.slug) || file.replace(/\.mdx$/, "");
    const section = asString(data.section);
    const known = sectionBySlug(section);
    if (!asString(data.title) || !asDateString(data.date) || !asString(data.author) || !known) {
      throw new Error(`Invalid gaming post frontmatter in ${file}`);
    }
    return {
      slug,
      title: asString(data.title),
      date: asDateString(data.date),
      author: asString(data.author),
      section,
      sectionName: known.name,
      excerpt: asString(data.excerpt),
      draft: asBool(data.draft),
      todo: asString(data.todo) || null,
      steamAppId: asString(data.steamAppId) || null,
      game: asString(data.game) || null,
      updated: asDateString(data.updated) || null,
      href: `/gaming/${slug}`,
      content: parsed.content,
    } satisfies GamingPost;
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function listPosts(options?: { includeDrafts?: boolean }): GamingPostMeta[] {
  const includeDrafts = options?.includeDrafts ?? draftsArePublic();
  return readAllSource()
    .filter((post) => includeDrafts || !post.draft)
    .map(({ content: _content, sectionName: _sectionName, ...meta }) => meta);
}

export function listPostsInSection(
  section: string,
  options?: { includeDrafts?: boolean },
): GamingPostMeta[] {
  return listPosts(options).filter((post) => post.section === section);
}

export function getPost(slug: string, options?: { includeDrafts?: boolean }): GamingPost | undefined {
  const includeDrafts = options?.includeDrafts ?? draftsArePublic();
  const post = readAllSource().find((item) => item.slug === slug);
  if (!post) return undefined;
  if (post.draft && !includeDrafts) return undefined;
  return post;
}

export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function sectionOf(slug: string): GamingSection | undefined {
  return sectionBySlug(slug);
}

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { draftsArePublic } from "./gaming/drafts";
import { verticalById, type VerticalId } from "./verticals";

export type DeskId = Exclude<VerticalId, "gaming">;

export type DeskPostMeta = {
  vertical: DeskId;
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  draft: boolean;
  href: string;
};

export type DeskPost = DeskPostMeta & {
  content: string;
};

type Frontmatter = {
  title?: unknown;
  slug?: unknown;
  date?: unknown;
  author?: unknown;
  excerpt?: unknown;
  draft?: unknown;
};

const DESKS: readonly DeskId[] = ["business", "tech", "money"];

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

function readDesk(vertical: DeskId): DeskPost[] {
  const dir = path.join(process.cwd(), "content", vertical);
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((name) => name.endsWith(".mdx"));
  } catch {
    return [];
  }

  return files.map((file) => {
    const raw = readFileSync(path.join(dir, file), "utf8");
    const parsed = matter(raw);
    const data = parsed.data as Frontmatter;
    const slug = asString(data.slug) || file.replace(/\.mdx$/, "");
    if (!asString(data.title) || !asDateString(data.date) || !asString(data.author) || !verticalById(vertical)) {
      throw new Error(`Invalid ${vertical} post frontmatter in ${file}`);
    }
    return {
      vertical,
      slug,
      title: asString(data.title),
      date: asDateString(data.date),
      author: asString(data.author),
      excerpt: asString(data.excerpt),
      draft: asBool(data.draft),
      href: `/${vertical}/${slug}`,
      content: parsed.content,
    } satisfies DeskPost;
  });
}

function readAll(): DeskPost[] {
  return DESKS.flatMap((desk) => readDesk(desk)).sort(
    (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  );
}

export function listDeskPosts(vertical: DeskId, options?: { includeDrafts?: boolean }): DeskPostMeta[] {
  const includeDrafts = options?.includeDrafts ?? draftsArePublic();
  return readAll()
    .filter((post) => post.vertical === vertical)
    .filter((post) => includeDrafts || !post.draft)
    .map(({ content: _content, ...meta }) => meta);
}

export function latestDeskPost(vertical: DeskId): DeskPostMeta | undefined {
  return listDeskPosts(vertical, { includeDrafts: false })[0];
}

export function getDeskPost(
  vertical: DeskId,
  slug: string,
  options?: { includeDrafts?: boolean },
): DeskPost | undefined {
  const includeDrafts = options?.includeDrafts ?? draftsArePublic();
  const post = readAll().find((item) => item.vertical === vertical && item.slug === slug);
  if (!post) return undefined;
  if (post.draft && !includeDrafts) return undefined;
  return post;
}

export function formatDeskDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

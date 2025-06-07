/* ----------------------------------------------------------------
   getBlogPosts.ts – reads Markdown/MDX from content/blog
   • Returns: front-matter + serialised MDX ready for rendering
   ---------------------------------------------------------------- */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  serialize,
  MDXRemoteSerializeResult,
} from 'next-mdx-remote/serialize';

export interface BlogPost {
  slug: string;
  front: {
    title: string;
    date: string;
    tags: string[];
    affiliate: string;
    logo: string;
  };
  mdxSource: MDXRemoteSerializeResult;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, '');
      const fullPath = path.join(BLOG_DIR, file);
      const { data, content } = matter.read(fullPath);

      const mdxSource = await serialize(content);

      return {
        slug,
        front: data as BlogPost['front'],
        mdxSource,
      };
    })
  );

  // newest first
  return posts.sort(
    (a, b) =>
      new Date(b.front.date).getTime() - new Date(a.front.date).getTime()
  );
}

/* ----------------------------------------------------------------
   getAffiliates.ts  –  reads Markdown files from content/affiliates
   ---------------------------------------------------------------- */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Affiliate {
  slug: string;
  title: string;
  logo: string;
  url: string;
  category: string;
}

const AFFILIATE_DIR = path.join(process.cwd(), 'content', 'affiliates');

export default function getAffiliates(): Affiliate[] {
  if (!fs.existsSync(AFFILIATE_DIR)) return [];

  const files = fs.readdirSync(AFFILIATE_DIR).filter((f) => f.endsWith('.md'));
  return files.map((filename) => {
    const filePath = path.join(AFFILIATE_DIR, filename);
    const { data } = matter.read(filePath);

    return {
      slug: filename.replace(/\.md$/, ''),
      title: data.title || 'Unnamed',
      logo: data.logo || '',
      url: data.url || '',
      category: data.category || '',
    } as Affiliate;
  });
}

/* ----------------------------------------------------------------
   FeaturedArticlesGrid – shows the three newest blog posts
   ---------------------------------------------------------------- */
import Link from 'next/link';
import Image from 'next/image';
import { Noto_Sans } from 'next/font/google';
import { getAllPosts } from '@/lib/getBlogPosts';

const noto = Noto_Sans({ subsets: ['latin'], display: 'swap' });

export default async function FeaturedArticlesGrid() {
  const posts = (await getAllPosts()).slice(0, 3);   // newest three

  if (posts.length === 0) return null;

  return (
    <section className={`${noto.className} max-w-5xl mx-auto px-4 py-12`}>
      <h2 className="text-2xl font-semibold text-center mb-6 text-[--ink]">
        Featured&nbsp;Articles
      </h2>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {posts.map((p) => (
          <li key={p.slug} className="bg-white/10 p-4 rounded-xl backdrop-blur">
            <Link href={`/blog/${p.slug}`} className="block group">
              <div className="relative w-full aspect-video mb-3">
                {p.front.logo && (
                  <Image
                    src={p.front.logo}
                    alt={p.front.title}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <h3 className="text-sm font-medium group-hover:text-[--hinomaru] text-center">
                {p.front.title}
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

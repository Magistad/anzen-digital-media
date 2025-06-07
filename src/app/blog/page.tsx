/* ----------------------------------------------------------------
   /blog – lists all posts, titles centred, Noto Sans font
   ---------------------------------------------------------------- */
import Link from 'next/link';
import { getAllPosts } from '@/lib/getBlogPosts';
import { Noto_Sans } from 'next/font/google';

const noto = Noto_Sans({ subsets: ['latin'], display: 'swap' });

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <section
      className={`${noto.className} max-w-4xl mx-auto px-4 py-20 text-[--ink]`}
    >
      <h1 className="text-3xl font-semibold text-center mb-10">
        Featured&nbsp;Articles
      </h1>

      <ul className="space-y-8">
        {posts.map((p) => (
          <li key={p.slug} className="bg-white/10 p-6 rounded-xl backdrop-blur">
            <Link href={`/blog/${p.slug}`} className="block group">
              <h2 className="text-xl font-medium group-hover:text-[--hinomaru]">
                {p.front.title}
              </h2>
              <p className="text-xs opacity-70 mt-1">
                {new Date(p.front.date).toLocaleDateString()} &nbsp;|&nbsp;{' '}
                {p.front.tags.join(', ')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

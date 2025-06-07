/* ----------------------------------------------------------------
   /blog/[slug] – renders a single MDX post
   ---------------------------------------------------------------- */
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts } from '@/lib/getBlogPosts';
import { Noto_Sans } from 'next/font/google';

const noto = Noto_Sans({ subsets: ['latin'], display: 'swap' });

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) notFound();

  return (
    <article
      className={`${noto.className} max-w-3xl mx-auto px-4 py-20 text-[--ink]`}
    >
      <h1 className="text-3xl font-semibold mb-4">{post.front.title}</h1>
      <p className="text-xs opacity-70 mb-8">
        {new Date(post.front.date).toLocaleDateString()} ·{' '}
        {post.front.tags.join(', ')}
      </p>

      <MDXRemote source={post.mdxSource} />
    </article>
  );
}

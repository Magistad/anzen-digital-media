import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return {
    title: decodeURIComponent(params.slug),
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const decodedSlug = decodeURIComponent(params.slug);

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">{decodedSlug}</h1>
      <p>This blog post was automatically generated for: {decodedSlug}</p>
    </main>
  );
}








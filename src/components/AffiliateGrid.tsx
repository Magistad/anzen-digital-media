/* ----------------------------------------------------------------
   AffiliateGrid  –  displays all affiliate cards in a centered grid
   ---------------------------------------------------------------- */
import Image from 'next/image';
import getAffiliates from '@/lib/getAffiliates';

export default function AffiliateGrid() {
  const affiliates = getAffiliates();

  if (affiliates.length === 0) {
    return null;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold mb-6 text-[--ink] text-center">
        Featured AI Tools
      </h2>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {affiliates.map((a) => (
          <li key={a.slug} className="group text-center">
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/10 p-4 rounded-xl backdrop-blur
                         transition hover:bg-white/20"
            >
              {a.logo && (
                <div className="relative w-full aspect-video mb-3">
                  <Image
                    src={a.logo}
                    alt={a.title}
                    fill
                    className="object-contain"
                    sizes="(max-width:768px) 100vw, 200px"
                  />
                </div>
              )}
              <p className="text-sm font-medium text-[--ink]">{a.title}</p>
              <p className="text-xs opacity-70">{a.category}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

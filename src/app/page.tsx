/* ----------------------------------------------------------------
   Home page – full-screen video background + Affiliate grid + footer
   ---------------------------------------------------------------- */
import Image from 'next/image';
import AffiliateGrid from '@/components/AffiliateGrid';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      {/* Full-screen background video */}
      <div className="fixed inset-0 -z-10">
        <video
          src="/bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Centered hero */}
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Anzen logo */}
        <div className="relative w-60 h-24 mb-6">
          <Image
            src="/anzen-logo.png"
            alt="Anzen Digital Media"
            fill
            sizes="240px"
            className="object-contain"
            priority
          />
        </div>

        <p className="animate-bounce text-sm opacity-80 text-[--ink]">scroll</p>
      </main>

      {/* Affiliate grid */}
      <AffiliateGrid />

      {/* Footer */}
      <Footer />
    </>
  );
}




/* ----------------------------------------------------------------
   Home page – full-screen video background + Affiliate grid + footer
   ---------------------------------------------------------------- */
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
        <h1 className="font-serif text-4xl md:text-6xl tracking-wide mb-6 text-[--ink]">
          <span className="inline-block border-b-4 border-[--hinomaru] pb-1">
            Anzen&nbsp;Digital&nbsp;Media
          </span>
        </h1>

        <p className="animate-bounce text-sm opacity-80 text-[--ink]">scroll</p>
      </main>

      {/* NEW – Affiliate grid */}
      <AffiliateGrid />

      {/* Footer */}
      <Footer />
    </>
  );
}



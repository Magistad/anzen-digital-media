/* ----------------------------------------------------------------
   Home page – minimalist hero with centered looping MP4
   ---------------------------------------------------------------- */
import Image from 'next/image';   // still useful for later pages
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-black text-[--ink]">
        {/* Logotype */}
        <h1 className="font-serif text-4xl md:text-6xl tracking-wide mb-6">
          <span className="inline-block border-b-4 border-[--hinomaru] pb-1">
            Anzen&nbsp;Digital&nbsp;Media
          </span>
        </h1>

        {/* Hero video */}
        <div className="relative w-full max-w-lg aspect-[3/4] mb-10">
          <video
            src="/hero.mp4"     /* file lives in /public */
            autoPlay
            muted
            loop
            playsInline
            className="object-cover rounded-2xl shadow-lg w-full h-full"
          />
        </div>

        {/* Scroll cue */}
        <p className="animate-bounce text-sm opacity-80">scroll</p>
      </main>

      {/* Footer grid (will be created in the next step) */}
      <Footer />
    </>
  );
}

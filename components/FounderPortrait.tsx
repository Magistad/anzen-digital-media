import { ArtPicture } from "./studio/ArtPicture";
import { FOUNDER_PORTRAIT } from "../lib/identity";

export function FounderPortrait({ priority = false, className = "" }: { priority?: boolean; className?: string }) {
  return (
    <figure className={`founder-portrait ${className}`.trim()}>
      <ArtPicture
        webp={FOUNDER_PORTRAIT.webp}
        jpg={FOUNDER_PORTRAIT.jpg}
        width={FOUNDER_PORTRAIT.width}
        height={FOUNDER_PORTRAIT.height}
        slot="founder"
        alt={FOUNDER_PORTRAIT.alt}
        priority={priority}
      />
    </figure>
  );
}

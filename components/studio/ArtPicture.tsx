type ArtPictureProps = {
  webp: string;
  jpg: string;
  width: number;
  height: number;
  slot: string;
  alt?: string;
  priority?: boolean;
  className?: string;
};

export function ArtPicture({
  webp,
  jpg,
  width,
  height,
  slot,
  alt = "",
  priority = false,
  className,
}: ArtPictureProps) {
  return (
    <picture className={className} data-slot={slot}>
      <source srcSet={webp} type="image/webp" />
      <img
        src={jpg}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}

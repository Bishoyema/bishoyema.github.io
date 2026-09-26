import { imageUrl, type ImageAsset } from "@/data/media";
import { cn } from "@/lib/site";

type Props = {
  image: ImageAsset;
  /** Standard `sizes` attribute describing the rendered width. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Load immediately with high priority (above-the-fold imagery only). */
  priority?: boolean;
  /** Override the asset's alt text. Pass "" for decorative use. */
  alt?: string;
};

/**
 * AVIF → WebP → JPEG picture with explicit dimensions, so the browser reserves
 * space before the image arrives (no layout shift) and picks the smallest file.
 */
export function ResponsiveImage({ image, sizes, className, imgClassName, priority = false, alt }: Props) {
  const srcSet = (format: "avif" | "webp") =>
    image.widths.map((width) => `${imageUrl(image, format, width)} ${width}w`).join(", ");

  return (
    <picture className={cn("block", className)}>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={imageUrl(image, "jpg")}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        style={image.focus ? { objectPosition: image.focus } : undefined}
        className={cn("block h-full w-full object-cover", imgClassName)}
      />
    </picture>
  );
}

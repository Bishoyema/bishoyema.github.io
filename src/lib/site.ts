/**
 * Public URL of the deployed site, used for canonical links, sitemap and social previews.
 * Set NEXT_PUBLIC_SITE_URL to your custom domain once you have one.
 * On Vercel the production URL is picked up automatically.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "https://bishoyema.github.io";
}

export const siteUrl = resolveSiteUrl();

export const siteTitle = "Bishoy Emad | AI Creative & Digital Marketing";

export const siteDescription =
  "AI Creative and Digital Marketing portfolio featuring AI video production, advertising creatives, social media content, marketing automation and digital experiences.";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

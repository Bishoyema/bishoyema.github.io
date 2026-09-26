export type Service = {
  title: string;
  description: string;
  includes: string[];
  /** Where to see an example on this site, when one exists. */
  example?: { label: string; href: string };
};

export const serviceList: Service[] = [
  {
    title: "AI Video Production",
    description: "AI-powered commercials, short-form content, product videos and brand storytelling.",
    includes: ["Commercials", "Product videos", "Brand films", "Reels"],
    example: { label: "Watch the brand film", href: "/#showreel" },
  },
  {
    title: "AI Ad Creatives",
    description: "High-impact visual concepts and advertising creatives designed for social media campaigns.",
    includes: ["Key visuals", "Ad variants", "Headlines"],
    example: { label: "See the ad work", href: "/work/impactx-brand-launch/" },
  },
  {
    title: "Social Media Content",
    description: "Creative posts, reels concepts, campaign assets and branded social media content.",
    includes: ["Post series", "Reels concepts", "Campaign assets"],
    example: { label: "See a launch series", href: "/work/impactx-ai-video-launch/" },
  },
  {
    title: "Digital Marketing",
    description: "Content strategy, campaign thinking, digital marketing execution and optimization.",
    includes: ["Content strategy", "Campaign planning", "Optimization"],
  },
  {
    title: "AI Automation",
    description: "Simple marketing and business workflows powered by AI and automation.",
    includes: ["Auto-replies", "Lead follow-up", "Workflows"],
  },
  {
    title: "Landing Pages & AI Websites",
    description: "Modern landing pages and websites designed to support campaigns, services and lead generation.",
    includes: ["Landing pages", "Campaign pages", "Lead capture"],
  },
];

export type Reason = { title: string; body: string };

export const reasons: Reason[] = [
  {
    title: "Creative thinking",
    body: "Every piece starts from one idea you can say in a sentence, like “Your ads aren’t failing. Your ideas are.” Clear ideas are what make people stop.",
  },
  {
    title: "Marketing knowledge",
    body: "Google-certified in digital marketing and e-commerce. Content is planned for the platform and built to be tested, which is why launch posts come in A/B pairs.",
  },
  {
    title: "AI-powered production",
    body: "No crews, studios or locations to book, so budgets go further and there is room to test more versions.",
  },
  {
    title: "Commercial experience",
    body: "Six years in beauty and skincare sales, 100+ accounts for L’Oréal brands and three Best Achiever awards in a row. I know the difference between content that looks good and content that sells.",
  },
  {
    title: "Understanding of customers",
    body: "Years of face-to-face conversations taught me what customers doubt, ask and need to hear before they buy. That shapes every script and headline.",
  },
  {
    title: "Fast content production",
    body: "No shoots to schedule and no reshoots to book. Concepts, variants and changes turn around in days, not weeks.",
  },
];

export type VideoFormat = { title: string; note: string; example?: { label: string; href: string } };

export const videoFormats: VideoFormat[] = [
  { title: "AI commercials", note: "Scripted spots with a hook, a clear message and a call to action." },
  {
    title: "Product videos",
    note: "Texture, variants and line-ups that make a product easy to understand and want.",
    example: { label: "Skincare launch ad", href: "/work/skincare-launch-ad/" },
  },
  { title: "Social media ads", note: "Vertical cuts for Reels, TikTok and Stories, with variants ready to test." },
  {
    title: "Brand films",
    note: "Short stories that introduce a brand, its character and what it offers.",
    example: { label: "ImpactX brand film", href: "/work/impactx-brand-film/" },
  },
  { title: "Short-form content", note: "Recurring clips that keep a feed active between campaigns." },
  { title: "Creative concepts", note: "Ideas and visual directions to agree on before anything is produced." },
];

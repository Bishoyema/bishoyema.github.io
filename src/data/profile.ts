/**
 * Personal details and site-wide copy.
 * Facts here come from the uploaded files (the previous one-page site) and the brief.
 */

export const profile = {
  name: "Bishoy Emad",
  role: "AI Creative & Digital Marketing Freelancer",
  location: "Dubai, UAE",
  timezone: "GST, UTC+4",
  availability: "Available for projects",
  intro:
    "I create AI-powered videos, digital campaigns, social content and marketing experiences designed to capture attention and help brands stand out.",

  email: "peshoyemad43@gmail.com",
  /** International format, digits only (used for wa.me links). */
  whatsapp: "971562397680",
  linkedin: "https://www.linkedin.com/in/beshoy-emad-1063b02a9",

  /** TODO: add a CV (e.g. "/Bishoy-Emad-CV.pdf" in /public) to show a "Download CV" button. */
  cvUrl: undefined as string | undefined,
};

export const services = [
  "AI Video Production",
  "AI Ad Creatives",
  "Social Media Content",
  "Digital Marketing",
  "AI Automation",
  "Landing Pages",
];

export const about = {
  heading: ["Creative work, made by", "someone who has", "sold."],
  paragraphs: [
    "I spent six years selling beauty, skincare and dermocosmetics across the UAE and Egypt, including 100+ pharmacy, clinic and hospital accounts for L’Oréal’s La Roche-Posay, Vichy and CeraVe.",
    "That is where I learned how customers think: what makes them stop, what they doubt, and what finally makes them buy. Now I bring that into AI video, ad creatives and digital campaigns, work that is made to sell, not just to look good.",
  ],
  stats: [
    { value: "6+", unit: "years", label: "in beauty, skincare and dermocosmetics sales, UAE and Egypt" },
    { value: "100+", unit: "accounts", label: "pharmacies, clinics and hospitals managed for L’Oréal brands" },
    { value: "3×", unit: "Best Achiever", label: "at L’Oréal, three years in a row, 2021 to 2023" },
  ],
  understands: [
    "Customer psychology",
    "Product presentation",
    "Sales communication",
    "Beauty & skincare consumers",
    "Brand positioning",
  ],
  building: [
    "Digital Marketing",
    "AI Content Creation",
    "AI Video",
    "Social Media",
    "E-commerce",
    "Marketing Automation",
    "Data Analysis",
  ],
};

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${profile.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${profile.email}${query ? `?${query}` : ""}`;
}

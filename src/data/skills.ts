/**
 * Tools and capabilities. Only items supported by the uploaded files or the brief.
 * No proficiency levels on purpose.
 */

export const toolGroups = [
  { group: "AI creation", tools: ["Higgsfield", "ChatGPT", "Claude"] },
  { group: "Design", tools: ["Canva"] },
  { group: "Data & reporting", tools: ["Excel", "Power BI"] },
];

export const capabilityGroups = [
  {
    group: "Creative",
    items: ["AI video production", "AI image & ad creatives", "Scriptwriting", "Copywriting & headlines", "Art direction", "Character & mascot design"],
  },
  {
    group: "Marketing",
    items: ["Social media content", "Campaign concepts & A/B variants", "Digital marketing", "E-commerce", "Marketing automation"],
  },
  {
    group: "Commercial",
    items: ["Customer psychology", "Product presentation", "Sales communication", "Key account management", "Sales reporting & data analysis"],
  },
];

export type Certification = {
  name: string;
  issuer: string;
  /** TODO (Bishoy): add the public credential URL to show a "Verify" link. */
  url?: string;
};

export const certifications: Certification[] = [
  { name: "Digital Marketing & E-commerce", issuer: "Google" },
  { name: "Social Media Marketing", issuer: "Meta" },
];

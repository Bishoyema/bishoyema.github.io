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

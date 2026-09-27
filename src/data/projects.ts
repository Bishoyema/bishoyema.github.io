import { films, images, social, stills, type FilmAsset, type ImageAsset } from "./media";

/**
 * Selected work.
 *
 * Copy rules this file follows:
 * - Everything described is visible in the work itself or stated in the uploaded files.
 * - No invented clients, metrics, reach or results.
 * - Self-initiated work is labelled "Concept Project".
 * - No tools, software or production process are described anywhere.
 */

export type ProjectType = "Brand Campaign" | "Concept Project";

export type StoryboardFrame = {
  time: string;
  seconds: number;
  title: string;
  note: string;
  still: ImageAsset;
};

export type Variant = {
  label: string;
  title: string;
  note: string;
  image: ImageAsset;
};

export type Project = {
  slug: string;
  title: string;
  /** The line the creative is built around, when there is one. */
  line?: string;
  category: string;
  tags: string[];
  type: ProjectType;
  brand: string;
  brandNote?: string;
  summary: string;
  format: string;
  cover: ImageAsset;
  film?: FilmAsset;
  /** Where the hover preview starts in the teaser, matching the cover frame (seconds). */
  previewStart?: number;
  variants?: Variant[];
  /** Show every variant on the home page as one full-width gallery card, so the work is visible without a click. */
  gallery?: boolean;
  storyboard?: StoryboardFrame[];
  caseStudy: {
    challenge: string;
    approach: string;
    execution: string[];
    deliverables: string[];
    result: string;
  };
  disclaimer?: string;
};

export const projects: Project[] = [
  {
    slug: "skincare-social-campaign",
    title: "Hive, Light & Cell",
    category: "Social Media",
    tags: ["Social Media", "AI Ad Creative", "Beauty"],
    type: "Concept Project",
    brand: "Independent concept",
    brandNote: "Not affiliated with the brands shown",
    summary:
      "Six Instagram and Facebook posts for three skincare brands, Beesline, La Roche-Posay and Bioderma, made as spec work. Each brand gets two opposite concepts, each with its own hook, copy and call to action.",
    format: "6 social posts · 4:5 portrait",
    cover: social.beeslineA,
    gallery: true,
    variants: [
      {
        label: "Beesline · A",
        title: "Liquid Gold",
        note: "Hero collection. The three serums float in honey-gold light under “Liquid Gold, Three Ways.”",
        image: social.beeslineA,
      },
      {
        label: "Beesline · B",
        title: "Find Your Serum",
        note: "Problem to solution. Each skin concern sits above its serum, from morning to night.",
        image: social.beeslineB,
      },
      {
        label: "La Roche-Posay · A",
        title: "400nm",
        note: "UV science hero. One sunbeam on a white plinth, and a spectrum that runs all the way to 400nm.",
        image: social.lrpA,
      },
      {
        label: "La Roche-Posay · B",
        title: "Shield Up",
        note: "Lifestyle. Hard midday sun, a deep blue sky and “Sun’s out. Shield up.”",
        image: social.lrpB,
      },
      {
        label: "Bioderma · A",
        title: "Down to the Cell",
        note: "Scientific. The bottle inside a clear sphere, like a cell membrane, with the four aggressors named below.",
        image: social.biodermaA,
      },
      {
        label: "Bioderma · B",
        title: "Salt. Sun. Shielded.",
        note: "Summer lifestyle. A top-down beach flat lay styled in Bioderma’s navy, white and yellow.",
        image: social.biodermaB,
      },
    ],
    caseStudy: {
      challenge:
        "Create two feed posts each for three skincare brands, a serum trio and two SPF50+ fluids, that look like agency campaigns, keep every bottle and label true to the real product, and give each brand its own character.",
      approach:
        "Two opposite ideas per brand: one hero or science-led post, and one lifestyle or problem-to-solution post. Each brand takes its look from its own packaging: honey gold for Beesline, clinical white and orange for La Roche-Posay, and navy, white and yellow for Bioderma.",
      execution: [
        "Beesline: the three serums float as a hero set in one post, and stand on colour-matched steps from morning to night in the other.",
        "La Roche-Posay: a sunbeam and a UV spectrum explain ultra-long UVA protection, and a sun-drenched lifestyle shot turns exposure into “Shield up”.",
        "Bioderma: a clear sphere carries the brand’s cell-level protection idea, and a beach flat lay takes the same product into summer.",
        "Every hook is short, every call to action is different, and every claim comes from the brands’ own product pages.",
      ],
      deliverables: [
        "6 feed posts (4:5, 1080 × 1350) for Instagram and Facebook",
        "Hooks, on-image copy and calls to action",
        "Captions and placement notes for each post",
      ],
      result:
        "A ready-to-post set that shows two directions per brand, from premium hero shots to lifestyle and routine content, with each product shown as it really looks.",
    },
    disclaimer:
      "Concept project. Independent spec work, not commissioned by or affiliated with Beesline, La Roche-Posay or Bioderma. Product names and packaging belong to their owners.",
  },
  {
    slug: "impactx-brand-film",
    title: "ImpactX Brand Film",
    category: "AI Video",
    tags: ["AI Video", "Brand Film", "Character Design"],
    type: "Brand Campaign",
    brand: "ImpactX",
    brandNote: "AI creative agency, Dubai",
    summary:
      "A 50-second vertical film that introduces a new Dubai creative agency, told through the character who fronts it.",
    format: "Vertical film · 9:16 · 0:50",
    cover: stills.brand[3],
    film: films.brand,
    previewStart: 3.8,
    storyboard: [
      { time: "0:00", seconds: 0, title: "The problem", note: "A business owner, his store, and a post that isn’t landing.", still: stills.brand[0] },
      { time: "0:10", seconds: 10.1, title: "Enter the mascot", note: "The ImpactX character appears behind him.", still: stills.brand[1] },
      { time: "0:17", seconds: 16.8, title: "The reveal", note: "A close-up introduces the character.", still: stills.brand[2] },
      { time: "0:20", seconds: 20.1, title: "The services", note: "Strategy, content, media buying, AI automation, AI video and growth, in neon.", still: stills.brand[3] },
      { time: "0:30", seconds: 30.2, title: "Automation", note: "An automated chat conversation plays out on glass.", still: stills.brand[4] },
      { time: "0:36", seconds: 35.8, title: "AI video", note: "A wall of AI-generated video content.", still: stills.brand[5] },
      { time: "0:40", seconds: 40.25, title: "The close", note: "A package offer on the desk, then the ImpactX logo.", still: stills.brand[6] },
    ],
    caseStudy: {
      challenge:
        "Open a new AI creative agency’s Instagram and paid social launch with one film: explain what the agency does, give it a face people remember, and make it without a camera crew or studio.",
      approach:
        "Tell it as a story, not a service list. The film opens on a business owner whose posts aren’t working, then brings in the ImpactX mascot as the answer: a character the brand can reuse on every channel.",
      execution: [
        "One character kept consistent across close-ups, wide shots and motion-graphics scenes.",
        "Neon interface graphics carry the service list, a live chat automation and a wall of AI video content.",
        "The film closes on a package offer and the ImpactX logo.",
      ],
      deliverables: ["50-second vertical brand film (9:16)", "Mascot character for the brand", "Built for Instagram and paid social"],
      result:
        "A single film that introduces the agency, its six services and its mascot in under a minute, part of the ImpactX launch alongside the poster series.",
    },
  },
  {
    slug: "skincare-launch-ad",
    title: "Skincare Launch Ad",
    category: "AI Video",
    tags: ["AI Video", "Product Ad", "Beauty"],
    type: "Concept Project",
    brand: "Independent concept",
    brandNote: "Not affiliated with the brand shown",
    summary:
      "A 26-second vertical product ad for a blemish-patch range, made as a spec piece to show what AI product video can do for beauty brands.",
    format: "Vertical film · 9:16 · 0:26",
    cover: stills.skincare[4],
    film: films.skincare,
    previewStart: 6.9,
    storyboard: [
      { time: "0:00", seconds: 0, title: "Texture", note: "A macro of the patch on a fingertip shows size and finish first.", still: stills.skincare[0] },
      { time: "0:05", seconds: 4.9, title: "The Original", note: "First variant, in red.", still: stills.skincare[1] },
      { time: "0:10", seconds: 10, title: "Invisible+", note: "Second variant, in blue.", still: stills.skincare[2] },
      { time: "0:16", seconds: 15.95, title: "Face", note: "Third variant, in orange, patches in the foreground.", still: stills.skincare[3] },
      { time: "0:21", seconds: 21.35, title: "The line-up", note: "The full range under “Your blemish hero”.", still: stills.skincare[4] },
    ],
    caseStudy: {
      challenge:
        "Show a skincare product clearly and make it feel premium in under 30 seconds, the kind of spot a beauty brand runs in launch week, without a studio shoot.",
      approach:
        "Lead with the product itself. A macro shot of a patch on a fingertip shows size and texture first; then each variant gets its own moment before the full range closes on the brand line.",
      execution: [
        "A clean, high-key studio look with soft reflections: the visual language of premium skincare.",
        "Three variants, The Original, Invisible+ and Face, introduced one at a time, each with its own colour.",
        "It ends on the full line-up under the line “Your blemish hero”.",
      ],
      deliverables: ["26-second vertical product ad (9:16)", "Sized for Reels, TikTok and Stories"],
      result:
        "A complete product spot that shows how AI can deliver studio-style product video for beauty and e-commerce brands, without a shoot.",
    },
    disclaimer:
      "Concept project. Independent spec work, not commissioned by or affiliated with the brand shown. Product names and packaging belong to their owner.",
  },
  {
    slug: "serum-launch-reel",
    title: "Serum Launch Reel",
    category: "AI Video",
    tags: ["AI Video", "Launch Reel", "Beauty"],
    type: "Concept Project",
    brand: "Independent concept",
    brandNote: "Not affiliated with the brand shown",
    summary:
      "A 20-second vertical launch reel for a luxury anti-aging serum, made as a spec piece: a lit product reveal, the dropper moment, then the brand’s reported results as bold on-screen claims.",
    format: "Vertical film · 9:16 · 0:20",
    cover: stills.serumReel[2],
    film: films.serumReel,
    previewStart: 5.6,
    storyboard: [
      { time: "0:00", seconds: 0, title: "The reveal", note: "The bottle turns in mid-air as light flares across its cap.", still: stills.serumReel[0] },
      { time: "0:05", seconds: 4.75, title: "The label", note: "A slow push in on the label.", still: stills.serumReel[1] },
      { time: "0:08", seconds: 8, title: "The dropper", note: "A single drop falls into the open bottle, with the first result: 83% firmer skin.", still: stills.serumReel[2] },
      { time: "0:11", seconds: 10.55, title: "Radiance", note: "The second result: 87% more radiant skin.", still: stills.serumReel[3] },
      { time: "0:13", seconds: 12.75, title: "Fine lines", note: "The third result: 83% smoother fine lines, each one credited to the brand on screen.", still: stills.serumReel[4] },
      { time: "0:15", seconds: 14.67, title: "The close", note: "The serum on a lit pedestal, “The cell longevity serum”, then the parent company’s logo.", still: stills.serumReel[5] },
    ],
    caseStudy: {
      challenge:
        "Launch a premium anti-aging serum on Reels in 20 seconds: make the bottle feel luxurious, show how it is used, and land the brand’s key results before the viewer scrolls on.",
      approach:
        "Treat the bottle like jewellery, then back it up. The reel opens on a slow reveal and a close-up of the label, turns on the dropper moment, and gives the second half to three results, each on screen long enough to read.",
      execution: [
        "A deep blue and violet studio, with light flaring across the cap as the bottle turns.",
        "A single drop falls into the open bottle while the results appear one at a time: 83% firmer skin, 87% more radiant skin, 83% smoother fine lines.",
        "Each result is credited on screen as reported by the brand.",
        "It closes on the serum, the line “The cell longevity serum” and the parent company’s logo, cut to an energetic soundtrack.",
      ],
      deliverables: ["20-second vertical launch reel (9:16)", "On-screen claims and end card", "Sized for Reels, TikTok and Stories"],
      result:
        "A launch-ready reel that gives a premium skincare product a studio-quality reveal and its proof points in 20 seconds, without a shoot.",
    },
    disclaimer:
      "Concept project. Independent spec work, not commissioned by or affiliated with the brand shown. Product names, packaging and the results shown on screen belong to, and are reported by, their owner.",
  },
  {
    slug: "serum-ingredient-film",
    title: "Serum Ingredient Film",
    category: "AI Video",
    tags: ["AI Video", "Product Film", "Beauty"],
    type: "Concept Project",
    brand: "Independent concept",
    brandNote: "Not affiliated with the brand shown",
    summary:
      "A 15-second vertical product film for a luxury anti-aging serum, made as a spec piece: a rush along rows of bottles, macro details and the dropper, then the formula’s key ingredients called out on screen.",
    format: "Vertical film · 9:16 · 0:15",
    cover: stills.serumIngredients[0],
    film: films.serumIngredients,
    previewStart: 1.25,
    storyboard: [
      { time: "0:00", seconds: 0, title: "Row rush", note: "The camera races along rows of bottles and lands on one in focus.", still: stills.serumIngredients[0] },
      { time: "0:02", seconds: 2.17, title: "Macro", note: "Up close on the base of the bottle and its “Care first.” signature.", still: stills.serumIngredients[1] },
      { time: "0:04", seconds: 4.25, title: "The dropper", note: "Serum flows from the dropper into the neck of the bottle.", still: stills.serumIngredients[2] },
      { time: "0:05", seconds: 5.38, title: "Age Proteom™", note: "The bottle lands on stone. First callout: a patented snow-bacteria extract that protects skin proteins.", still: stills.serumIngredients[3] },
      { time: "0:08", seconds: 8.45, title: "Cellular Water", note: "Second callout: patented, and made to mimic the water in our skin cells.", still: stills.serumIngredients[4] },
      { time: "0:11", seconds: 10.95, title: "The formula", note: "Also in the formula: sodium acetylated hyaluronate, adenosine, glycerin and tocopherol.", still: stills.serumIngredients[5] },
      { time: "0:13", seconds: 12.9, title: "The close", note: "The product name, then the parent company’s logo.", still: stills.serumIngredients[6] },
    ],
    caseStudy: {
      challenge:
        "Explain what is inside a science-led serum in 15 seconds, and keep it as desirable as a fragrance ad while doing it.",
      approach:
        "Earn attention first, then explain. The film opens fast along a row of bottles, slows into macro details and the dropper, and only then brings in the formula, one callout at a time.",
      execution: [
        "A warm set of sunlit stone and cream tones, a contrast to the night-time studio of the launch reel.",
        "Macro shots of the bottle’s base and the dropper show off the materials and the texture of the serum.",
        "Three callouts name what is in the formula: the patented Age Proteom™ biotechnology, Cellular Water and the supporting ingredients.",
        "It ends on the product name and the parent company’s logo.",
      ],
      deliverables: ["15-second vertical product film (9:16)", "Ingredient callouts and end card", "Sized for Reels, TikTok and Stories"],
      result:
        "A product film that turns an ingredient list into something people watch, made as a companion to the Serum Launch Reel.",
    },
    disclaimer:
      "Concept project. Independent spec work, not commissioned by or affiliated with the brand shown. Product names, packaging and ingredient names belong to their owner.",
  },
  {
    slug: "impactx-brand-launch",
    title: "Your Ads Aren’t Failing",
    line: "Your ads aren’t failing. Your ideas are.",
    category: "Advertising",
    tags: ["Advertising", "Copywriting", "AI Creative"],
    type: "Brand Campaign",
    brand: "ImpactX",
    brandNote: "AI creative agency, Dubai",
    summary:
      "The opening post of the ImpactX launch. It speaks directly to business owners who keep spending on ads without results.",
    format: "Social post · 3:4 portrait",
    cover: images.keyVisual,
    caseStudy: {
      challenge:
        "Launch a new agency on Instagram with a first post that makes business owners stop scrolling, and show from day one that this agency thinks differently.",
      approach:
        "Say the uncomfortable thing. The headline turns the usual complaint, “my ads don’t work”, into a diagnosis: the problem is the idea, not the ad. The mascot gives the line its attitude.",
      execution: [
        "A two-line headline in white and red, readable in a second.",
        "The mascot at a desk, fist on the table, with the Burj Khalifa at night to place the brand in Dubai.",
        "Signed off with the ImpactX logo and the line “See beyond the obvious”.",
      ],
      deliverables: ["Brand launch key visual", "Headline and copy", "Mascot character"],
      result:
        "The opening post of the ImpactX launch, and the visual template for the service launches that followed.",
    },
  },
  {
    slug: "impactx-ai-video-launch",
    title: "30 Days of Content. Zero Cameras.",
    line: "30 days of content. Zero cameras.",
    category: "Social Media",
    tags: ["Social Media", "AI Ad Creative", "A/B Variants"],
    type: "Brand Campaign",
    brand: "ImpactX",
    brandNote: "AI creative agency, Dubai",
    summary:
      "Launch posts for ImpactX’s AI video service, in two variants for testing: one product-led, one lifestyle-led.",
    format: "2 social posts · 3:4 portrait",
    cover: images.aiVideoA,
    variants: [
      {
        label: "Variant A",
        title: "Product-led",
        note: "Watch, car, fashion, fitness and food frames, with a more energetic mascot.",
        image: images.aiVideoA,
      },
      {
        label: "Variant B",
        title: "Lifestyle-led",
        note: "Softer lines like “Stronger today.” and “Bigger dreams.” for a broader audience.",
        image: images.aiVideoB,
      },
    ],
    caseStudy: {
      challenge:
        "Announce a new AI video service and make the benefit obvious at a glance: a steady flow of video content, without a production crew.",
      approach:
        "Turn the promise into a picture. The mascot is surrounded by floating vertical video frames, each one a different kind of content a business could post. The headline does the maths.",
      execution: [
        "Variant A is product-led: watch, car, fashion, fitness and food frames around a more energetic mascot.",
        "Variant B is lifestyle-led, with softer lines for a broader audience.",
        "Both keep the same headline and sign-off, so the client can test which direction performs.",
      ],
      deliverables: ["2 launch posts for A/B testing", "Headline and on-image copy"],
      result: "A ready-to-test pair of posts for the launch of the AI video service.",
    },
  },
  {
    slug: "impactx-ai-automation-launch",
    title: "Your Business Doesn’t Sleep",
    line: "Your business doesn’t sleep. Why does your marketing?",
    category: "AI Automation",
    tags: ["AI Automation", "Social Media", "A/B Variants"],
    type: "Brand Campaign",
    brand: "ImpactX",
    brandNote: "AI creative agency, Dubai",
    summary:
      "Launch posts that make marketing automation concrete: a customer message answered and a table booked at 22:47, with nobody at the desk.",
    format: "2 social posts · 3:4 portrait",
    cover: images.automationA,
    variants: [
      {
        label: "Variant A",
        title: "Full conversation",
        note: "The whole exchange, timestamped from 22:47 to 22:50, for readers who want detail.",
        image: images.automationA,
      },
      {
        label: "Variant B",
        title: "Four steps",
        note: "Message, auto-reply, booking, follow-up, running 24/7. Built for faster reading.",
        image: images.automationB,
      },
    ],
    caseStudy: {
      challenge:
        "Explain marketing automation, an invisible and technical service, to business owners in a single image.",
      approach:
        "Show it working at night. The headline sets up the tension, and a glass interface shows an automated conversation handling a restaurant booking, from first message to confirmation to follow-ups.",
      execution: [
        "Variant A shows the full conversation, timestamped from 22:47 to 22:50.",
        "Variant B reduces it to four steps, plus “Running 24/7”, for faster reading.",
        "The Dubai skyline at night carries through from the rest of the series.",
      ],
      deliverables: ["2 launch posts for A/B testing", "Headline and interface copy"],
      result: "Launch visuals that turn an abstract service into a story anyone can follow in a few seconds.",
    },
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

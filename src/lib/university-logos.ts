/**
 * Bundled official logos (from Wikimedia Commons / Wikipedia), keyed by university slug.
 * Used when a university has no logo set in the admin panel.
 */
export const UNIVERSITY_LOGOS: Record<string, string> = {
  "acibadem-university": "/images/universities/acibadem-university.png",
  "altinbas-university": "/images/universities/altinbas-university.png",
  "atlas-university": "/images/universities/atlas-university.png",
  "bahcesehir-university": "/images/universities/bahcesehir-university.png",
  "bilkent-university": "/images/universities/bilkent-university.png",
  "istanbul-arel-university": "/images/universities/istanbul-arel-university.png",
  "istanbul-aydin-university": "/images/universities/istanbul-aydin-university.png",
  "istanbul-kent-university": "/images/universities/istanbul-kent-university.png",
  "istanbul-medipol-university": "/images/universities/istanbul-medipol-university.png",
  "istinye-university": "/images/universities/istinye-university.png",
  "yeditepe-university": "/images/universities/yeditepe-university.gif",
};

export const logoFor = (u: { slug: string; logo?: string | null }) => u.logo || UNIVERSITY_LOGOS[u.slug] || null;

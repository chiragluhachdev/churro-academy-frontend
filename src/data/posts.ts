export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  category: "Technique" | "Recipes" | "Ingredients" | "Behind the Scenes";
  author: string;
  /** ISO date — formatted at render time. */
  date: string;
  readingMinutes: number;
  featured?: boolean;
}

const cover = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;

export const posts: Post[] = [
  {
    id: "1",
    title: "Why Your Ganache Splits (And How to Bring It Back)",
    slug: "why-your-ganache-splits",
    excerpt:
      "Split ganache is an emulsion problem, not a chocolate problem. Here's what's actually happening, and the two-minute fix that rescues it.",
    cover: cover("photo-1578985545062-69928b1d9587"),
    category: "Technique",
    author: "Chef Simone",
    date: "2026-08-04",
    readingMinutes: 6,
    featured: true,
  },
  {
    id: "2",
    title: "Reading Macaron Batter by Feel, Not by Ribbon Count",
    slug: "reading-macaron-batter",
    excerpt:
      "Everyone tells you to fold until the batter falls in a ribbon. That advice fails more macarons than it saves. Try this instead.",
    cover: cover("photo-1558326567-98ae2405596b"),
    category: "Technique",
    author: "Chef Simone",
    date: "2026-07-28",
    readingMinutes: 8,
    featured: true,
  },
  {
    id: "3",
    title: "A Starter Schedule for People With Jobs",
    slug: "sourdough-starter-schedule",
    excerpt:
      "You don't need to feed a starter twice a day forever. A realistic maintenance routine for bakers who leave the house.",
    cover: cover("photo-1549413468-cd78edb7e75c"),
    category: "Technique",
    author: "Chef Simone",
    date: "2026-07-19",
    readingMinutes: 7,
  },
  {
    id: "4",
    title: "Butter, Explained: Fat Content and Why It Matters",
    slug: "butter-fat-content-explained",
    excerpt:
      "The difference between 80% and 82% butter is not marketing. In laminated dough it decides whether your layers survive the roll.",
    cover: cover("photo-1555507036-ab1f4038808a"),
    category: "Ingredients",
    author: "Chef Simone",
    date: "2026-07-11",
    readingMinutes: 5,
  },
  {
    id: "5",
    title: "The Churro Dough We Tested Forty Times",
    slug: "the-churro-dough-we-tested",
    excerpt:
      "Ridge depth, resting time, oil temperature. What changed between batch one and batch forty, and what actually mattered.",
    cover: cover("photo-1624371414361-e670edf4898d"),
    category: "Behind the Scenes",
    author: "Chef Simone",
    date: "2026-06-30",
    readingMinutes: 9,
  },
  {
    id: "6",
    title: "Three Cookies From One Dough",
    slug: "three-cookies-one-dough",
    excerpt:
      "Chewy, crisp and cakey are the same dough with three variables moved. Here's the map.",
    cover: cover("photo-1499636136210-6f4ee915583e"),
    category: "Recipes",
    author: "Chef Simone",
    date: "2026-06-22",
    readingMinutes: 6,
  },
  {
    id: "7",
    title: "Stop Cracking Your Cheesecake",
    slug: "stop-cracking-your-cheesecake",
    excerpt:
      "Cracks are a cooling problem far more often than a baking one. Four habits that fix it permanently.",
    cover: cover("photo-1533134242443-d4fd215305ad"),
    category: "Technique",
    author: "Chef Simone",
    date: "2026-06-14",
    readingMinutes: 5,
  },
  {
    id: "8",
    title: "Tempering Chocolate Without a Marble Slab",
    slug: "tempering-without-marble",
    excerpt:
      "Seeding works in a home kitchen, needs no special equipment, and is far more forgiving than tabling. Step by step.",
    cover: cover("photo-1606890737304-57a1ca8a5b62"),
    category: "Technique",
    author: "Chef Simone",
    date: "2026-06-02",
    readingMinutes: 7,
  },
  {
    id: "9",
    title: "What We Look For When Filming a Lesson",
    slug: "how-we-film-lessons",
    excerpt:
      "Hands in frame, no jump cuts through the hard part, and mistakes left in. Why our lessons are shot the way they are.",
    cover: cover("photo-1527515545081-5db817172677"),
    category: "Behind the Scenes",
    author: "Chef Simone",
    date: "2026-05-25",
    readingMinutes: 4,
  },
];

export function getFeaturedPost(): Post {
  return posts.find((post) => post.featured) ?? posts[0];
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

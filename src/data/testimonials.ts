import { courses } from "@/data/courses";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  avatar: string;
  rating: number;
  course?: string;
  /** Longer write-up, shown on the success-stories page. */
  story?: string;
  location?: string;
}

const avatar = (id: string) =>
  `https://images.unsplash.com/${id}?w=160&h=160&fit=crop&crop=faces&q=80&auto=format`;

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "The churros course was a game changer. My family can't stop asking for more.",
    name: "Ananya S.",
    location: "Pune",
    avatar: avatar("photo-1544005313-94ddf0286df2"),
    rating: 5,
    course: "Churros From Scratch",
    story:
      "I'd tried churros twice before and both times they came out raw in the middle. The section on oil temperature explained exactly why. I now make them most weekends, and my sister has started selling them at her cafe.",
  },
  {
    id: "2",
    quote:
      "Clear instructions, beautiful recipes and Chef Simone is genuinely encouraging.",
    name: "Ritvik M.",
    location: "Bengaluru",
    avatar: avatar("photo-1507003211169-0a1dd7228f2d"),
    rating: 5,
    course: "Chocolate Cake Mastery",
    story:
      "I came in having never baked a cake that wasn't from a box. The ganache lesson alone was worth it — I finally understand why mine used to split.",
  },
  {
    id: "3",
    quote:
      "I've tried many baking courses, but this is by far the best structured one.",
    name: "Mehak K.",
    location: "Delhi",
    avatar: avatar("photo-1580489944761-15a19d654956"),
    rating: 5,
    course: "Macaron Perfection",
    story:
      "Macarons broke me for a year. The troubleshooting module named the exact problem I had — under-mixed batter, not oven temperature like everyone told me. Third batch after that was perfect.",
  },
  {
    id: "4",
    quote:
      "Finally learned to bake a cheesecake that actually looks professional.",
    name: "Sneha T.",
    location: "Mumbai",
    avatar: avatar("photo-1531123897727-8f129e1688ce"),
    rating: 5,
    course: "Cheesecake Secrets",
    story:
      "The water bath section changed everything. No more cracks. I've made the basque version six times now and it's become the thing people ask me to bring.",
  },
  {
    id: "5",
    quote: "The sourdough module finally made fermentation click for me.",
    name: "Karan D.",
    location: "Chandigarh",
    avatar: avatar("photo-1500648767791-00dcc994a43e"),
    rating: 5,
    course: "Artisan Sourdough",
    story:
      "I'd been feeding a starter for months with nothing to show for it. Learning to read the dough instead of watching the clock was the missing piece.",
  },
  {
    id: "6",
    quote: "Worth it for the buttercream section alone.",
    name: "Priya N.",
    location: "Hyderabad",
    avatar: avatar("photo-1438761681033-6461ffad8d80"),
    rating: 5,
    course: "Cupcakes & Buttercream",
  },
  {
    id: "7",
    quote: "Lessons are short enough to actually finish after work.",
    name: "Aditya R.",
    location: "Kolkata",
    avatar: avatar("photo-1494790108377-be9c29b29330"),
    rating: 4,
    course: "Cookie Craft",
  },
  {
    id: "8",
    quote:
      "The croissant course is genuinely advanced. It respects your time and your intelligence.",
    name: "Farah A.",
    location: "Ahmedabad",
    avatar: avatar("photo-1544005313-94ddf0286df2"),
    rating: 5,
    course: "Croissants & Laminated Doughs",
    story:
      "I've read three books on lamination. Watching someone actually do the turns, at normal speed, with the mistakes left in, taught me more than all of them.",
  },
  {
    id: "9",
    quote: "My doughnuts stopped coming out greasy after one lesson.",
    name: "Vikram J.",
    location: "Jaipur",
    avatar: avatar("photo-1507003211169-0a1dd7228f2d"),
    rating: 5,
    course: "Doughnuts & Fried Sweets",
  },
  {
    id: "10",
    quote: "Sharp edges on a layer cake, finally. I'd given up on that.",
    name: "Ishita B.",
    location: "Lucknow",
    avatar: avatar("photo-1580489944761-15a19d654956"),
    rating: 5,
    course: "Layer Cake Architecture",
  },
  {
    id: "11",
    quote: "Good value. The recipe cards get printed and used, not bookmarked.",
    name: "Rahul S.",
    location: "Indore",
    avatar: avatar("photo-1500648767791-00dcc994a43e"),
    rating: 4,
    course: "Chocolate Cake Mastery",
  },
  {
    id: "12",
    quote: "I bake for my kids now instead of buying. That's the whole review.",
    name: "Divya P.",
    location: "Kochi",
    avatar: avatar("photo-1531123897727-8f129e1688ce"),
    rating: 5,
    course: "Cookie Craft",
  },
];

/** The three fullest write-ups, used as featured stories. */
export function getFeaturedStories(): Testimonial[] {
  return testimonials.filter((t) => t.story).slice(0, 4);
}

/** Reviews for one course, matched via the course's slug. */
export function getTestimonialsByCourse(slug: string): Testimonial[] {
  const course = courses.find((entry) => entry.slug === slug);
  if (!course) return [];
  return testimonials.filter((review) => review.course === course.title);
}

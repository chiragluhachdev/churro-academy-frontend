export interface NavLink {
  label: string;
  href: string;
}

export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Chef", href: "/chef" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Blog", href: "/blog" },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "All Courses", href: "/courses" },
      { label: "Baking Basics", href: "/courses?category=basics" },
      { label: "Desserts", href: "/courses?category=desserts" },
      { label: "Bread & More", href: "/courses?category=breads" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Meet the Chef", href: "/chef" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Reviews", href: "/reviews" },
      { label: "Help Center", href: "/help" },
      { label: "FAQs", href: "/faqs" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refunds" },
    ],
  },
];

/**
 * WhatsApp contact for the floating chat button. International format with no
 * "+", spaces or dashes — wa.me requires that exact shape. (+91 8130809374)
 */
export const whatsappNumber = "918130809374";

/** Pre-filled first message, URL-encoded by the button. */
export const whatsappGreeting =
  "Hi Churro Academy! I have a question about your baking courses.";

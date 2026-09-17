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
      { label: "Success Stories", href: "/success-stories" },
      { label: "Blog", href: "/blog" },
      { label: "Reviews", href: "/reviews" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Meet the Chef", href: "/chef" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    heading: "Legal",
    links: [
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

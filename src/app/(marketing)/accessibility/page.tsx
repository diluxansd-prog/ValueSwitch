import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "ValueSwitch accessibility statement. Learn about our commitment to making our comparison service accessible to everyone.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Accessibility Statement
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            We are committed to making ValueSwitch accessible to everyone,
            regardless of ability or technology.
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <h2>Our Commitment</h2>
          <p>
            ValueSwitch is committed to ensuring digital accessibility for
            people with disabilities. We are continually improving the user
            experience for everyone, and applying the relevant accessibility
            standards.
          </p>

          <Separator className="my-8" />

          <h2>Conformance Status</h2>
          <p>
            We aim to conform to the Web Content Accessibility Guidelines (WCAG)
            2.1 at Level AA. These guidelines explain how to make web content
            more accessible for people with disabilities.
          </p>

          <Separator className="my-8" />

          <h2>Measures We Take</h2>
          <ul>
            <li>Semantic HTML markup for proper document structure</li>
            <li>Keyboard navigation support throughout the site</li>
            <li>Sufficient colour contrast ratios for text and interactive elements</li>
            <li>Alternative text for meaningful images</li>
            <li>ARIA labels for interactive components</li>
            <li>Responsive design that works across all screen sizes</li>
            <li>Focus indicators for keyboard users</li>
            <li>Skip navigation link for quick content access</li>
          </ul>

          <Separator className="my-8" />

          <h2>Known Limitations</h2>
          <p>
            While we strive for full accessibility, some areas may have
            limitations. We are actively working to address these and welcome
            your feedback.
          </p>

          <Separator className="my-8" />

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of ValueSwitch. Please
            let us know if you encounter accessibility barriers:
          </p>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:accessibility@valueswitch.co.uk">
                accessibility@valueswitch.co.uk
              </a>
            </li>
            <li>
              Phone: <a href="tel:08001234567">0800 123 4567</a>
            </li>
            <li>
              Or use our{" "}
              <Link href="/contact" className="text-[#38a169] hover:underline">
                contact form
              </Link>
            </li>
          </ul>

          <p className="mt-8 text-sm text-muted-foreground">
            This statement was last updated on 1 March 2026.
          </p>
        </div>
      </article>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ValueSwitch Privacy Policy. Learn how we collect, use and protect your personal data. We are committed to safeguarding your privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Your privacy is important to us. This policy explains how we handle
            your personal information.
          </p>
          <p className="mt-2 text-sm text-blue-200">
            Last updated: 1 March 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              We collect information you provide directly to us, as well as
              information collected automatically when you use our service.
            </p>
            <h3 className="mt-6 text-lg font-semibold">
              Information You Provide
            </h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account information:</strong>{" "}
                When you create an account, we collect your name, email address
                and password.
              </li>
              <li>
                <strong className="text-foreground">Comparison data:</strong>{" "}
                When you run a comparison, we may collect your postcode and
                service preferences to show relevant results.
              </li>
              <li>
                <strong className="text-foreground">Contact information:</strong>{" "}
                When you contact us, we collect your name, email address and any
                information you include in your message.
              </li>
              <li>
                <strong className="text-foreground">Reviews:</strong>{" "}
                If you leave a provider review, we collect the content and
                rating you submit.
              </li>
            </ul>
            <h3 className="mt-6 text-lg font-semibold">
              Information Collected Automatically
            </h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Usage data:</strong>{" "}
                Pages visited, comparisons run, features used and time spent on
                the site.
              </li>
              <li>
                <strong className="text-foreground">Device data:</strong>{" "}
                Browser type, operating system, device type and screen resolution.
              </li>
              <li>
                <strong className="text-foreground">Location data:</strong>{" "}
                Approximate location derived from your IP address.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">
              2. How We Use Your Information
            </h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>Provide, maintain and improve our comparison service</li>
              <li>
                Show you personalised comparison results based on your location
                and preferences
              </li>
              <li>
                Send you price alerts and notifications about deals matching
                your saved searches
              </li>
              <li>Process your enquiries and respond to your requests</li>
              <li>
                Analyse usage patterns to improve our service and user
                experience
              </li>
              <li>
                Prevent fraud and ensure the security of our platform
              </li>
              <li>
                Comply with legal obligations and enforce our terms of service
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">
              3. How We Share Your Information
            </h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              We do not sell your personal data to third parties. We may share
              your information with:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Service providers:</strong>{" "}
                When you choose to switch to a provider through our service, we
                share necessary information to facilitate the switch.
              </li>
              <li>
                <strong className="text-foreground">Analytics partners:</strong>{" "}
                We share anonymised, aggregated data with analytics partners to
                help us understand how our service is used.
              </li>
              <li>
                <strong className="text-foreground">Legal requirements:</strong>{" "}
                We may disclose information when required by law or to protect
                our rights and the safety of our users.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">4. Cookies</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience
              on our site. Cookies help us:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>Remember your preferences and settings</li>
              <li>Keep you signed in to your account</li>
              <li>Understand how you use our service</li>
              <li>Show you relevant comparisons based on your location</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              You can manage your cookie preferences through your browser
              settings. Please note that disabling certain cookies may affect the
              functionality of our service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">5. Your Rights</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              Under UK data protection law (UK GDPR), you have the right to:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Access:</strong> Request a
                copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-foreground">Rectification:</strong>{" "}
                Request correction of inaccurate personal data.
              </li>
              <li>
                <strong className="text-foreground">Erasure:</strong> Request
                deletion of your personal data in certain circumstances.
              </li>
              <li>
                <strong className="text-foreground">Restriction:</strong>{" "}
                Request restriction of processing of your personal data.
              </li>
              <li>
                <strong className="text-foreground">Portability:</strong>{" "}
                Request transfer of your personal data in a machine-readable
                format.
              </li>
              <li>
                <strong className="text-foreground">Objection:</strong> Object
                to processing of your personal data for direct marketing.
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@valueswitch.co.uk"
                className="text-[#1a365d] hover:underline dark:text-blue-400"
              >
                privacy@valueswitch.co.uk
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">6. Contact Us</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy or our data
              practices, please contact our Data Protection Officer:
            </p>
            <ul className="mt-3 space-y-1 text-muted-foreground">
              <li>
                Email:{" "}
                <a
                  href="mailto:privacy@valueswitch.co.uk"
                  className="text-[#1a365d] hover:underline dark:text-blue-400"
                >
                  privacy@valueswitch.co.uk
                </a>
              </li>
              <li>Phone: +44 800 688 9495</li>
              <li>
                Post: VALUESWITCH LIMITED, 6 Berkett Road, Coventry, England, CV6 4FU
              </li>
              <li>
                Company No: 17108611 (registered in England and Wales)
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              You also have the right to lodge a complaint with the Information
              Commissioner&apos;s Office (ICO) at{" "}
              <span className="text-[#1a365d] dark:text-blue-400">
                ico.org.uk
              </span>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}

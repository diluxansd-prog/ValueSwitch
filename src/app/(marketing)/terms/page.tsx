import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "ValueSwitch Terms of Service. Read our terms and conditions for using the ValueSwitch comparison platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Please read these terms carefully before using the ValueSwitch
            service.
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
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              By accessing or using the ValueSwitch website and services
              (collectively, the &ldquo;Service&rdquo;), you agree to be bound
              by these Terms of Service. If you do not agree to these terms,
              please do not use the Service.
            </p>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the
              Service after changes constitutes acceptance of the updated terms.
              We will notify registered users of material changes via email.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">2. Description of Services</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              ValueSwitch provides a free online comparison service that allows
              users to compare deals and plans from third-party providers across
              various categories including energy, broadband, mobile, insurance
              and finance.
            </p>
            <p className="text-muted-foreground">
              Our Service is provided for informational purposes only. We act as
              an intermediary to help you find suitable deals but we are not a
              provider of the products or services displayed. Any contract you
              enter into will be directly with the relevant provider.
            </p>
            <p className="text-muted-foreground">
              While we strive to ensure the accuracy of the information
              displayed, we cannot guarantee that all deals, prices and terms are
              completely up to date at all times. Providers may change their
              offers without notice.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              Some features of the Service require you to create an account. When
              creating an account, you agree to:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>Provide accurate, current and complete information</li>
              <li>
                Maintain the security of your password and account credentials
              </li>
              <li>
                Accept responsibility for all activities that occur under your
                account
              </li>
              <li>
                Notify us immediately of any unauthorised use of your account
              </li>
            </ul>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate accounts that violate
              these terms or are used for fraudulent purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">4. Comparison Data</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              The comparison results displayed on our Service are based on the
              information provided to us by third-party providers. We make
              reasonable efforts to ensure accuracy but:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                We do not guarantee that our comparisons cover all available
                deals in the market
              </li>
              <li>
                Prices and terms shown may differ from what is ultimately offered
                by the provider
              </li>
              <li>
                Availability may vary depending on your location and
                circumstances
              </li>
              <li>
                Some providers may pay us a commission when you switch through
                our Service, which is clearly disclosed
              </li>
            </ul>
            <p className="text-muted-foreground">
              You should always verify the final terms and pricing directly with
              the provider before completing a switch.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">
              5. Intellectual Property
            </h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              All content on the ValueSwitch Service, including but not limited
              to text, graphics, logos, icons, images, software and the
              compilation thereof, is the property of ValueSwitch Ltd or its
              content suppliers and is protected by UK and international
              copyright laws.
            </p>
            <p className="text-muted-foreground">
              You may not reproduce, distribute, modify, create derivative works
              of, publicly display, publicly perform, republish, download, store
              or transmit any content from our Service without our prior written
              consent, except for personal, non-commercial use.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">
              6. Limitation of Liability
            </h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, ValueSwitch Ltd shall not
              be liable for:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                Any indirect, incidental, special, consequential or punitive
                damages arising from your use of the Service
              </li>
              <li>
                Any loss or damage arising from any contract you enter into with
                a third-party provider found through our Service
              </li>
              <li>
                Any inaccuracies in the comparison data or provider information
                displayed
              </li>
              <li>
                Any interruption, suspension or termination of the Service
              </li>
              <li>
                Any unauthorised access to or use of our servers and any personal
                information stored therein
              </li>
            </ul>
            <p className="text-muted-foreground">
              Nothing in these terms excludes or limits our liability for death
              or personal injury caused by our negligence, fraud or fraudulent
              misrepresentation, or any other liability that cannot be excluded
              by law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">7. Governing Law</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              These terms are governed by the laws of England and Wales. Any
              disputes arising from or relating to these terms or the Service
              shall be subject to the exclusive jurisdiction of the courts of
              England and Wales.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold">8. Contact</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <ul className="mt-3 space-y-1 text-muted-foreground">
              <li>
                Email:{" "}
                <a
                  href="mailto:legal@valueswitch.co.uk"
                  className="text-[#1a365d] hover:underline dark:text-blue-400"
                >
                  legal@valueswitch.co.uk
                </a>
              </li>
              <li>Phone: 0800 123 4567</li>
              <li>
                Post: ValueSwitch Ltd, 123 Comparison Street, London, EC2A 1NT
              </li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FAQPageJsonLd } from "@/components/shared/json-ld";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about ValueSwitch. Learn how our comparison service works, how switching works, and how we keep your data safe.",
};

const faqs = [
  {
    question: "How does ValueSwitch comparison work?",
    answer:
      "ValueSwitch compares deals from leading UK providers across energy, broadband, mobile, insurance and finance. Simply select the category you want to compare, enter your details, and we show you the best available deals ranked by price, features and customer reviews. Our comparison engine updates regularly so you always see the latest offers.",
  },
  {
    question: "Is ValueSwitch completely free to use?",
    answer:
      "Yes, ValueSwitch is 100% free for consumers. We are funded by commissions from providers when you switch through our service. This never affects the deals we show you or the order in which they appear. You will never pay more than going direct to the provider.",
  },
  {
    question: "How does the switching process work?",
    answer:
      "Once you find a deal you like, click the 'View deal' or 'Go to provider' button. You will be taken to the provider's website to complete your switch. The process varies by category but typically takes just a few minutes. For energy, your new supplier handles everything, including contacting your old provider.",
  },
  {
    question: "Is my personal data safe with ValueSwitch?",
    answer:
      "Absolutely. We take data protection very seriously. We are fully compliant with UK GDPR and data protection regulations. Your personal information is encrypted and stored securely. We never sell your data to third parties. You can read our full privacy policy for more details.",
  },
  {
    question: "Will I lose service if I switch providers?",
    answer:
      "No. Switching providers does not mean losing your service. For energy, there is no physical change as you use the same pipes and wires. For broadband, there may be a brief transition period but most switches are seamless. Mobile number porting typically takes just one working day.",
  },
  {
    question: "How often are the deals updated?",
    answer:
      "We update our deal database regularly to ensure you see the most current offers. Energy tariffs are updated as providers release new rates. Broadband and mobile deals are refreshed daily. Insurance quotes are generated in real-time based on your details.",
  },
  {
    question: "Can I compare deals for my business?",
    answer:
      "Yes, we offer comparison services for businesses as well as households. We compare business energy, business broadband, and business finance products. Simply visit the Business category to get started with business-specific deals.",
  },
  {
    question: "What if I am currently in a contract?",
    answer:
      "You can still compare deals even if you are in a contract. We recommend comparing a few weeks before your contract ends so you are ready to switch at the best time. Some providers charge early termination fees, so check your current contract terms. We display contract lengths on all deals to help you plan.",
  },
  {
    question: "How are the comparison results ordered?",
    answer:
      "By default, results are sorted by price from lowest to highest. You can change the sort order to rank by features, customer rating, or provider trust score. Some providers pay to have their deals marked as 'Promoted', but this is always clearly labelled and does not affect the ranking of other results.",
  },
  {
    question: "What is the Trust Score?",
    answer:
      "The Trust Score is our composite rating for each provider, based on customer reviews, industry accreditations, complaint data and service quality. It gives you a quick way to assess a provider's reliability. Scores range from 1 to 5, with 5 being the highest.",
  },
  {
    question: "Can I save my comparisons and get alerts?",
    answer:
      "Yes. Create a free ValueSwitch account to save your comparisons and search preferences. You can also set up price alerts so we notify you when a deal matching your criteria drops in price. This is a great way to make sure you never miss a saving.",
  },
  {
    question: "How do I contact ValueSwitch for help?",
    answer:
      "You can reach us by email at support@valueswitch.co.uk, by phone on +44 800 688 9495 (Mon-Fri 9am-6pm, Sat 10am-4pm), or through our contact form. Our support team is happy to help with any questions about comparing, switching or using our service.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <FAQPageJsonLd faqs={faqs} />
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Everything you need to know about using ValueSwitch to compare deals
            and switch providers.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-2xl border-2 border-[#38a169]/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold">Still Have Questions?</h2>
              <p className="mt-3 text-muted-foreground">
                Our team is here to help. Get in touch and we will get back to
                you as soon as possible.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
                >
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/guides">Browse Guides</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

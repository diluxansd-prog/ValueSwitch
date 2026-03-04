import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  Wifi,
  Smartphone,
  Shield,
  PiggyBank,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how ValueSwitch helps you compare and switch providers in 4 simple steps. Save money on energy, broadband, mobile, insurance and more.",
};

const steps = [
  {
    number: 1,
    title: "Choose Your Category",
    description:
      "Select from energy, broadband, mobile, insurance, finance or business. Each category is tailored with the right filters and comparison criteria to help you find exactly what you need.",
    details: [
      "Six main comparison categories to choose from",
      "Subcategories for more specific searches",
      "Postcode-based results for energy and broadband",
      "Personalised filters for your exact needs",
    ],
  },
  {
    number: 2,
    title: "Compare Deals Side by Side",
    description:
      "Our comparison engine shows you the best deals from leading UK providers. See prices, features, contract terms and customer ratings all in one place. Sort and filter to find your perfect match.",
    details: [
      "Real-time pricing from trusted providers",
      "Sort by price, rating, or features",
      "Add up to 3 deals to your comparison basket",
      "Trust scores and verified customer reviews",
    ],
  },
  {
    number: 3,
    title: "Review Your Options",
    description:
      "Take a closer look at the deals that interest you. View detailed specifications, read reviews from real customers, and understand exactly what you are getting before you make a decision.",
    details: [
      "Detailed plan specifications and features",
      "Customer reviews and provider trust scores",
      "Full cost breakdown including setup fees",
      "Contract length and cancellation terms",
    ],
  },
  {
    number: 4,
    title: "Switch & Save",
    description:
      "Once you have found the right deal, click through to the provider to complete your switch. The process is handled by the provider and typically takes just a few minutes. Start saving straight away.",
    details: [
      "Click through to the provider's website",
      "Complete the switch in minutes",
      "Your old provider is notified automatically",
      "Start saving on your very first bill",
    ],
  },
];

const categoryExamples = [
  {
    icon: Zap,
    name: "Energy",
    example:
      "Enter your postcode, compare gas and electricity tariffs, and switch to a cheaper deal. Average saving: \u00a3312/year.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    link: "/energy",
  },
  {
    icon: Wifi,
    name: "Broadband",
    example:
      "Check speeds available at your address, compare fibre and standard broadband deals, and switch to faster, cheaper internet.",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    link: "/broadband",
  },
  {
    icon: Smartphone,
    name: "Mobile",
    example:
      "Compare SIM-only deals and phone contracts from all major networks. Find the best data, minutes and texts for your budget.",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    link: "/mobile",
  },
  {
    icon: Shield,
    name: "Insurance",
    example:
      "Get quotes for car, home, pet and travel insurance. Compare cover levels and excess amounts to find the right protection.",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    link: "/insurance",
  },
  {
    icon: PiggyBank,
    name: "Finance",
    example:
      "Compare credit cards, personal loans, mortgages and savings accounts. Find the best rates and terms for your needs.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    link: "/finance",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            How It Works
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-blue-100">
            Comparing and switching providers is simple with ValueSwitch. Follow
            these four easy steps and start saving today.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6 sm:gap-8">
              {/* Step number circle */}
              <div className="flex shrink-0 flex-col items-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1a365d] to-[#38a169] text-xl font-bold text-white shadow-lg sm:size-16 sm:text-2xl">
                  {step.number}
                </div>
                {step.number < steps.length && (
                  <div className="mt-4 h-full w-0.5 bg-gradient-to-b from-[#38a169]/40 to-transparent" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-4">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {step.title}
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {step.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#38a169]" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Examples */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              What Can You Compare?
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Explore our categories and see how much you could save
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoryExamples.map((cat) => (
              <Card
                key={cat.name}
                className="group border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${cat.bgColor} ${cat.color}`}
                    >
                      <cat.icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{cat.name}</h3>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {cat.example}
                  </p>
                  <Link
                    href={cat.link}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1a365d] transition-colors hover:text-[#38a169] dark:text-blue-400"
                  >
                    Compare {cat.name}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Start Comparing?
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Join over 2.7 million people who have saved money by switching with
            ValueSwitch.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
            >
              <Link href="/">
                Start Comparing Now
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/faq">Have Questions?</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

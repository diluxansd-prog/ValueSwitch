import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  const suggestions = [
    { label: "Compare Energy Deals", href: "/energy", description: "Find cheaper gas & electricity" },
    { label: "Compare Broadband", href: "/broadband", description: "Find faster, cheaper broadband" },
    { label: "Compare Mobile Deals", href: "/mobile", description: "SIM only & phone contracts" },
    { label: "Browse All Providers", href: "/providers", description: "See our trusted providers" },
    { label: "Read Our Guides", href: "/guides", description: "Expert money-saving advice" },
    { label: "How It Works", href: "/how-it-works", description: "Learn about ValueSwitch" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-8xl font-bold opacity-20 sm:text-9xl">404</p>
          <h1 className="-mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Sorry, we could not find the page you were looking for. It may have
            been moved, renamed, or may no longer exist.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#1a365d] hover:bg-white/90"
            >
              <Link href="/">
                <Home className="mr-2 size-4" />
                Back to Homepage
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/providers">
                <Search className="mr-2 size-4" />
                Browse Providers
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Here are some helpful links
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="group h-full border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex-1">
                    <h3 className="font-semibold transition-colors group-hover:text-[#38a169]">
                      {item.label}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-[#38a169]" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

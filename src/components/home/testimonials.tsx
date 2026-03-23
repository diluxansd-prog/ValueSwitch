import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/shared/star-rating";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number;
  saved: string;
  category: string;
}

const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Found a Vodafone 5G deal with unlimited data for way less than I was paying. The side-by-side comparison made it really easy to choose.",
    name: "Sarah M.",
    location: "Manchester",
    rating: 5,
    saved: "\u00a3168/yr on mobile",
    category: "Mobile",
  },
  {
    id: "t2",
    quote:
      "I love that ValueSwitch only shows real prices with actual affiliate links. No fake deals or made-up savings like other sites.",
    name: "James K.",
    location: "Bristol",
    rating: 5,
    saved: "\u00a3120/yr on mobile",
    category: "Mobile",
  },
  {
    id: "t3",
    quote:
      "Compared phone contracts in minutes and switched to a much better deal. The whole process was transparent and straightforward.",
    name: "Priya D.",
    location: "London",
    rating: 4.5,
    saved: "\u00a3144/yr on mobile",
    category: "Mobile",
  },
];

export function Testimonials() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What our customers say
          </h2>
          <p className="text-muted-foreground">
            Real savings from real people across the UK.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="border border-border/60 transition-all duration-200 hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                {/* Quote icon */}
                <Quote className="size-8 text-[#38a169]/20" />

                {/* Quote text */}
                <p className="text-sm leading-relaxed text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Rating */}
                <StarRating rating={testimonial.rating} size={14} showValue={false} />

                {/* Customer info */}
                <div className="border-t border-border/60 pt-4">
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>

                {/* Savings badge */}
                <div className="rounded-lg bg-[#38a169]/10 px-3 py-2">
                  <p className="text-xs font-medium text-[#38a169]">
                    Saved {testimonial.saved}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

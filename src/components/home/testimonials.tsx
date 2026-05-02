import { StarRating } from "@/components/shared/star-rating";
import { Quote, MapPin, TrendingDown, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number;
  saved: string;
  category: string;
  /** Tailwind gradient stops, used for the avatar + accent band */
  gradient: string;
  /** Light tinted background colour */
  bg: string;
  /** Quote-mark colour */
  quoteColor: string;
}

const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Found a Vodafone 5G deal with unlimited data for way less than I was paying. The side-by-side comparison made it really easy to choose.",
    name: "Sarah M.",
    location: "Manchester",
    rating: 5,
    saved: "£168/yr",
    category: "Mobile",
    gradient: "from-rose-500 to-pink-600",
    bg: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
    quoteColor: "text-rose-300",
  },
  {
    id: "t2",
    quote:
      "I love that ValueSwitch only shows real prices with actual affiliate links. No fake deals or made-up savings like other sites.",
    name: "James K.",
    location: "Bristol",
    rating: 5,
    saved: "£120/yr",
    category: "Mobile",
    gradient: "from-blue-500 to-indigo-600",
    bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    quoteColor: "text-blue-300",
  },
  {
    id: "t3",
    quote:
      "Compared phone contracts in minutes and switched to a much better deal. The whole process was transparent and straightforward.",
    name: "Priya D.",
    location: "London",
    rating: 4.5,
    saved: "£144/yr",
    category: "Mobile",
    gradient: "from-emerald-500 to-teal-600",
    bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    quoteColor: "text-emerald-300",
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function Testimonials() {
  // Aggregate "saved" — strip £ and /yr to sum the numbers
  const totalSaved = testimonials.reduce((sum, t) => {
    const n = parseInt(t.saved.replace(/[^0-9]/g, ""), 10);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <section className="relative bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 overflow-hidden">
      {/* Background flourishes */}
      <div className="absolute top-1/4 -left-32 w-72 h-72 rounded-full bg-emerald-200/30 dark:bg-emerald-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 rounded-full bg-rose-200/30 dark:bg-rose-900/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-12 text-center">
          <Badge className="mb-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
            <Heart className="size-3 mr-1 fill-current" />
            Customer feedback
          </Badge>
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Real savings from real switchers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three of our customers, three networks switched, three sets of
            cheaper monthly bills.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`group relative rounded-2xl bg-gradient-to-br ${t.bg} border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
            >
              {/* Top accent bar */}
              <div
                className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${t.gradient}`}
              />
              {/* Big background quote mark */}
              <Quote
                className={`absolute -top-2 -right-2 size-24 ${t.quoteColor} opacity-30 dark:opacity-20 pointer-events-none`}
              />

              <div className="relative flex flex-col gap-4 h-full">
                <div className="flex items-center gap-2">
                  <StarRating rating={t.rating} size={14} showValue={false} />
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                    {t.rating.toFixed(1)}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-foreground flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-white font-bold text-sm shadow-md`}
                  >
                    {initials(t.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" />
                      {t.location}
                    </p>
                  </div>
                  <div
                    className={`shrink-0 rounded-full bg-gradient-to-r ${t.gradient} text-white px-3 py-1 text-xs font-bold shadow-sm flex items-center gap-1`}
                  >
                    <TrendingDown className="size-3" />
                    {t.saved}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate savings strip */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tabular-nums">
                £{totalSaved}
              </p>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-emerald-100 mt-1">
                Total saved by these switchers
              </p>
            </div>
            <div className="sm:border-x border-white/20">
              <p className="text-3xl sm:text-4xl font-extrabold tabular-nums">
                {(
                  testimonials.reduce((s, t) => s + t.rating, 0) /
                  testimonials.length
                ).toFixed(1)}
                <span className="text-xl">/5</span>
              </p>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-emerald-100 mt-1">
                Average customer rating
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">100%</p>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-emerald-100 mt-1">
                Real prices, no fake deals
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

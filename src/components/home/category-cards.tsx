import Link from "next/link";
import { ArrowRight, Smartphone, CardSim, Building2 } from "lucide-react";

const products = [
  { name: "Phone Contracts", description: "New phone with a monthly plan", href: "/mobile/compare?subcategory=contracts", icon: Smartphone },
  { name: "SIM Only Deals", description: "Keep your phone, save on your SIM", href: "/mobile/compare?subcategory=sim-only", icon: CardSim },
  { name: "All Providers", description: "Vodafone, Talkmobile, Lebara", href: "/providers", icon: Building2 },
];

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Explore our products
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {products.map((product) => (
          <Link key={product.name} href={product.href} className="group">
            <div className="rounded-2xl border border-border/60 p-6 h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white dark:bg-slate-800/50">
              <product.icon className="size-8 text-[#1a365d] dark:text-[#48bb78] mb-3" />
              <h3 className="text-lg font-bold">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
              <span className="mt-4 flex items-center text-sm font-semibold text-[#1a365d] dark:text-[#48bb78] group-hover:underline">
                Compare deals
                <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

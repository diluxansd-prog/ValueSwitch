import { Card, CardContent } from "@/components/ui/card";

export default function EnergyLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <section className="bg-gradient-to-br from-yellow-500 via-orange-500 to-orange-600 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 h-10 w-64 rounded-full bg-white/20" />
            <div className="mb-4 h-12 w-96 rounded bg-white/20" />
            <div className="mb-8 h-6 w-80 rounded bg-white/15" />
            <div className="h-12 w-96 rounded-lg bg-white/20" />
          </div>
        </div>
      </section>
      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 flex flex-col items-center gap-3">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-5 w-48 rounded bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border border-border/60">
                <CardContent className="flex flex-col gap-4 p-6 pt-8">
                  <div className="h-5 w-32 rounded bg-muted" />
                  <div className="h-6 w-48 rounded bg-muted" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-lg bg-muted" />
                    <div className="h-12 rounded-lg bg-muted" />
                    <div className="h-12 rounded-lg bg-muted" />
                  </div>
                  <div className="flex items-end justify-between border-t pt-4">
                    <div className="h-8 w-24 rounded bg-muted" />
                    <div className="h-10 w-28 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

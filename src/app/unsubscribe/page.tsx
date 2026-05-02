import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed | ValueSwitch",
  description: "Manage your ValueSwitch email preferences.",
  robots: { index: false, follow: false },
};

interface SearchParams {
  ok?: string;
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const confirmed = sp.ok === "1";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 text-red-600"
            aria-hidden="true"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        {confirmed ? (
          <>
            <h1 className="text-2xl font-bold mb-2">You've been unsubscribed</h1>
            <p className="text-muted-foreground mb-6">
              We won't send you any more marketing emails. If this was a mistake, you can re-subscribe anytime from the homepage.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Manage your subscription</h1>
            <p className="text-muted-foreground mb-6">
              The unsubscribe link in your email contains a one-click confirmation token. If you arrived here directly, please use the link in any ValueSwitch email.
            </p>
          </>
        )}

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
        >
          Back to ValueSwitch
        </Link>
      </div>
    </div>
  );
}

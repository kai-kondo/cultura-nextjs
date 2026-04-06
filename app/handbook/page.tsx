

"use client";

import Link from "next/link";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function HandbookIndexPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">
            Handbook
          </h1>
          <p className="text-gray-600">
            Practical guides to help both Au Pairs and Host Families build great
            relationships.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Au Pair */}
          <Link
            href="/handbook/au-pair"
            className="group rounded-3xl border border-orange-100 p-6 transition hover:shadow-md"
          >
            <div className="space-y-3">
              <span className="text-sm text-orange-500">For Au Pairs</span>
              <h2 className="text-xl font-semibold text-slate-900 group-hover:text-orange-600">
                Au Pair Handbook
              </h2>
              <p className="text-sm text-gray-600">
                Learn how to adjust to a new country, communicate with your host
                family, and make the most of your experience.
              </p>
            </div>
          </Link>

          {/* Host Family */}
          <Link
            href="/handbook/host-family"
            className="group rounded-3xl border border-orange-100 p-6 transition hover:shadow-md"
          >
            <div className="space-y-3">
              <span className="text-sm text-orange-500">
                For Host Families
              </span>
              <h2 className="text-xl font-semibold text-slate-900 group-hover:text-orange-600">
                Host Family Handbook
              </h2>
              <p className="text-sm text-gray-600">
                Prepare your home, set expectations, and build a positive and
                respectful relationship with your au pair.
              </p>
            </div>
          </Link>
        </div>
      </main>

      {/* Mobile Nav */}
      <MobileBottomNav activeScreen="home" onNavigate={() => {}} />
    </div>
  );
}
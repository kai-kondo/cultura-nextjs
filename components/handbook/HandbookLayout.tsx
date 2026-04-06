

"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Home } from "lucide-react";
import { ReactNode } from "react";

interface HandbookNavItem {
  title: string;
  href: string;
  description?: string;
}

interface HandbookLayoutProps {
  title: string;
  description: string;
  audienceLabel?: string;
  eyebrow?: string;
  children: ReactNode;
  navItems?: HandbookNavItem[];
  currentPath?: string;
}

export function HandbookLayout({
  title,
  description,
  audienceLabel,
  eyebrow = "Handbook",
  children,
  navItems = [],
  currentPath,
}: HandbookLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/home"
            className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 transition-colors hover:bg-white hover:text-orange-600"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <ChevronRight className="h-4 w-4 text-gray-400" />

          <Link
            href="/handbook"
            className="rounded-full bg-white/70 px-3 py-1.5 transition-colors hover:bg-white hover:text-orange-600"
          >
            Handbook
          </Link>

          {audienceLabel ? (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="rounded-full bg-white/70 px-3 py-1.5 text-gray-700">
                {audienceLabel}
              </span>
            </>
          ) : null}
        </nav>

        <div className="overflow-hidden rounded-[28px] border border-orange-100/80 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="border-b border-orange-100/80 bg-gradient-to-r from-orange-50/90 via-amber-50/80 to-rose-50/90 px-6 py-10 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm text-orange-700 shadow-sm">
                <BookOpen className="h-4 w-4" />
                <span>{eyebrow}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {title}
                </h1>
                {audienceLabel ? (
                  <span className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-sm text-orange-700">
                    {audienceLabel}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-orange-100 bg-[#fffaf8] lg:border-b-0 lg:border-r">
              <div className="p-6 sm:p-8">
                <div className="mb-4">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-500">
                    On this page
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Use this navigation to jump between handbook sections.
                  </p>
                </div>

                {navItems.length > 0 ? (
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const isActive = currentPath === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block rounded-2xl border px-4 py-3 transition-all ${
                            isActive
                              ? "border-orange-200 bg-white shadow-sm"
                              : "border-transparent bg-transparent hover:border-orange-100 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.title}
                              </p>
                              {item.description ? (
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-white/60 px-4 py-5 text-sm text-gray-500">
                    Add `navItems` to show section navigation here.
                  </div>
                )}
              </div>
            </aside>

            <main className="min-w-0 bg-white">
              <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                <div className="prose prose-gray max-w-none prose-headings:scroll-mt-24 prose-headings:text-slate-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-slate-900">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}